FROM node:20-alpine
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/api ./apps/api
COPY libs ./libs
RUN npm install --workspace @meridian/api --include-workspace-root
RUN npm run build --workspace @meridian/api
ENV NODE_ENV=production
ENV API_PORT=3000
EXPOSE 3000
CMD ["node", "apps/api/dist/server.js"]
