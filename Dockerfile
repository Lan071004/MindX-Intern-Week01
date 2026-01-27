# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package.json tsconfig.json .eslintrc.cjs ./
COPY src ./src

RUN npm install --production=false
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]

