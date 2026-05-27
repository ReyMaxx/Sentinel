# 1. Usamos una versión oficial de Node.js como imagen base
FROM node:18-alpine

# 2. Creamos y definimos el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiamos los archivos de dependencias primero (para aprovechar la caché de Docker)
COPY package*.json ./

# 4. Instalamos las dependencias de la aplicación
RUN npm install --production

# 5. Copiamos el resto del código de tu aplicación al contenedor
COPY . .

# 6. Exponemos el puerto en el que corre tu app (según tu código es el 4000)
EXPOSE 4000

# 7. Comando para arrancar la aplicación
CMD [ "node", "index.js" ]