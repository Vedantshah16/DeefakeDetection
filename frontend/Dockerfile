# =============================================
#  TrueSight AI — Frontend
#  React + Vite → Nginx static serving
# =============================================

# ── Stage 1: Build ───────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Cache npm install layer separately
COPY package.json package-lock.json ./
RUN npm ci

# Accept backend URL as build arg (baked into JS bundle by Vite)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the SPA
COPY . .
RUN npm run build

# ── Stage 2: Serve ───────────────────────────
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing config (all paths → index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
