FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Install everything (including devDependencies like tsx)
RUN npm ci
COPY . .
# Inject env keys
RUN cp .env.local .env || cp .env.example .env
# Compile the Vite frontend bundle into /dist
RUN npm run build

# Enforce production mode for Express static serving
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
