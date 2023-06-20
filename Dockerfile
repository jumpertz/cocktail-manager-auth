# Étape de construction
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

COPY . .

RUN npm run build

# Étape de production
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production --ignore-scripts

COPY --from=build /app/dist /app/dist

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
