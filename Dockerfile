FROM node:16-buster-slim

RUN apt-get update && \
    apt-get install -y python3.7 python3-pip

RUN pip3 install --no-cache-dir --upgrade pip

ADD . /app
WORKDIR /app

RUN npm ci

WORKDIR /app/codespace

RUN pip3 install --no-cache-dir -r requirements.txt

WORKDIR /app

EXPOSE 3000

CMD ["node", "app.js"]
