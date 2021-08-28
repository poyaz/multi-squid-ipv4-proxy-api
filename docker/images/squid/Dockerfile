FROM alpine:3.12

RUN apk add --no-cache bash apache2-utils squid=4.15-r0

VOLUME /etc/squid/

CMD squid -d 1 --foreground -f /etc/squid/squid.conf
