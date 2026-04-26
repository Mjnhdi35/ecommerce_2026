FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci

FROM deps AS builder
COPY tsconfig.json ./
COPY apps/api/tsconfig.json apps/api/tsconfig.json
COPY apps/api/tsconfig.eslint.json apps/api/tsconfig.eslint.json
COPY apps/api/src apps/api/src
RUN npm --workspace apps/api run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci --omit=dev --workspace apps/api && npm cache clean --force
COPY --from=builder /app/apps/api/dist apps/api/dist
EXPOSE 3000
CMD ["npm", "--workspace", "apps/api", "run", "start"]
