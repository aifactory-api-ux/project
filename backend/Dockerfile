FROM node:20.11.1-alpine3.19 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install && npm cache clean --force

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20.11.1-alpine3.19

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

USER nodejs

EXPOSE 23001

CMD ["sh", "-c", "node dist/index.js"]