#!/usr/bin/env bash

DIRNAME=$(realpath $0 | rev | cut -d'/' -f2- | rev)
readonly DIRNAME

DEFAULT_NODE_ENV_FILE="${DIRNAME}/env/node/.env"
readonly DEFAULT_NODE_ENV_FILE

DEFAULT_PG_ENV_FILE="${DIRNAME}/env/pg/.env"
readonly DEFAULT_PG_ENV_FILE

DEFAULT_PG_IP="10.102.0.3"
readonly DEFAULT_PG_IP

DEFAULT_PG_DATABASE="postgres"
readonly DEFAULT_PG_DATABASE

DEFAULT_PG_USERNAME="postgres"
readonly DEFAULT_PG_USERNAME

DEFAULT_DOCKER_PROXY_IP="10.102.0.4"
readonly DEFAULT_DOCKER_PROXY_IP

DEFAULT_SQUID_PER_IP_COUNT=100
readonly DEFAULT_SQUID_PER_IP_COUNT

############
### function
############

function _version() {
  echo "0.1.0"
  echo ""
  exit
}

function _usage() {
  echo -e "Multiply IPv4 proxy\n"
  echo -e "Usage:"
  echo -e "  bash $0 [OPTIONS...]\n"
  echo -e "Options:"
  echo -e "      --install\t\t\tInstall dependency"
  echo -e "      --init\t\t\tInit webserver and database"
  echo -e "      --restart\t\t\tRestart all service"
  echo -e "      --token\t\t\tGet token"
  echo -e "      --init-cluster\t\tCreate server with cluster"
  echo -e "      --join-cluster\t\tJoin new server to exist cluster"
  echo -e "      --fetch-cluster\t\tFetch cluster token from exist node"
  echo ""
  echo -e "  -v, --version\t\t\tShow version information and exit"
  echo -e "  -h, --help\t\t\tShow help"
  echo ""

  exit
}

function _find_distro() {
  local os=$(cat /etc/os-release)
  local regex="ID=([a-zA-Z\"]+)\s"
  local distro

  while [[ $os =~ $regex ]]; do
    distro="${BASH_REMATCH[1]//[\"]/}"
    if [[ ${distro} != "" ]]; then
      break
    fi

    regex=${regex#*"${BASH_REMATCH[1]}"}
  done

  echo $distro
}

function _install() {
  echo "[INFO] Install dependency"

  local DISTRO=$(_find_distro)
  readonly DISTRO

  local EXEC_WITH_SUDO=0
  sudo >/dev/null 2>&1
  if [[ $? -eq 0 ]]; then
    EXEC_WITH_SUDO=1
  fi
  readonly EXEC_WITH_SUDO

  case ${DISTRO} in
  debian | ubuntu)
    if [[ ${EXEC_WITH_SUDO} -eq 1 ]]; then
      sudo apt update

      sudo apt install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg-agent \
        software-properties-common \
        jq

      curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -

      sudo apt-key fingerprint 0EBFCD88

      sudo add-apt-repository \
        "deb [arch=amd64] https://download.docker.com/linux/debian \
                    $(lsb_release -cs) \
                    stable"

      sudo apt update

      sudo apt install -y docker-ce docker-ce-cli containerd.io
    else
      apt update

      apt install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg-agent \
        software-properties-common \
        jq

      curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -

      apt-key fingerprint 0EBFCD88

      add-apt-repository \
        "deb [arch=amd64] https://download.docker.com/linux/debian \
                    $(lsb_release -cs) \
                    stable"

      apt update

      apt install -y docker-ce docker-ce-cli containerd.io
    fi
    ;;

  centos)
    yum install -y yum-utils epel-release

    yum-config-manager \
      --add-repo \
      https://download.docker.com/linux/centos/docker-ce.repo

    yum install -y docker-ce docker-ce-cli containerd.io jq
    ;;
  esac

  curl -L https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose

  if [[ ${EXEC_WITH_SUDO} -eq 1 ]]; then
    sudo sed -e "s/--containerd=.\+\/containerd.sock//g" /lib/systemd/system/docker.service | sudo tee /etc/systemd/system/docker.service

    sudo systemctl daemon-reload

    sudo systemctl start docker

    sudo systemctl enable docker
  else
    sed -e "s/--containerd=.\+\/containerd.sock//g" /lib/systemd/system/docker.service >/etc/systemd/system/docker.service

    systemctl daemon-reload

    systemctl start docker

    systemctl enable docker
  fi

  exit
}

function _check_dependency() {
  local DISTRO=$(_find_distro)
  readonly DISTRO

  case ${DISTRO} in
  debian | ubuntu)
    dpkg -l docker >/dev/null 2>&1

    if ! [[ $? -eq 0 ]]; then
      echo -e "[ERR] Need install dependency\n"
      echo -e "Please use below command:"
      echo -e "  bash $0 --install"
      echo ""

      exit 1
    fi

    dpkg -l jq >/dev/null 2>&1

    if ! [[ $? -eq 0 ]]; then
      echo -e "[ERR] Need install dependency\n"
      echo -e "Please use below command:"
      echo -e "  bash $0 --install"
      echo ""

      exit 1
    fi
    ;;

  centos)
    centos_check=$(rpm -qa docker-ce jq | wc -l)

    if ! [[ ${centos_check} -eq 2 ]]; then
      echo -e "[ERR] Need install dependency\n"
      echo -e "Please use below command:"
      echo -e "  bash $0 --install"
      echo ""

      exit 1
    fi
    ;;
  esac
}

#############
### Arguments
#############

execute_mode=
cluster_mode="single"

POSITIONAL=()
while [[ $# -gt 0 ]]; do
  key="$1"

  case ${key} in
  --install)
    _install
    shift
    ;;

  --init)
    execute_mode="init"
    shift
    ;;

  --restart)
    execute_mode="restart"
    shift
    ;;

  --token)
    execute_mode="token"
    shift
    ;;

  --fetch-cluster)
    execute_mode="fetch"
    shift
    ;;

  --init-cluster)
    execute_mode="init"
    cluster_mode="master"
    shift
    ;;

  --join-cluster)
    execute_mode="init"
    cluster_mode="child"
    shift
    ;;

  -v | --version)
    _version
    shift
    ;;

  -h | --help)
    _usage
    shift
    ;;

  *)
    # _usage
    shift
    ;;
  esac
done

set -- "${POSITIONAL[@]}"

############
### business
############

_check_dependency

if [[ $execute_mode == "init" ]]; then
  if [[ -f $DEFAULT_NODE_ENV_FILE ]] && [[ -f $DEFAULT_PG_ENV_FILE ]]; then
    echo "[WARN] The service is already initialized!"
    exit
  fi

  read -p "Enter webserver ip: " WEBSERVER_IP
  if [[ -z ${WEBSERVER_IP} ]]; then
    echo "[ERR] Please enter webserver ip"
    echo ""

    exit 1
  fi

  read -p "Enter webserver port: " WEBSERVER_PORT
  if [[ -z ${WEBSERVER_PORT} ]]; then
    echo "[ERR] Please enter webserver port"
    echo ""

    exit 1
  fi

  if [[ ${cluster_mode} == "master" ]]; then
    read -s -p "Enter custom share key: " SHARE_KEY
    if [[ -z ${SHARE_KEY} ]]; then
      echo "[ERR] Please enter share key"
      echo ""

      exit 1
    fi

    echo ""
  fi

  if [[ ${cluster_mode} == "child" ]]; then
    read -s -p "Enter master share key: " SHARE_KEY
    if [[ -z ${SHARE_KEY} ]]; then
      echo "[ERR] Please enter share key"
      echo ""

      exit 1
    fi

    echo ""

    read -p "Enter master file token (default address: $DIRNAME/storage/temp/master.key.txt): " MASTER_TOKEN_FILE
    if [[ -z ${MASTER_TOKEN_FILE} ]]; then
      MASTER_TOKEN_FILE="$DIRNAME/storage/temp/master.key.txt"
    fi
  fi

  cp "$DEFAULT_NODE_ENV_FILE.example" $DEFAULT_NODE_ENV_FILE
  cp "$DEFAULT_PG_ENV_FILE.example" $DEFAULT_PG_ENV_FILE

  if [[ ${cluster_mode} == 'child' ]]; then
    docker run --rm -it -v "$MASTER_TOKEN_FILE":/tmp/master.key.txt postgres:11.10 bash -c 'cat /tmp/master.key.txt | openssl enc -d -des3 -base64 -pass pass:$SHARE_KEY >/dev/null 2>&1'
    if ! [[ $? -eq 0 ]]; then
      rm -f $DEFAULT_NODE_ENV_FILE $DEFAULT_PG_ENV_FILE

      echo "[ERR] Your share key is invalid!"
      exit 1
    fi

    JSON_DATA=$(docker run --rm -it -v "$MASTER_TOKEN_FILE":/tmp/master.key.txt postgres:11.10 bash -c 'cat /tmp/master.key.txt | openssl enc -d -des3 -base64 -pass pass:$SHARE_KEY')

    PG_PASSWORD=$(echo $JSON_DATA | jq -r '.pg_pass')
    JWT_TOKEN=$(echo $JSON_DATA | jq -r '.jwt_secret')

    echo "[INFO] Please wait for init cluster service ..."

    API_TOKEN=$(docker-compose -f docker-compose.yml run --rm --no-deps --entrypoint="" -e "JWT_SECRET_KEY=$JWT_TOKEN" node sh -c 'npm install --production &> /dev/null; node scripts/cli.js generate-token' 2>/dev/null)

    if ! [[ -f /etc/timezone ]]; then
      echo $(timedatectl status | grep "zone" | sed -e 's/^[ ]*Time zone: \(.*\) (.*)$/\1/g') >>/etc/timezone
    fi

    SED_DIRNAME_REPLACE=$(echo $DIRNAME | sed 's/\//\\\//g')

    TIMEZONE_DATA=$(cat /etc/timezone | sed 's/\//\\\//g')

    PG_HOST=$(echo $JSON_DATA | jq -r '.pg_host')
    PG_PORT=$(echo $JSON_DATA | jq -r '.pg_port')
    PG_DB=$(echo $JSON_DATA | jq -r '.pg_db')
    PG_USER=$(echo $JSON_DATA | jq -r '.pg_user')
    PG_PASS=$(echo $JSON_DATA | jq -r '.pg_pass')

    sed -i \
      -e "s/TZ=/TZ=$TIMEZONE_DATA/g" \
      -e "s/NODE_ENV=/NODE_ENV=product/g" \
      -e "s/SERVER_HOST=/SERVER_HOST=$WEBSERVER_IP/g" \
      -e "s/SERVER_HTTP_PORT=/SERVER_HTTP_PORT=$WEBSERVER_PORT/g" \
      -e "s/SERVER_PUBLIC_HOST=/SERVER_PUBLIC_HOST=$WEBSERVER_IP/g" \
      -e "s/SERVER_PUBLIC_HTTP_PORT=/SERVER_PUBLIC_HTTP_PORT=$WEBSERVER_PORT/g" \
      -e "s/DB_PG_HOST=/DB_PG_HOST=$PG_HOST/g" \
      -e "s/DB_PG_PORT=/DB_PG_PORT=$PG_PORT/g" \
      -e "s/DB_PG_DATABASE=/DB_PG_DATABASE=$PG_DB/g" \
      -e "s/DB_PG_USERNAME=/DB_PG_USERNAME=$PG_USER/g" \
      -e "s/DB_PG_PASSWORD=/DB_PG_PASSWORD=$PG_PASS/g" \
      -e "s/REAL_PROJECT_PATH_FOR_DOCKER=/REAL_PROJECT_PATH_FOR_DOCKER=$SED_DIRNAME_REPLACE/g" \
      -e "s/SQUID_PER_IP_INSTANCE=/SQUID_PER_IP_INSTANCE=$DEFAULT_SQUID_PER_IP_COUNT/g" \
      -e "s/SQUID_SCRIPT_API_TOKEN=/SQUID_SCRIPT_API_TOKEN=Bearer $API_TOKEN/g" \
      -e "s/TIMEZONE_ZONE=/TIMEZONE_ZONE=$TIMEZONE_DATA/g" \
      -e "s/DOCKER_HOST=/DOCKER_HOST=$DEFAULT_DOCKER_PROXY_IP/g" \
      -e "s/JWT_SECRET_KEY=/JWT_SECRET_KEY=$JWT_TOKEN/g" \
      "$DEFAULT_NODE_ENV_FILE"

      if [[ $? -eq 1 ]]; then
        rm -f $DEFAULT_NODE_ENV_FILE $DEFAULT_PG_ENV_FILE

        echo "[ERR] Fail to execute sed command"
        exit 1
      fi

    PG_HOST=$PG_HOST PG_PORT=$PG_PORT docker-compose -f docker-compose.yml -f docker/docker-compose.env.yml up -d node docker-proxy build-squid-image
  else
    GENERATE_PG_PASSWORD=$(
      tr -dc A-Za-z0-9 </dev/urandom | head -c 13
      echo ''
    )
    GENERATE_JWT_TOKEN=$(
      tr -dc A-Za-z0-9 </dev/urandom | head -c 13
      echo ''
    )

    SED_DIRNAME_REPLACE=$(echo $DIRNAME | sed 's/\//\\\//g')

    echo "[INFO] Please wait for init service ..."

    API_TOKEN=$(docker-compose -f docker-compose.yml run --rm --no-deps --entrypoint="" -e "JWT_SECRET_KEY=$GENERATE_JWT_TOKEN" node sh -c 'npm install --production &> /dev/null; node scripts/cli.js generate-token' 2>/dev/null)

    if ! [[ -f /etc/timezone ]]; then
      echo $(timedatectl status | grep "zone" | sed -e 's/^[ ]*Time zone: \(.*\) (.*)$/\1/g') >>/etc/timezone
    fi

    TIMEZONE_DATA=$(cat /etc/timezone | sed 's/\//\\\//g')

    sed -i \
      -e "s/TZ=/TZ=$TIMEZONE_DATA/g" \
      -e "s/NODE_ENV=/NODE_ENV=product/g" \
      -e "s/SERVER_HOST=/SERVER_HOST=$WEBSERVER_IP/g" \
      -e "s/SERVER_HTTP_PORT=/SERVER_HTTP_PORT=$WEBSERVER_PORT/g" \
      -e "s/SERVER_PUBLIC_HOST=/SERVER_PUBLIC_HOST=$WEBSERVER_IP/g" \
      -e "s/SERVER_PUBLIC_HTTP_PORT=/SERVER_PUBLIC_HTTP_PORT=$WEBSERVER_PORT/g" \
      -e "s/DB_PG_HOST=/DB_PG_HOST=$DEFAULT_PG_IP/g" \
      -e "s/DB_PG_DATABASE=/DB_PG_DATABASE=$DEFAULT_PG_DATABASE/g" \
      -e "s/DB_PG_USERNAME=/DB_PG_USERNAME=$DEFAULT_PG_USERNAME/g" \
      -e "s/DB_PG_PASSWORD=/DB_PG_PASSWORD=$GENERATE_PG_PASSWORD/g" \
      -e "s/REAL_PROJECT_PATH_FOR_DOCKER=/REAL_PROJECT_PATH_FOR_DOCKER=$SED_DIRNAME_REPLACE/g" \
      -e "s/SQUID_PER_IP_INSTANCE=/SQUID_PER_IP_INSTANCE=$DEFAULT_SQUID_PER_IP_COUNT/g" \
      -e "s/SQUID_SCRIPT_API_TOKEN=/SQUID_SCRIPT_API_TOKEN=Bearer $API_TOKEN/g" \
      -e "s/TIMEZONE_ZONE=/TIMEZONE_ZONE=$TIMEZONE_DATA/g" \
      -e "s/DOCKER_HOST=/DOCKER_HOST=$DEFAULT_DOCKER_PROXY_IP/g" \
      -e "s/JWT_SECRET_KEY=/JWT_SECRET_KEY=$GENERATE_JWT_TOKEN/g" \
      "$DEFAULT_NODE_ENV_FILE"

    sed -i \
      -e "s/TZ=/TZ=$TIMEZONE_DATA/g" \
      -e "s/POSTGRES_PASSWORD=/POSTGRES_PASSWORD=$GENERATE_PG_PASSWORD/g" \
      "$DEFAULT_PG_ENV_FILE"

    if [[ ${cluster_mode} == "master" ]]; then
      GENERATE_MASTER_JSON=$(
        jq --null-input \
          --arg pg_host "$WEBSERVER_IP" \
          --arg pg_port "5432" \
          --arg pg_db "$DEFAULT_PG_DATABASE" \
          --arg pg_user "$DEFAULT_PG_USERNAME" \
          --arg pg_pass "$GENERATE_PG_PASSWORD" \
          --arg jwt_secret "$GENERATE_JWT_TOKEN" \
          '{"pg_host": $pg_host, "pg_port": $pg_port, "pg_db": $pg_db, "pg_user": $pg_user, "pg_pass": $pg_pass, "jwt_secret": $jwt_secret}'
      )

      echo $GENERATE_MASTER_JSON >"$DIRNAME/storage/temp/cluster.json"
      GENERATE_MASTER_TOKEN=$(docker run --rm -v "$DIRNAME/storage/temp/cluster.json":/tmp/cluster.json -it postgres:11.10 bash -c 'cat /tmp/cluster.json | openssl enc -e -des3 -base64 -pass pass:$SHARE_KEY')
      rm -f "$DIRNAME/storage/temp/cluster.json"
      echo "[INFO] Please copy you master token and use when want join nodes to cluster:"
      echo "$GENERATE_MASTER_TOKEN"

      echo ""
      echo "$GENERATE_MASTER_TOKEN" >"$DIRNAME/storage/temp/master.key.txt"
      echo "[INFO] This key store in $DIRNAME/storage/temp/master.key.txt"
    fi

    docker-compose -f docker-compose.yml -f docker/docker-compose.env.yml up -d
  fi

  exit
fi

if [[ $execute_mode == "restart" ]]; then
  if ! [[ -f $DEFAULT_NODE_ENV_FILE ]]; then
    echo "[ERR] Please init service! Usage: bash $0 --init"
    exit
  fi

  docker-compose -f docker-compose.yml -f docker/docker-compose.env.yml restart
  exit
fi

if [[ $execute_mode == "token" ]]; then
  if ! [[ -f $DEFAULT_NODE_ENV_FILE ]]; then
    echo "[ERR] Please init service! Usage: bash $0 --init"
    exit
  fi

  token=$(docker-compose -f docker-compose.yml -f docker/docker-compose.env.yml exec node sh -c 'node scripts/cli.js generate-token' 2>/dev/null)
  echo $token
  exit
fi

if [[ $execute_mode == "fetch" ]]; then
  read -s -p "Enter custom share key: " SHARE_KEY
  if [[ -z ${SHARE_KEY} ]]; then
    echo "[ERR] Please enter share key"
    echo ""

    exit 1
  fi

  echo ""

  PG_HOST=$(sed -n "s/^DB_PG_HOST=\(.*\)$/\1/p" "$DEFAULT_NODE_ENV_FILE")
  PG_PORT=$(sed -n "s/^DB_PG_PORT=\(.*\)$/\1/p" "$DEFAULT_NODE_ENV_FILE")
  if [[ -z ${PG_PORT} ]]; then
    PG_PORT=5432
  fi
  PG_DB=$(sed -n "s/^DB_PG_DATABASE=\(.*\)$/\1/p" "$DEFAULT_NODE_ENV_FILE")
  PG_USER=$(sed -n "s/^DB_PG_USERNAME=\(.*\)$/\1/p" "$DEFAULT_NODE_ENV_FILE")
  PG_PASS=$(sed -n "s/^DB_PG_PASSWORD=\(.*\)$/\1/p" "$DEFAULT_NODE_ENV_FILE")
  JWT_SECRET=$(sed -n "s/^JWT_SECRET_KEY=\(.*\)$/\1/p" "$DEFAULT_NODE_ENV_FILE")

  GENERATE_FETCH_JSON=$(
    jq --null-input \
      --arg pg_host "$PG_HOST" \
      --arg pg_port "$PG_PORT" \
      --arg pg_db "$PG_DB" \
      --arg pg_user "$PG_USER" \
      --arg pg_pass "$PG_PASS" \
      --arg jwt_secret "$JWT_SECRET" \
      '{"pg_host": $pg_host, "pg_port": $pg_port, "pg_db": $pg_db, "pg_user": $pg_user, "pg_pass": $pg_pass, "jwt_secret": $jwt_secret}'
  )

  echo $GENERATE_FETCH_JSON >"$DIRNAME/storage/temp/cluster.json"
  GENERATE_FETCH_TOKEN=$(docker run --rm -v "$DIRNAME/storage/temp/cluster.json":/tmp/cluster.json -it postgres:11.10 bash -c 'cat /tmp/cluster.json | openssl enc -e -des3 -base64 -pass pass:$SHARE_KEY')
  rm -f "$DIRNAME/storage/temp/cluster.json"
  echo "[INFO] Please copy you master token and use when want join nodes to cluster:"
  echo "$GENERATE_FETCH_TOKEN"

  echo ""
  echo "$GENERATE_FETCH_TOKEN" >"$DIRNAME/storage/temp/master.key.txt"
  echo "[INFO] This key store in $DIRNAME/storage/temp/master.key.txt"

  exit
fi

echo "[ERR] Not valid option for execute"
exit 1
