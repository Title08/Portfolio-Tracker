FROM node:24-alpine

# Install mkcert and required dependencies
RUN apk add --no-cache nss-tools ca-certificates curl && \
    curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/arm64" && \
    chmod +x mkcert-v*-linux-arm64 && \
    mv mkcert-v*-linux-arm64 /usr/local/bin/mkcert

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Generate certificates if they don't exist
RUN mkdir -p /app/certs && \
    mkcert -install && \
    mkcert -key-file /app/certs/localhost-key.pem -cert-file /app/certs/localhost.pem localhost 127.0.0.1 ::1 || true

EXPOSE 5173
CMD ["npm", "run", "dev:https", "--", "--host"]
