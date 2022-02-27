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

  #  while [[ $os =~ $regex ]]; do
  #    distro="${BASH_REMATCH[1]//[\"]/}"
  #    if [[ ${distro} != "" ]]; then
  #      break
  #    fi
  #
  #    regex=${regex#*"${BASH_REMATCH[1]}"}
  #  done

  echo $distro
}

function _install() {
  echo "[INFO] Install dependency"

  local DISTRO=$(_find_distro)
  readonly DISTRO

  local EXEC_WIT_SUDO=0
  sudo >/dev/null 2>&1
  if [[ $? -eq 0 ]]; then
    EXEC_WIT_SUDO=1
  fi
  readonly EXEC_WIT_SUDO

  case ${DISTRO} in
  debian | ubuntu)
    if [[ ${EXEC_WIT_SUDO} -eq 1 ]]; then
      sudo apt update

      sudo apt install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg-agent \
        software-properties-common

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
        software-properties-common

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
    yum install -y yum-utils

    yum-config-manager \
      --add-repo \
      https://download.docker.com/linux/centos/docker-ce.repo

    yum install -y docker-ce docker-ce-cli containerd.io
    ;;
  esac

  curl -L https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose

  sed -e "s/--containerd=.\+\/containerd.sock//g" /lib/systemd/system/docker.service > /etc/systemd/system/docker.service

  if [[ ${EXEC_WIT_SUDO} -eq 1 ]]; then
    sudo systemctl daemon-reload

    sudo systemctl start docker

    sudo systemctl enable docker
  else
    sudo systemctl daemon-reload

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
    ;;

  centos)
    centos_check=$(rpm -qa docker | wc -l)

    if ! [[ ${centos_check} -eq 1 ]]; then
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

  cp "$DEFAULT_NODE_ENV_FILE.example" $DEFAULT_NODE_ENV_FILE
  cp "$DEFAULT_PG_ENV_FILE.example" $DEFAULT_PG_ENV_FILE

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
    echo $(timedatectl status | grep "zone" | sed -e 's/^[ ]*Time zone: \(.*\) (.*)$/\1/g') >> /etc/timezone
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

  docker-compose -f docker-compose.yml -f docker/docker-compose.env.yml up -d
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

echo "[ERR] Not valid option for execute"
exit 1
