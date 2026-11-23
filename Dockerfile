# Multi-stage production build for LabLink
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm install --prefix backend
RUN npm install --prefix frontend

# Copy all source code
COPY backend ./backend
COPY frontend ./frontend
COPY scripts ./scripts

# Build frontend and backend
RUN npm run build

# Seed database with initial demonstration catalog
RUN npm run seed

# Production image
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY package.json ./
COPY backend/package.json ./backend/

# Install only production dependencies
RUN npm install --prefix backend --omit=dev

# Copy compiled artifacts and seeded database
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/src/db/schema.sql ./backend/dist/db/schema.sql
COPY --from=builder /app/backend/dev.db ./backend/dev.db

EXPOSE 5000

CMD ["node", "backend/dist/index.js"]
