
FROM node:18-alpine as base
WORKDIR /app
RUN apk add --no-cache make
RUN apk upgrade --available
RUN apk add --no-cache --virtual .gyp python3 make g++
RUN apk upgrade --available
COPY . .
RUN npm install --force
RUN npm install -g typescript
ENV NODE_ENV=production

FROM scratch as production-build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base lib/ /lib/
COPY --from=base usr/ /usr/
COPY --from=base app/ /app/
COPY --from=base bin/ /bin/
EXPOSE 3030

ENV NODE_ENV production

CMD ["npm", "run", "start"]
