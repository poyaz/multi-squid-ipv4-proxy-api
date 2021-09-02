#!/bin/bash

echo "" >/tmp/squid-block-url.log

while true; do

  read line
  if [[ -z $line ]]; then
    sleep 1
    continue
  fi

  user=$(echo $line | cut -d" " -f1)
  url=$(echo $line | cut -d" " -f2 | cut -d":" -f1)

  echo "[INFO] Received stdin data '$line'" >>/tmp/squid-block-url.log
  echo -n "       |-> Check access for user '$user' to '$url' => " >>/tmp/squid-block-url.log

  api_output=$(curl -w "|%{http_code}" -s -X GET -H 'content-type: application/json' -H 'authorization: '"$API_TOKEN" "$API_URL/api/v1/user/$user/domain/$url/status")

  api_data=''
  api_status_code=''

  regex="(.+)\|([0-9]+)"
  for f in "$api_output"; do
    if [[ $f =~ $regex ]]; then
      api_data="${BASH_REMATCH[1]}"
      api_status_code="${BASH_REMATCH[2]}"
    fi
  done

  if [[ ! $api_status_code == "200" ]]; then
    echo -n "fail" >>/tmp/squid-block-url.log
    echo -en "\n[ERR] Fail fetch data from API with status code $api_status_code" >>/tmp/squid-block-url.log

    echo "ERR"
    continue
  fi

  api_data_status=$(echo $api_data | jq '.status')
  if [[ ! $api_data_status == '"success"' ]]; then
    api_data_error=$(echo $api_data | jq '.error')
    echo -n "fail" >>/tmp/squid-block-url.log
    echo -en "\n[ERR] Fail fetch data from API with status data error. Error: $api_data_error" >>/tmp/squid-block-url.log

    echo "ERR"
    continue
  fi

  is_block_domain=$(echo $api_data | jq '.data.isBlock')
  if [[ $is_block_domain == true ]]; then
    echo -n "block" >>/tmp/squid-block-url.log

    echo "OK"
  else
    echo -n "no-block" >>/tmp/squid-block-url.log

    echo "ERR"
  fi

  echo "" >>/tmp/squid-block-url.log

done
