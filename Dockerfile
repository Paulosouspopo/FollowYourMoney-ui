# Image du front : build Vite puis Caddy (fichiers statiques + proxy /api + HTTPS). Voir Caddyfile.
FROM node:24-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# API sur la même origine (/api, valeur par défaut du client) : aucune VITE_API_URL
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /src/dist /srv
