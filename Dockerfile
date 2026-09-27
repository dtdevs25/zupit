FROM oven/bun:latest as builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .
RUN bun run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["bun", "server.ts"]
