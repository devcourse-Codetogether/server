FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# prisma generate 추가
RUN npx prisma generate

# NestJS build
RUN npm run build

CMD ["node", "dist/main"]
