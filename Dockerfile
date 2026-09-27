FROM oven/bun:latest as builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .
RUN bun run build

EXPOSE 3000

CMD ["bun", "server.ts"]
