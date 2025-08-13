FROM oven/bun:latest

EXPOSE 3000

WORKDIR /app

COPY package.json ./
COPY bun.lock ./
RUN bun install

COPY . .

CMD ["bun", "run", "dev"]
