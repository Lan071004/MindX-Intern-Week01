# ===== Build stage =====
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ===== Production stage =====
FROM node:18-alpine

WORKDIR /app

# Chỉ install production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output từ build stage
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000
# Trỏ đến path mà K8s secret sẽ mount vào
ENV FIREBASE_SERVICE_ACCOUNT_PATH=/app/secrets/firebase-service-account.json

EXPOSE 3000

CMD ["node", "dist/index.js"]
