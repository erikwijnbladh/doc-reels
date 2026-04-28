FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
COPY api/package.json api/
COPY web/package.json web/

RUN bun install

COPY . .

RUN bun run --cwd web build

EXPOSE 8080
ENV NODE_ENV=production

CMD ["bun", "run", "api/src/index.ts"]
