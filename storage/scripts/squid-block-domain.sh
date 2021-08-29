#!/bin/bash

while true; do

  read line
  if [[ -z $line ]]; then
    sleep 1
    continue
  fi

  user=$(echo $line | cut -d" " -f1)
  url=$(echo $line | cut -d" " -f2 | cut -d":" -f1)

#  echo "[INFO] Received stdin data '$line'" >>/tmp/squid-block-url.log
#  echo -n "       |-> Check access for user '$user' to '$url' => " >>/tmp/squid-block-url.log

  if [[ $url == "google.com" ]]; then
#    echo -n "block" >>/tmp/squid-block-url.log
    echo "OK"
  else
#    echo -n "no-block" >>/tmp/squid-block-url.log
    echo "ERR"
  fi

#  echo "" >>/tmp/squid-block-url.log

done
