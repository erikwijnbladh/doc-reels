FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
COPY api/package.json api/
COPY web/package.json web/

RUN bun install --cwd api
RUN bun install --cwd web

COPY . .

RUN bun run --cwd web build

EXPOSE 3001
ENV NODE_ENV=production

CMD ["bun", "run", "api/src/index.ts"]
