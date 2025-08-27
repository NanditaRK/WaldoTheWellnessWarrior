FROM node:20-bullseye AS builder

WORKDIR /app

# Install dependencies and prisma
COPY package.json package-lock.json prisma ./
RUN npm ci

# Generate prisma client for container env
RUN npx prisma generate

# Copy rest of the source
COPY . .

RUN npm run build

FROM node:20-bullseye AS runner
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]
