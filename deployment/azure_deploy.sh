#!/bin/bash

# ===================================================================
#   TrueSight AI — Azure Container Apps Deployment Script
# -------------------------------------------------------------------
#  Prerequisites:
#  - Azure CLI (az) installed and logged in (az login)
#  - Docker installed and running
#  - prod.env filled in (cp deployment/prod.env.example deployment/prod.env)
# ===================================================================

set -e

# Ensure Homebrew-installed tools (az, docker, git-lfs) are on PATH
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# ════════════════════════════════════════════════════
# LOAD CONFIGURATION
# ════════════════════════════════════════════════════
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/prod.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: prod.env not found!"
    echo "   cp deployment/prod.env.example deployment/prod.env"
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

# Derived variables
BACKEND_IMAGE="${ACR_NAME}.azurecr.io/${APP_NAME}-backend"
FRONTEND_IMAGE="${ACR_NAME}.azurecr.io/${APP_NAME}-frontend"
# ACA_ENV_NAME / ACA_ENV_RG can be overridden in prod.env to reuse an existing environment
# (Azure student plan allows only 1 Container Apps Environment per region)
ACA_ENV_NAME="${ACA_ENV_NAME:-${APP_NAME}-env}"
ACA_ENV_RG="${ACA_ENV_RG:-${RESOURCE_GROUP}}"
PROJECT_ROOT="${SCRIPT_DIR}/.."

# ════════════════════════════════════════════════════
# COLORS & FORMATTING
# ════════════════════════════════════════════════════
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_step()    { echo -e "\n${BLUE}==>${NC} ${GREEN}$1${NC}"; }
print_error()   { echo -e "${RED}❌ $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_header()  { echo -e "\n${CYAN}╔════════════════════════════════════════════╗\n║  $1\n╚════════════════════════════════════════════╝${NC}"; }
print_warn()    { echo -e "\n${RED}⚠️  $1${NC}"; }

START_TIME=$(date +%s)
show_elapsed() {
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    echo -e "${CYAN}⏱️  Completed in $((ELAPSED / 60))m $((ELAPSED % 60))s${NC}"
}

# ════════════════════════════════════════════════════
# VALIDATE
# ════════════════════════════════════════════════════
phase_validate() {
    print_header "Validating Prerequisites"

    # Check required variables
    for var in APP_NAME ACR_NAME RESOURCE_GROUP LOCATION SECRET_KEY; do
        if [ -z "${!var}" ]; then
            print_error "Missing required variable: $var in prod.env"
            exit 1
        fi
    done

    # Check model weights exist and are not a Git LFS pointer
    MODEL_PATH="${PROJECT_ROOT}/backend/ai_model/models/truesight_finetuned_model.pth"
    if [ ! -f "$MODEL_PATH" ]; then
        print_error "Model file not found: $MODEL_PATH"
        exit 1
    fi
    MODEL_SIZE=$(wc -c < "$MODEL_PATH")
    if [ "$MODEL_SIZE" -lt 1000000 ]; then
        print_error "Model file looks like a Git LFS pointer (only ${MODEL_SIZE} bytes)."
        echo "   Run: git lfs pull"
        exit 1
    fi
    echo "   ✅ Model weights present ($(du -sh "$MODEL_PATH" | cut -f1))"

    # Warn if Firebase SA not set
    if [ -z "$FIREBASE_SA_BASE64" ]; then
        print_warn "FIREBASE_SA_BASE64 is not set. Google/Phone sign-in will be disabled."
        echo "   Encode your service account: base64 -i backend/firebase-service-account.json | tr -d '\\n'"
    else
        echo "   ✅ Firebase service account configured"
    fi

    print_success "Validation complete!"
}

# ════════════════════════════════════════════════════
# PHASE: SETUP
# ════════════════════════════════════════════════════
phase_setup() {
    print_header "Setting up Azure Infrastructure"

    print_step "Creating Resource Group: ${RESOURCE_GROUP}"
    az group create --name "${RESOURCE_GROUP}" --location "${LOCATION}" --output none

    print_step "Creating Azure Container Registry: ${ACR_NAME}"
    if ! az acr show --name "${ACR_NAME}" --resource-group "${RESOURCE_GROUP}" &>/dev/null; then
        az acr create \
            --resource-group "${RESOURCE_GROUP}" \
            --name "${ACR_NAME}" \
            --sku Basic \
            --admin-enabled true \
            --output none
        echo "   ACR created."
    else
        echo "   ACR already exists, skipping."
    fi

    print_step "Looking up Container Apps Environment: ${ACA_ENV_NAME}"
    if az containerapp env show --name "${ACA_ENV_NAME}" --resource-group "${ACA_ENV_RG}" &>/dev/null; then
        ACA_ENV_ID=$(az containerapp env show --name "${ACA_ENV_NAME}" --resource-group "${ACA_ENV_RG}" --query id -o tsv)
        echo "   ✅ Using existing environment '${ACA_ENV_NAME}' in resource group '${ACA_ENV_RG}'"
    else
        echo "   Creating new Container Apps Environment: ${ACA_ENV_NAME}"
        az containerapp env create \
            --name "${ACA_ENV_NAME}" \
            --resource-group "${RESOURCE_GROUP}" \
            --location "${LOCATION}" \
            --output none
        ACA_ENV_RG="${RESOURCE_GROUP}"
        ACA_ENV_ID=$(az containerapp env show --name "${ACA_ENV_NAME}" --resource-group "${RESOURCE_GROUP}" --query id -o tsv)
        echo "   Container Apps Environment created."
    fi

    print_success "Infrastructure setup complete!"
}

# ════════════════════════════════════════════════════
# PHASE: BUILD
# ════════════════════════════════════════════════════
phase_build() {
    print_header "Building & Pushing Docker Images"

    print_step "Logging into ACR..."
    az acr login --name "${ACR_NAME}"

    # ── Backend ──────────────────────────────────────
    print_step "Building backend image..."
    echo "   (PyTorch + EfficientNet-B4 model baked in — this takes a few minutes)"
    docker build \
        --platform linux/amd64 \
        -t "${BACKEND_IMAGE}:latest" \
        "${PROJECT_ROOT}/backend"

    print_step "Pushing backend image..."
    docker push "${BACKEND_IMAGE}:latest"

    # ── Frontend ─────────────────────────────────────
    # We need VITE_API_URL baked in at build time.
    # If it's not set yet (first deploy), warn and build without it.
    # After first deploy, set VITE_API_URL in prod.env and re-run build+deploy.
    if [ -z "$VITE_API_URL" ]; then
        print_warn "VITE_API_URL is not set. Frontend will try to connect to localhost:8000."
        echo "   After the first deploy, set VITE_API_URL=https://<backend-fqdn> in prod.env"
        echo "   then re-run: ./azure_deploy.sh build deploy"
        docker build \
            --platform linux/amd64 \
            -t "${FRONTEND_IMAGE}:latest" \
            "${PROJECT_ROOT}/frontend"
    else
        echo "   Injecting VITE_API_URL=${VITE_API_URL}"
        docker build \
            --platform linux/amd64 \
            --build-arg VITE_API_URL="${VITE_API_URL}" \
            -t "${FRONTEND_IMAGE}:latest" \
            "${PROJECT_ROOT}/frontend"
    fi

    print_step "Pushing frontend image..."
    docker push "${FRONTEND_IMAGE}:latest"

    print_success "Build & Push complete!"
}

# ════════════════════════════════════════════════════
# PHASE: DEPLOY
# ════════════════════════════════════════════════════
phase_deploy() {
    print_header "Deploying to Azure Container Apps"

    # Resolve environment ID (supports cross-resource-group environments)
    ACA_ENV_ID=$(az containerapp env show --name "${ACA_ENV_NAME}" --resource-group "${ACA_ENV_RG}" --query id -o tsv)

    # ── 1. Deploy Backend ─────────────────────────────
    print_step "Deploying backend..."

    # Build env-var list for backend
    BACKEND_ENV_VARS="SECRET_KEY=${SECRET_KEY}"
    if [ -n "$FIREBASE_SA_BASE64" ]; then
        BACKEND_ENV_VARS="${BACKEND_ENV_VARS} FIREBASE_SA_BASE64=${FIREBASE_SA_BASE64}"
    fi

    ACR_PASSWORD=$(az acr credential show --name "${ACR_NAME}" --query "passwords[0].value" -o tsv)

    # Check if backend already exists → update vs create
    if az containerapp show --name "${APP_NAME}-backend" --resource-group "${RESOURCE_GROUP}" &>/dev/null; then
        print_step "Backend already exists — updating image..."
        az containerapp update \
            --name "${APP_NAME}-backend" \
            --resource-group "${RESOURCE_GROUP}" \
            --image "${BACKEND_IMAGE}:latest" \
            --set-env-vars ${BACKEND_ENV_VARS} \
            --output none
        BACKEND_FQDN=$(az containerapp show \
            --name "${APP_NAME}-backend" \
            --resource-group "${RESOURCE_GROUP}" \
            --query "properties.configuration.ingress.fqdn" -o tsv)
    else
        BACKEND_FQDN=$(az containerapp create \
            --name "${APP_NAME}-backend" \
            --resource-group "${RESOURCE_GROUP}" \
            --environment "${ACA_ENV_ID}" \
            --image "${BACKEND_IMAGE}:latest" \
            --registry-server "${ACR_NAME}.azurecr.io" \
            --registry-username "${ACR_NAME}" \
            --registry-password "${ACR_PASSWORD}" \
            --ingress external \
            --target-port 8000 \
            --env-vars ${BACKEND_ENV_VARS} \
            --min-replicas 1 \
            --max-replicas 2 \
            --cpu 0.5 --memory 1.0Gi \
            --query "properties.configuration.ingress.fqdn" -o tsv)
    fi


    BACKEND_URL="https://${BACKEND_FQDN}"
    echo ""
    echo "   🔗 Backend URL: ${BACKEND_URL}"

    # ── 2. Deploy Frontend ────────────────────────────
    print_step "Deploying frontend..."

    if az containerapp show --name "${APP_NAME}-frontend" --resource-group "${RESOURCE_GROUP}" &>/dev/null; then
        print_step "Frontend already exists — updating image..."
        az containerapp update \
            --name "${APP_NAME}-frontend" \
            --resource-group "${RESOURCE_GROUP}" \
            --image "${FRONTEND_IMAGE}:latest" \
            --output none
        FRONTEND_FQDN=$(az containerapp show \
            --name "${APP_NAME}-frontend" \
            --resource-group "${RESOURCE_GROUP}" \
            --query "properties.configuration.ingress.fqdn" -o tsv)
    else
        FRONTEND_FQDN=$(az containerapp create \
            --name "${APP_NAME}-frontend" \
            --resource-group "${RESOURCE_GROUP}" \
            --environment "${ACA_ENV_ID}" \
            --image "${FRONTEND_IMAGE}:latest" \
            --registry-server "${ACR_NAME}.azurecr.io" \
            --registry-username "${ACR_NAME}" \
            --registry-password "${ACR_PASSWORD}" \
            --ingress external \
            --target-port 80 \
            --min-replicas 1 \
            --max-replicas 1 \
            --cpu 0.25 --memory 0.5Gi \
            --query "properties.configuration.ingress.fqdn" -o tsv)
    fi

    FRONTEND_URL="https://${FRONTEND_FQDN}"
    echo "   🔗 Frontend URL: ${FRONTEND_URL}"

    # ── 3. Print next steps ───────────────────────────
    echo ""
    print_success "Deployment complete!"
    echo ""
    echo -e "  ${BOLD}Frontend:${NC} ${FRONTEND_URL}"
    echo -e "  ${BOLD}Backend:${NC}  ${BACKEND_URL}"
    echo ""

    if [ -z "$VITE_API_URL" ]; then
        echo -e "${CYAN}📌 NEXT STEP — Rebuild frontend with the correct API URL:${NC}"
        echo ""
        echo "   1. Open deployment/prod.env and set:"
        echo "      VITE_API_URL=${BACKEND_URL}"
        echo ""
        echo "   2. Re-run:"
        echo "      ./azure_deploy.sh build deploy"
        echo ""
        echo "   (This bakes the backend URL into the JS bundle so the frontend can call it.)"
    else
        echo -e "${CYAN}ℹ️  Firebase note:${NC} Make sure ${FRONTEND_URL} is added to your Firebase"
        echo "   project's Authorized Domains list: Firebase Console → Auth → Settings → Authorized Domains"
    fi
}

# ════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════
case "$1" in
    validate) phase_validate ;;
    setup)    phase_validate && phase_setup ;;
    build)    phase_validate && phase_build ;;
    deploy)   phase_validate && phase_deploy ;;
    all)
        phase_validate
        phase_setup
        phase_build
        phase_deploy
        show_elapsed
        ;;
    *)
        echo ""
        echo "  TrueSight AI — Azure Deployment Script"
        echo ""
        echo "  Usage: ./azure_deploy.sh [command]"
        echo ""
        echo "  Commands:"
        echo "    validate  Check prerequisites (model file, env vars)"
        echo "    setup     Create Azure resource group, ACR, Container Apps environment"
        echo "    build     Build & push Docker images to ACR"
        echo "    deploy    Deploy containers to Azure Container Apps"
        echo "    all       Run all phases in order (first-time setup)"
        echo ""
        echo "  Typical workflow:"
        echo "    1. cp deployment/prod.env.example deployment/prod.env"
        echo "    2. Edit deployment/prod.env"
        echo "    3. ./azure_deploy.sh all"
        echo "    4. Set VITE_API_URL=<backend-url> in prod.env"
        echo "    5. ./azure_deploy.sh build deploy"
        echo ""
        exit 1
        ;;
esac
