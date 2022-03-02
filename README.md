Run service
===========

For run and restart service use this cli

## Usage

```bash
> bash cli.sh --help
Multiply IPv4 proxy

Usage:
  bash cli.sh [OPTIONS...]

Options:
      --install                 Install dependency
      --init                    Init webserver and database
      --restart                 Restart all service
      --token                   Get token
      --init-cluster            Create server with cluster
      --join-cluster            Join new server to exist cluster
      --fetch-cluster           Fetch cluster token from exist node

  -v, --version                 Show version information and exit
  -h, --help                    Show help
```

### Sample

```bash
### Install dependency
> bash cli.sh --install

### Init service
> bash cli.sh --init
Enter webserver ip: 192.168.1.2
Enter webserver port: 8080

### Get api token
> bash cli.sh --token
```

How to deploy
=============

This proxy service design to deploy with two structure

* Single instance
* Cluster instance

## Single instance

For deploy this proxy with single instance you should use `--init` option

```bash
> bash cli.sh --install

> bash cli.sh --init
Enter webserver ip: -- (Step 1)
Enter webserver port: -- (Step 2)
```

After execute command you should fill bellow step:

* Step 1: You should enter your public ip address
* Step 2: Enter webserver port. Server listens this port for execute API

## Cluster instance

For deploy this proxy with single instance you should use two options. At first need start one node with `--init-cluster` and for other nodes need execute with `--join-cluster`

After you deployed cluster service you should add all server with API (You can use `Create new server` API for add a new server). You can use all API in cluster mode after added servers 

### Create first node

For create first cluster node use below command:

```bash
> bash cli.sh --install

> bash cli.sh --init-cluster
Enter webserver ip: -- (Step 1)
Enter webserver port: -- (Step 2)
Enter custom share key: -- (Step 3)
```

After execute command you should fill bellow step:

* Step 1: You should enter your public ip address
* Step 2: Enter webserver port. Server listens this port for execute API
* Step 3: Enter a password for generate token for others node instance

When server runs successfully a token generated and store in `storage/temp/master.key.txt` folder. You should copy this token and use for another node to join in cluster

### Join node to cluster

Now you have a token, and you can join a new instance to cluster. We need to logging in a new server.

Now start a join a new node to cluster you should store your token in a file (Default address is `storage/temp/master.key.txt` but you can store in each file you want)

```bash
> bash cli.sh --install

> bash cli.sh --join-cluster
Enter webserver ip: -- (Step 1)
Enter webserver port: -- (Step 2)
Enter custom share key: -- (Step 3)
Enter master file token: -- (Step 4)
```

After execute command you should fill bellow step:

* Step 1: You should enter your public ip address
* Step 2: Enter webserver port. Server listens this port for execute API
* Step 3: Enter a password you used when execute `bash cli.sh --init-cluster`
* Step 4: Enter a file address you stored token in this file (Default address is `storage/temp/master.key.txt`)

**P.S**

Default token store in `storage/temp/master.key.txt` on a master server but if you forgot cluster token you can use below command in master service and get cluster token:

```bash
> bash cli.sh --fetch-cluster
Enter custom share key: -- (Step 1)
```

After execute command you should fill bellow step:

* Step 1: Enter a password for generate new token for others node instance

API
===

## Generate IP

For generate new IP address you should use this API. If your ip range exist, this job has been skipped

### Information:

* Method: `POST`
* URL: `api/v1/proxy/generate`
* Body: `{"ip": "<your-ip-address>", "mask": <ip-mask>, "gateway": "<your-gateway>", "interface": "<interface-name>"}`

### Body format

* `ip` string ip (Example: **192.168.1.1** or **10.10.10.3**)
* `mask` number mask ip between 1 and 32 (Example: **22** or 24 or **32**)
* `gateway` string ip (Example: **192.168.1.0** or **10.10.10.224**)
* `interface` string (Example: **ens18**)

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/proxy/generate' \
  -d '{"ip": "<your-ip-address>", "mask": <ip-mask>, "gateway": "<your-gateway>", "interface": "<interface-name>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/proxy/generate' \
    -d '{"ip": "192.168.1.1", "mask": 24, "gateway": "192.168.1.224", "interface": "ens192"}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "jobId": "751c4a35-ed2a-489d-870f-b09dc7b0f8a5"
  }
}
```

## Remove IP

For the remove exist IP address you should use this API

### Information:

* Method: `DELETE`
* URL: `api/v1/proxy/ip`
* Body: `{"ip": "<your-ip-address>", "mask": <ip-mask>, "interface": "<interface-name>"}`

### Body format

* `ip` string ip (Example: **192.168.1.1** or **10.10.10.3**)
* `mask` number mask ip between 1 and 32 (Example: **22** or **24** or **32**)
* `interface` string (Example: **ens18**)

```bash
curl \
  -X DELETE \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/proxy/ip' \
  -d '{"ip": "<your-ip-address>", "mask": <ip-mask>, "interface": "<interface-name>"}'
```

### Example:

```bash
curl \
    -X DELETE \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/proxy/ip' \
    -d '{"ip": "192.168.1.1", "mask": 24, "interface": "ens192"}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "jobId": "751c4a35-ed2a-489d-870f-b09dc7b0f8a5"
  }
}
```

## Reload all proxy

Reload all proxy

### Information:

* Method: `POST`
* URL: `api/v1/proxy/reload`

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/proxy/reload'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/proxy/reload'
```

### Output:

```json5
{
  "status": "success"
}
```

## Check job

For check create ip range job finished you should use this API. this api return status about job

### Information:

* Method: `GET`
* URL: `api/v1/job/:jobId`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/job/:jobId'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/job/751c4a35-ed2a-489d-870f-b09dc7b0f8a5'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "751c4a35-ed2a-489d-870f-b09dc7b0f8a5",
    // type of your job (contain: job_remove_ip or job_remove_ip)
    "type": "job_remove_ip",
    // status list: processing, error, finish
    "status": "processing",
    // total ip record should be added
    "totalRecord": 225,
    // total record has been added
    "totalRecordAdd": 25,
    // total record exist in system
    "totalRecordExist": 200,
    // total record delete from system
    "totalRecordDelete": 200,
    // total record has been error
    "totalRecordError": 0
  }
}
```

## Get users

This API use for a get all user

### Information:

* Method: `GET`
* URL: `api/v1/user`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user'
```

### Output:

```json5
{
  "status": "success",
  "data": [
    {
      "id": "ec7c5690-c008-4c13-bf52-ba0bbff06fb0",
      "username": "my_username",
      "isEnable": true,
      "insertDate": "2021-08-29 09:59:40"
    }
  ]
}
```

## Create users

This API use for create new user

### Information:

* Method: `POST`
* URL: `api/v1/user`
* Body: `{"username": "<your-username>", "password": "<your-password>"}`

### Body format

* `username` string with [a-zA-Z0-9_.] between 3 and 20 (Example: **test1** or **test_1** or **test**.1)
* `password` string at least 6 character

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  '<your-hostname-or-ip>/api/v1/user' \
  -d '{"username": "<your-username>", "password": "<your-password>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    '<your-hostname-or-ip>/api/v1/user'
    -d '{"username": "my_username", "password": "this-is-my-password"}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "ec7c5690-c008-4c13-bf52-ba0bbff06fb0",
    "username": "my_username"
  }
}
```

## Login users

This API use for a login user

Output of this API (token) use in below API:

* `GET /v1/user`
* `PUT /v1/user/:username/password`
* `POST /v1/package`
* `PUT /v1/package/:packageId/renew`
* `GET /v1/package/user/:username`

### Information:

* Method: `POST`
* URL: `api/v1/user/login`
* Body: `{"username": "<your-username>", "password": "<your-password>"}`

### Body format

* `username` string with [a-zA-Z0-9_.] between 3 and 20 (Example: **test1** or **test_1** or **test**.1)
* `password` string at least 6 character

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  '<your-hostname-or-ip>/api/v1/user/login' \
  -d '{"username": "<your-username>", "password": "<your-password>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    '<your-hostname-or-ip>/api/v1/user/login'
    -d '{"username": "my_username", "password": "this-is-my-password"}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "token": "token.of.user",
  }
}
```

## Change password

Change password for exist user in system

### Information:

* Method: `PUT`
* URL: `api/v1/user/:username/password`
* Body: `{"password": "<your-new-password>"}`

### Body format

* `password` string at least 6 character

```bash
curl \
  -X PUT \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:username/password' \
  -d '{"password": "<your-new-password>"}'
```

### Example:

```bash
curl \
    -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user/my_username/password'
    -d '{"password": "new-password"}'
```

### Output:

```json5
{
  "status": "success"
}
```

## Disable user proxy

Disable all user's proxy

### Information:

* Method: `PUT`
* URL: `api/v1/user/:username/disable`

```bash
curl \
  -X PUT \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:username/disable'
```

### Example:

```bash
curl \
    -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user/my_username/disable'
```

### Output:

```json5
{
  "status": "success"
}
```

## Enable user proxy

Disable all user's proxy

### Information:

* Method: `PUT`
* URL: `api/v1/user/:username/enable`

```bash
curl \
  -X PUT \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:username/enable'
```

### Example:

```bash
curl \
    -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user/my_username/enable'
```

### Output:

```json5
{
  "status": "success"
}
```

## Block site for user

You can add the blacklist url for users

### Information:

* Method: `POST`
* URL: `api/v1/user/:username/website/block`
* Body: `{"urls": ["<your-url1>", "<your-url2>"], "startDate": "<start-date>", "endDate": "<end-date>"}`

### Body format

* `urls` Array of domain url
* `startDate` Date format for start block time and greater than **now** with a format YYYY-MM-DD HH:mm:ss (Example: **
  2021-09-04 12:02:25**)
* `endDate` Date format for end block time and greater than **startDate** with a format YYYY-MM-DD HH:mm:ss (Example: **
  2021-09-05 12:02:25**)

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:username/website/block' \
  -d '{"urls": ["<your-url1>", "<your-url2>"], "startDate": "<start-date>", "endDate": "<end-date>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user/my_username/website/block' \
    -d '{"urls": ["www.google.com", "google.com"], "startDate": "2021-09-03 12:00:00", "endDate": "2021-09-03 13:00:00"}'
```

### Output:

```json5
{
  "status": "success"
}
```

## Check block domain for user (for squid acl)

Squid ACL check request domain block for user or not

### Information:

* Method: `GET`
* URL: `api/v1/user/:username/domain/:domain/status`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:username/domain/:domain/status'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user/my_username/domain/google.com/status'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "isBlock": true
  }
}
```

## Create package

Create new package for users

### Information:

* Method: `POST`
* URL: `api/v1/package`
* Body: `{"username": "<your-username>", "count": <total-ip-need-use>, "expire": "<expire-date>"}`

### Body format

* `username` string with [a-zA-Z0-9_.] between 3 and 20 (Example: **test1** or **test_1** or **test**.1)
* `count` number greater than equal 1 (Example: **3**)
* `expire` Date format for start block time with a format YYYY-MM-DD (Example: **2021-10-04**)

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/package' \
  -d '{"username": "<your-username>", "count": <total-ip-need-use>, "expire": "<expire-date>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/package'
    -d '{"username": "my_username", "count": 25, "expire": "2021-10-25"}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "cb194947-29b2-47cc-bb7f-24e10d4515e2",
    "username": "my_username",
    "countIp": 1,
    "ipList": [
      {
        "ip": "192.168.1.3",
        "port": 3128
      }
    ],
    "expire": "2021-10-25"
  }
}
```

## Get user package

Get list of user's package

### Information:

* Method: `GET`
* URL: `api/v1/package/user/:username`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/package/user/:username'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/package/user/my_username'
```

### Output:

```json5
{
  "status": "success",
  "data": [
    {
      "id": "cb194947-29b2-47cc-bb7f-24e10d4515e2",
      "username": "my_username",
      "countIp": 25,
      "expireDate": "2021-10-25"
    },
    {
      "id": "ebc143cd-221a-4841-86ff-13687105b99e",
      "username": "my_username",
      "countIp": 10,
      "expireDate": "2021-08-25"
    }
  ]
}
```

## Renew package

If package expire date not end, You can renew expire date

### Information:

* Method: `PUT`
* URL: `api/v1/package/:packageId/renew`
* Body: `{"expire": "<expire-date>"}`

### Body format

* `expire` Date format for start block time with a format YYYY-MM-DD (Example: **2021-10-04**)

```bash
curl \
  -X PUT \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/package/:packageId/renew' \
  -d '{"expire": "<expire-date>"}'
```

### Example:

```bash
curl \
    -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/package/cb194947-29b2-47cc-bb7f-24e10d4515e2/renew' \
    -d '{"expireDate": "2021-11-01"}'
```

### Output:

```json5
{
  "status": "success"
}
```

## Delete package

For a remove exist package

### Information:

* Method: `DELETE`
* URL: `api/v1/package/:packageId`

```bash
curl \
  -X DELETE \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/package/:packageId'
```

### Example:

```bash
curl \
    -X DELETE \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/package/cb194947-29b2-47cc-bb7f-24e10d4515e2'
```

### Output:

```json5
{
  "status": "success"
}
```

## Get all servers

Get list of servers cluster

### Information:

* Method: `GET`
* URL: `api/v1/server`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/server'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/server'
```

### Output:

```json5
{
  "status": "success",
  "data": [
    {
      "id": "751c4a35-ed2a-489d-870f-b09dc7b0f8a5",
      "name": "server-1",
      // list of ip supported by this server
      "ipRange": [
        "192.168.1.1/24",
        "10.10.10.1/32"
      ],
      // Global IP address
      "hostIpAddress": "23.110.2.50",
      // Internal IP or Hostname (Use for NAT network)
      "internalHostIpAddress": "192.168.1.1",
      "hostApiPort": 8080,
      "isEnable": true,
      "insertDate": "2022-01-20 10:02:30"
    }
  ]
}
```

## Create new server

Create new server

### Information:

* Method: `POST`
* URL: `api/v1/server`

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/server' \
  -d '{"name": "<your-server-name>", "ipRange": ["<list-of-ip-with-mask>"], "hostIpAddress": "<your-public-host-ip-address>", "internalHostIpAddress": "<your-internal-host-ip-address>", "hostApiPort": <host-api-port>}'
```

### Body format

* `name` string name (Example: **server-1** or **my-server**)
* `ipRange` Array of ip with a mask (Example: **192.168.1.1/24** or **10.10.10.1/32**)
* `hostIpAddress` string ip or hostname (Example: **192.168.1.0** or **my-domain.con**)
* `hostApiPort` number (Example: **80**)

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/server' \
  -d '{"name": "server-1", "ipRange": ["192.168.1.1/24", "10.10.10.1/32"], "hostIpAddress": "23.110.2.50", "internalHostIpAddress": "192.168.1.1", "hostApiPort": 8080}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "751c4a35-ed2a-489d-870f-b09dc7b0f8a5",
    "name": "server-1",
    // list of ip supported by this server
    "ipRange": [
      "192.168.1.1/24",
      "10.10.10.1/32"
    ],
    // Global IP address
    "hostIpAddress": "23.110.2.50",
    // Internal IP or Hostname (Use for NAT network)
    "internalHostIpAddress": "192.168.1.1",
    "hostApiPort": 8080,
    "isEnable": true,
    "insertDate": "2022-01-20 10:02:30"
  }
}
```

## Update exist server

Update information of server with server id

### Information:

* Method: `PUT`
* URL: `api/v1/server/:id`

```bash
curl \
  -X PUT \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/server/:id' \
  -d '{"name": "<your-server-name>", "ipRange": ["<list-of-ip-with-mask>"], "hostIpAddress": "<your-public-host-ip-address>", "internalHostIpAddress": "<your-internal-host-ip-address>", "hostApiPort": <host-api-port>}'
```

### Body format

* `name` string name (Example: **server-1** or **my-server**)
* `ipRange` Array of ip with a mask (Example: **192.168.1.1/24** or **10.10.10.1/32**)
* `hostIpAddress` string ip or hostname (Example: **192.168.1.0** or **my-domain.con**)
* `hostApiPort` number (Example: **80**)

### Example:

```bash
curl \
    -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/server/751c4a35-ed2a-489d-870f-b09dc7b0f8a5' \
  -d '{"name": "server-1", "ipRange": ["192.168.1.1/24", "10.10.10.1/32"], "hostIpAddress": "23.110.2.50", "internalHostIpAddress": "192.168.1.1", "hostApiPort": 8080}'
```

### Output:

```json5
{
  "status": "success"
}
```

## Remove server

Remove server with server id

### Information:

* Method: `DELETE`
* URL: `api/v1/server/:id`

```bash
curl \
  -X DELETE \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/server/:id'
```

### Example:

```bash
curl \
    -X DELETE \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/server/751c4a35-ed2a-489d-870f-b09dc7b0f8a5'
```

### Output:

```json5
{
  "status": "success"
}
```
