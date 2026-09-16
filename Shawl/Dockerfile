FROM node:24-bookworm-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN rm -rf client-dist/* \
	&& cp index.html client-dist/index.html \
	&& cp hello.html client-dist/hello.html \
	&& cp index.js client-dist/index.js \
	&& cp style.css client-dist/style.css \
	&& cp subhamoy.jpeg client-dist/subhamoy.jpeg \
	&& cp edu.html client-dist/edu.html \
	&& cp edu.css client-dist/edu.css \
	&& mkdir -p client-dist/assets \
	&& cp -R assets/images client-dist/assets/ \
	&& cp -R assets/js client-dist/assets/

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server.js"]
