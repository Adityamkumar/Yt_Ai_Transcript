#Builder stage
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json  ./

RUN npm ci

COPY . .

RUN npm run build


#Runner stage
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 8000

CMD [ "npm", "start" ]