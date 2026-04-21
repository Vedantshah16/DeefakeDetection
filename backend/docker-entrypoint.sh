#!/bin/sh
# =============================================================
#  docker-entrypoint.sh
#  Decodes FIREBASE_SA_BASE64 env var → firebase-service-account.json
#  then exec's the CMD (uvicorn).
# =============================================================
set -e

FIREBASE_SA_PATH="/app/firebase-service-account.json"

if [ -n "$FIREBASE_SA_BASE64" ]; then
    echo "🔑 Decoding Firebase service account from environment variable..."
    echo "$FIREBASE_SA_BASE64" | base64 -d > "$FIREBASE_SA_PATH"
    echo "✅ Firebase service account written to $FIREBASE_SA_PATH"
elif [ -f "$FIREBASE_SA_PATH" ]; then
    echo "✅ Firebase service account file already present."
else
    echo "⚠️  WARNING: No FIREBASE_SA_BASE64 set and no firebase-service-account.json found."
    echo "   Google/Phone sign-in will be disabled. Email/password login still works."
fi

exec "$@"
