# Use uma imagem oficial do Node.js
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência e schema PRIMEIRO para o postinstall funcionar
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instala as dependências (que invocam o prisma generate)
RUN npm ci

# Copia o restante do código fonte
COPY . .

# Gera o cliente Prisma
RUN npx prisma generate

# Expõe a porta que a aplicação vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação em modo de desenvolvimento
CMD ["npm", "run", "dev"]
