FROM alpine:3.12

RUN apk add --no-cache bash apache2-utils squid=4.17-r0 jq curl

VOLUME /etc/squid/

CMD /bin/sh -c "[ -f $SQUID_BLOCK_URL_BASH ] && chmod +x $SQUID_BLOCK_URL_BASH; squid -d 1 --foreground -f /etc/squid/squid.conf"
