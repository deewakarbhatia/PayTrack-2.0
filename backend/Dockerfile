FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node src ./src

USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:5050/metrics').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

EXPOSE 5050

CMD ["node", "src/server.js"]