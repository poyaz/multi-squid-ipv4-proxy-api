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
      --admin-user              Get admin user
      --init-cluster            Create server with cluster
      --join-cluster            Join new server to exist cluster
      --fetch-cluster           Fetch cluster token from exist node
      --discord                 Config Discord oauth for external authenticate
      --oauth                   Config oauth for use in client page (PWA)

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

For deploy this proxy with single instance you should use two options. At first need start one node
with `--init-cluster` and for other nodes need execute with `--join-cluster`

After you deployed cluster service you should add all server with API (You can use `Create new server` API for add a new
server). You can use all API in cluster mode after added servers

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

When server runs successfully a token generated and store in `storage/temp/master.key.txt` folder. You should copy this
token and use for another node to join in cluster

### Join node to cluster

Now you have a token, and you can join a new instance to cluster. We need to logging in a new server.

Now start a join a new node to cluster you should store your token in a file (Default address
is `storage/temp/master.key.txt` but you can store in each file you want)

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

Default token store in `storage/temp/master.key.txt` on a master server but if you forgot cluster token you can use
below command in master service and get cluster token:

```bash
> bash cli.sh --fetch-cluster
Enter custom share key: -- (Step 1)
```

After execute command you should fill bellow step:

* Step 1: Enter a password for generate new token for others node instance

External authenticate
=====================

This application uses external authenticate for create and login user (After login need username change your password
for connect to proxy)

Supported oauth application:

## Discord

For use **Discord** need add oauth configuration then we can use this (Need add oauth data in all cluster. you can
use `bash cli.sh --discord` for add and update discord config)

Before we start how to config Discord, you need get redirect url. Default redirect url look
like `<protocol>://<host-or-domain-address>/api/v1/oauth/discord/callback` or you can use **Get all external oauth
options** API

How get Discord oauth config:

1. Go to https://discord.com/developers/applications/ and create application
2. Copy **redirect url** in `Redirects` box
2. Copy `CLIENT ID` and `CLIENT SECRET`
3. Use `bash cli.sh --discord` to config service (If you're using cluster mode you have to use this command in all
   servers)

```bash
bash cli.sh --discord
Enter Discord client ID: -- (Step 1)
Enter Discord client secret: -- (Step 2)
```

After execute command you should fill bellow step:

* Step 1: You should enter your Discord client id
* Step 2: You should enter your Discord client secret

Finally, after use above command server has been restart automatically

Oauth client page
=================

If you want to use oauth in html client or PWA you have to use below command for build redirect link in a server.

```bash
bash cli.sh --oauth
Enter oauth client page url: -- (Step 1)
Enter oauth client key name: -- (Step 2)
```

After execute command you should fill bellow step:

* Step 1: You should enter your full page address
* Step 2: You should enter your key need replace with token

Example:

```bash
bash cli.sh --oauth
Enter oauth client page url: http://localhost:8080/#/home?access_token=<token>
Enter oauth client key name: <token>
```

My custom url is `http://localhost:8080/#/home?access_token=<token>` and I want to replace `<token>` in web server. It
means server force client to redirect in `http://localhost:8080/#/home?access_token=eyJhbGciOiJI...` (This is sample
page, and you should replace with own page url)


API
===

## Generate IP

For generate new IP address you should use this API. If your ip range exist, this job has been skipped

### Information:

* Method: `POST`
* URL: `api/v1/proxy/generate`
*
Body: `{"ip": "<your-ip-address>", "mask": <ip-mask>, "gateway": "<your-gateway>", "interface": "<interface-name>", "type": "<proxy-type>", "country": "<proxy-country>"}`
* Authorized type: `admin`

### Body format

* `ip` string ip (Example: **192.168.1.1** or **10.10.10.3**)
* `mask` number mask ip between 1 and 32 (Example: **22** or 24 or **32**)
* `gateway` string ip (Example: **192.168.1.0** or **10.10.10.224**)
* `interface` string (Example: **ens18**)
* `type` string
* `country` string valid 2-alpha country code

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/proxy/generate' \
  -d '{"ip": "<your-ip-address>", "mask": <ip-mask>, "gateway": "<your-gateway>", "interface": "<interface-name>", "type": "<proxy-type>", "country": "<proxy-country>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/proxy/generate' \
    -d '{"ip": "192.168.1.1", "mask": 24, "gateway": "192.168.1.224", "interface": "ens192", "type": "isp", "country": "GB"}'
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
* Authorized type: `admin`

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
* Authorized type: `admin`

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
* Authorized type: `admin`

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
* Authorized type: `admin`

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

## Get user by id

This API use for a get user by id

### Information:

* Method: `GET`
* URL: `api/v1/user`
* Authorized type: `admin`, `self user`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:userId'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user/ec7c5690-c008-4c13-bf52-ba0bbff06fb0'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "ec7c5690-c008-4c13-bf52-ba0bbff06fb0",
    "username": "my_username",
    "isEnable": true,
    "insertDate": "2021-08-29 09:59:40"
  }
}
```

## Create users

This API use for create new user

### Information:

* Method: `POST`
* URL: `api/v1/user`
* Body: `{"username": "<your-username>", "password": "<your-password>"}`
* Authorized type: `anonymous`

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

The output of this API is a token, and you can this token in below API list:

* `GET /v1/user/:userId`
* `PUT /v1/user/:username/password`
* `GET /v1/user/:userId/order`
* `GET /v1/user/:userId/order/:orderId/subscription`
* `GET /v1/user/:userId/order`
* `GET /v1/package/user/:username`
* `PUT /v1/package/:packageId/renew`
* `PUT /v1/package/:packageId/cancel`
* `POST /v1/order/:orderId/package`

### Information:

* Method: `POST`
* URL: `api/v1/user/login`
* Body: `{"username": "<your-username>", "password": "<your-password>"}`
* Authorized type: `anonymous`

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
* Authorized type: `admin` and `normal user`

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
* Authorized type: `admin`

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

Enable all user's proxy

### Information:

* Method: `PUT`
* URL: `api/v1/user/:username/enable`
* Authorized type: `admin`

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
* Authorized type: `admin`

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
* Authorized type: `anonymous`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  '<your-hostname-or-ip>/api/v1/user/:username/domain/:domain/status'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
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
* Authorized type: `admin`

### Body format

* `username` string with [a-zA-Z0-9_.] between 3 and 20 (Example: **test1** or **test_1** or **test**.1)
* `count` number greater than equal 1 (Example: **3**)
* `type` string
* `country` string valid 2-alpha country code
* `expire` Date format for start block time with a format YYYY-MM-DD (Example: **2021-10-04**) - this field has optional

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/package' \
  -d '{"username": "<your-username>", "count": <total-ip-need-use>, "type": "<proxy-type>", "country": "<country-code>", "expire": "<expire-date>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/package'
    -d '{"username": "my_username", "count": 25, "type": "isp", "country": "GB", "expire": "2021-10-25"}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "cb194947-29b2-47cc-bb7f-24e10d4515e2",
    "username": "my_username",
    "password": "my_password",
    "type": "isp",
    "country": "GB",
    "status": "enable",
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
* Authorized type: `admin` and `normal user`

### Query string format

* `type` string
* `country` string valid 2-alpha country name
* `status` string

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
    
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/package/user/my_username?type=isp'
    
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/package/user/my_username?type=isp&country=GB'
```

### Output:

```json5
{
  "status": "success",
  "data": [
    {
      "id": "cb194947-29b2-47cc-bb7f-24e10d4515e2",
      "username": "my_username",
      "password": "my_password",
      "type": "isp",
      "country": "GB",
      "status": "enable",
      "countIp": 25,
      "expireDate": "2021-10-25"
    },
    {
      "id": "ebc143cd-221a-4841-86ff-13687105b99e",
      "username": "my_username",
      "password": "my_password",
      "type": "isp",
      "country": "GB",
      "status": "enable",
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
* Authorized type: `admin` and `normal user`

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

## Cancel package

If package expire date not end, You can cancel proxy

### Information:

* Method: `PUT`
* URL: `api/v1/package/:packageId/cancel`
* Authorized type: `admin` and `normal user`

```bash
curl \
  -X PUT \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/package/:packageId/cancel'
```

### Example:

```bash
curl \
    -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/package/cb194947-29b2-47cc-bb7f-24e10d4515e2/cancel'
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
* Authorized type: `admin`

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

## Get all product

Get list of all product (enable and disable a product)

### Information:

* Method: `GET`
* URL: `api/v1/product`
* Authorized type: `admin`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/product'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/product'
```

### Output:

```json5
{
  "status": "success",
  "data": [
    {
      "id": "5286ad0c-8b00-4684-938a-861526cfbcfb",
      // Total proxy has been created
      "count": 2,
      // Price of product
      "price": 1000,
      // Expire day of proxy can user use it
      "expireDay": 30,
      // External store for link between product and store for payment
      "externalStore": [
        {
          "id": "015428c2-4c13-4a58-be35-3f6bb2f2e615",
          // Service type (store name)
          "type": "fastspring",
          // Serial or ID of product in external store
          "serial": "at-datacenter-proxies-100",
          "insertDate": "2022-04-20 12:16:45"
        }
      ],
      "isEnable": true,
      "insertDate": "2022-04-20 12:16:45",
      "updateDate": null,
      "deleteDate": null
    }
  ]
}
```

## Get all enable product

Get all enable product for anonymous

### Information:

* Method: `GET`
* URL: `api/v1/product/list`
* Authorized type: `anonymous`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  '<your-hostname-or-ip>/api/v1/product/list'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    '<your-hostname-or-ip>/api/v1/product/list'
```

### Output:

```json5
{
  "status": "success",
  "data": [
    {
      "id": "5286ad0c-8b00-4684-938a-861526cfbcfb",
      // Total proxy has been created
      "count": 2,
      // Price of product
      "price": 1000,
      // Expire day of proxy can user use it
      "expireDay": 30,
      // External store for link between product and store for payment
      "externalStore": [
        {
          "id": "015428c2-4c13-4a58-be35-3f6bb2f2e615",
          // Service type (store name)
          "type": "fastspring",
          // Serial or ID of product in external store
          "serial": "at-datacenter-proxies-100",
          "insertDate": "2022-04-20 12:16:45"
        }
      ],
      "isEnable": true,
      "insertDate": "2022-04-20 12:16:45",
      "updateDate": null,
      "deleteDate": null
    }
  ]
}
```

## Create new product

Create new product

### Information:

* Method: `POST`
* URL: `api/v1/product`
* Authorized type: `admin`

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/product' \
  -d '{"count": <proxy-count-generated>, "price": <price-package>, "expireDay": <expire-day>, "externalStore": [{"type": "<store-name-or-type>", "serial": "<product-id-or-serial>"}], "isEnable": <enable-or-disable-product>}'
```

### Body format

* `count` number
* `price` number - this field has optional
* `expireDay` number
* `externalStore` Array of object with store information - this field has optional
* `externalStore.type` String store name or type
* `externalStore.serial` String store product id or serial
* `isEnable` Boolean

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/product' \
  -d '{"count": 2, "price": 1000, "expireDay": 30, "isEnable": true, "externalStore": [{"type": "fastspring", "serial": "at-datacenter-proxies-100"}]}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "5286ad0c-8b00-4684-938a-861526cfbcfb",
    // Total proxy has been created
    "count": 2,
    // Price of product
    "price": 1000,
    // Expire day of proxy can user use it
    "expireDay": 30,
    // External store for link between product and store for payment
    "externalStore": [
      {
        "id": "015428c2-4c13-4a58-be35-3f6bb2f2e615",
        // Service type (store name)
        "type": "fastspring",
        // Serial or ID of product in external store
        "serial": "at-datacenter-proxies-100",
        "insertDate": "2022-04-20 12:16:45"
      }
    ],
    "isEnable": true,
    "insertDate": "2022-04-20 12:16:45",
    "updateDate": null,
    "deleteDate": null
  }
}
```

## Add new external store on product

Add new external store on product

### Information:

* Method: `POST`
* URL: `api/v1/product/:productId/external-store`
* Authorized type: `admin`

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/product/:productId/external-store' \
  -d '{"type": "<store-name-or-type>", "serial": "<product-id-or-serial>"}'
```

### Body format

* `type` String store name or type
* `serial` String store product id or serial

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/product/751c4a35-ed2a-489d-870f-b09dc7b0f8a5/external-store' \
  -d '{"type": "fastspring", "serial": "at-datacenter-proxies-200"}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "3039f558-8e1b-4ef9-a398-e8d9fa9b7f36",
    "productId": "5286ad0c-8b00-4684-938a-861526cfbcfb",
    "type": "fastspring",
    "serial": "at-datacenter-proxies-200",
    "price": [],
    "insertDate": "2022-05-10 12:29:05"
  }
}
```

## Update exist product

Update information of product with product id

### Information:

* Method: `PUT`
* URL: `api/v1/product/:id`
* Authorized type: `admin`

```bash
curl \
  -X PUT \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/product/:id' \
  -d '{"count": <proxy-count-generated>, "price": <price-package>, "expireDay": <expire-day>, "isEnable": <enable-or-disable-product>}'
```

### Body format

At least one of below key should fill

* `count` number
* `price` number
* `expireDay` number
* `isEnable` Boolean

### Example:

```bash
curl \
    -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/product/751c4a35-ed2a-489d-870f-b09dc7b0f8a5' \
  -d '{"count": 2}'
```

### Output:

```json5
{
  "status": "success"
}
```

## Update exist external store product

Update information of external store product with product id and external store product id

### Information:

* Method: `PUT`
* URL: `api/v1/product/:productId/external-store/:externalStoreId`
* Authorized type: `admin`

```bash
curl \
  -X PUT \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/product/:productId/external-store/:externalStoreId' \
  -d '{"type": "<store-name-or-type>", "serial": "<product-id-or-serial>"}'
```

### Body format

At least one of below key should fill

* `type` String store name or type
* `serial` String store product id or serial

### Example:

```bash
curl \
    -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/product/751c4a35-ed2a-489d-870f-b09dc7b0f8a5/external-store/1debff31-bf6d-4614-9c1e-e4a416ed58ac' \
  -d '{"serial": "at-datacenter-proxies-200"}'
```

### Output:

```json5
{
  "status": "success"
}
```

## Remove product

Remove product with product id (Also delete external store if exist)

### Information:

* Method: `DELETE`
* URL: `api/v1/product/:id`
* Authorized type: `admin`

```bash
curl \
  -X DELETE \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/product/:id'
```

### Example:

```bash
curl \
    -X DELETE \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/product/751c4a35-ed2a-489d-870f-b09dc7b0f8a5'
```

### Output:

```json5
{
  "status": "success"
}
```

## Remove external store product

Remove external store product with product id and external store product id

### Information:

* Method: `DELETE`
* URL: `api/v1/product/:productId/external-store/:externalStoreId`
* Authorized type: `admin`

```bash
curl \
  -X DELETE \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/product/:productId/external-store/:externalStoreId'
```

### Example:

```bash
curl \
    -X DELETE \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/product/751c4a35-ed2a-489d-870f-b09dc7b0f8a5/external-store/1debff31-bf6d-4614-9c1e-e4a416ed58ac'
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
* Authorized type: `admin`

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

## Get all interface of servers

Get list all interface of servers cluster

### Information:

* Method: `GET`
* URL: `api/v1/server/interface`
* Authorized type: `admin`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/server/interface'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/server/interface'
```

### Output:

```json5
{
  "status": "success",
  "totalItem": 1,
  "data": [
    {
      // Hostname
      "hostname": "host1",
      // Interface name
      "interfaceName": "venet0",
      // Prefix interface name
      "interfacePrefix": "venet0",
      // List of ip Address
      "ipList": [
        "192.168.1.2"
      ]
    }
  ]
}
```

## Create new server

Create new server

### Information:

* Method: `POST`
* URL: `api/v1/server`
* Authorized type: `admin`

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
* Authorized type: `admin`

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
* Authorized type: `admin`

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

## Get all external oauth options

Get list of external oauth configuration

### Information:

* Method: `GET`
* URL: `api/v1/oauth`
* Authorized type: `anonymous`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  '<your-hostname-or-ip>/api/v1/oauth'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    '<your-hostname-or-ip>/api/v1/oauth'
```

### Output:

```json5
{
  "status": "success",
  "totalItem": 1,
  "data": [
    {
      "id": "952433606616289340",
      "platform": "discord",
      "redirectUrl": "http://0.0.0.0:8000/api/v1/oauth/discord/callback"
    }
  ]
}
```

## Login with oauth external platform

This API use for a client and after execute generate a client url to redirect in oauth service

**P.S:**

If authenticate successfully execute after that username has been created and need to restart password to use proxy

### Information:

* Method: `POST`
* URL: `api/v1/oauth/:platfrom`
* Authorized type: `anonymous`

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  '<your-hostname-or-ip>/api/v1/oauth/:platform'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    '<your-hostname-or-ip>/api/v1/oauth/discord'
```

### Output:

```json5
{
  "status": "success",
  "data": "http://oauth-platform-url"
}
```

## Get user orders (user access)

This API use for a get all order user has been purchased

### Information:

* Method: `GET`
* URL: `api/v1/user/:userId/order`
* Authorized type: `user`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:userId/order'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user/5cda4022-2278-4515-80c9-7191de5244a5/order'
```

### Output:

```json5
{
  "status": "success",
  "data": [
    {
      "id": "d83141f5-5301-4ec1-af44-ce5b5c2d2c0d",
      "userId": "5cda4022-2278-4515-80c9-7191de5244a5",
      "productId": "5286ad0c-8b00-4684-938a-861526cfbcfb",
      "packageId": null,
      "username": "user",
      "orderSerial": null,
      "serviceName": "fastspring",
      "status": null,
      "lastSubscriptionStatus": null,
      "prePackageOrderInfo": {
        "count": 1,
        "expireDay": 30,
        "proxyType": "isp",
        "countryCode": "GB"
      },
      "insertDate": "2022-05-01 13:15:21",
      "updateDate": null
    }
  ]
}
```

## Get user orders (admin access)

This API use for a get all order user has been purchased

### Information:

* Method: `GET`
* URL: `api/v1/order`
* Authorized type: `admin`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/order'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/order'
```

### Output:

```json5
{
  "status": "success",
  "totalItem": 1,
  "data": [
    {
      "id": "d83141f5-5301-4ec1-af44-ce5b5c2d2c0d",
      "userId": "5cda4022-2278-4515-80c9-7191de5244a5",
      "productId": "5286ad0c-8b00-4684-938a-861526cfbcfb",
      "packageId": null,
      "username": "user",
      "orderSerial": null,
      "serviceName": "fastspring",
      "status": null,
      "lastSubscriptionStatus": null,
      "prePackageOrderInfo": {
        "count": 1,
        "expireDay": 30,
        "proxyType": "isp",
        "countryCode": "GB"
      },
      "insertDate": "2022-05-01 13:15:21",
      "updateDate": null
    }
  ]
}
```

## Get list of user's subscription for order (user access)

This API use for a get all user's subscription for order

### Information:

* Method: `GET`
* URL: `api/v1/user/:userId/order/:orderId/subscription`
* Authorized type: `user`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:userId/order/:orderId/subscription'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user/5cda4022-2278-4515-80c9-7191de5244a5/order/ec7c5690-c008-4c13-bf52-ba0bbff06fb0/subscription'
```

### Output:

```json5
{
  "status": "success",
  "totalItem": 1,
  "data": [
    {
      "id": "5315b5d3-4a40-4760-acd7-006c5f92eb3a",
      "orderId": "a0196e90-041b-4470-a6b9-70ce2f987c3f",
      "status": "activated",
      "insertDate": "2022-05-01 18:52:30",
      "updateDate": null
    }
  ]
}
```

## Get list of user's subscription for order (admin access)

This API use for a get all user's subscription for order

### Information:

* Method: `GET`
* URL: `api/v1/order/:orderId/subscription`
* Authorized type: `admin`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/order/:orderId/subscription'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/order/ec7c5690-c008-4c13-bf52-ba0bbff06fb0/subscription'
```

### Output:

```json5
{
  "status": "success",
  "totalItem": 1,
  "data": [
    {
      "id": "5315b5d3-4a40-4760-acd7-006c5f92eb3a",
      "orderId": "a0196e90-041b-4470-a6b9-70ce2f987c3f",
      "status": "activated",
      "insertDate": "2022-05-01 18:52:30",
      "updateDate": null
    }
  ]
}
```

## Create order for user

This API use for create new order for user

### Information:

* Method: `POST`
* URL: `api/v1/user/:userId/order`
*
Body: `{"productId": "<product-id>", "serviceName": "<service-name>", "prePackageOrderInfo": {"proxyType": "<proxy-type>", "countryCode": "<proxy-country-code>"}}`
* Authorized type: `user`

### Body format

* `productId` string the id of product
* `serviceName` string with payment service (In this case we use **fastspring**)
* `prePackageOrderInfo` object
    * `proxyType` string with type of proxy
    * `countryCode` string with valid 2-alpha country code

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  '<your-hostname-or-ip>/api/v1/user/:userId/order' \
  -d '{"productId": "<product-id>", "serviceName": "<service-name>", "prePackageOrderInfo": {"proxyType": "<proxy-type>", "countryCode": "<proxy-country-code>"}}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    '<your-hostname-or-ip>/api/v1/user/5cda4022-2278-4515-80c9-7191de5244a5/order'
    -d '{"productId": "5286ad0c-8b00-4684-938a-861526cfbcfb", "serviceName": "fastspring", "prePackageOrderInfo": {"proxyType": "isp", "countryCode": "GB"}}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "d83141f5-5301-4ec1-af44-ce5b5c2d2c0d",
    "userId": "5cda4022-2278-4515-80c9-7191de5244a5",
    "productId": "5286ad0c-8b00-4684-938a-861526cfbcfb",
    "packageId": null,
    "username": "user",
    "orderSerial": null,
    "serviceName": "fastspring",
    "status": null,
    "lastSubscriptionStatus": null,
    "prePackageOrderInfo": {
      "count": 1,
      "expireDay": 30,
      "proxyType": "isp",
      "countryCode": "GB"
    },
    "insertDate": "2022-05-01 13:15:21",
    "updateDate": null
  }
}
```

## Verify user's order

This API use for create new order for user

### Information:

* Method: `POST`
* URL: `api/v1/order/:orderId/package`
* Body: `{"orderSerial": "<order-serial>"}`
* Authorized type: `user`

### Body format

* `orderSerial` string the order serial of user's purchased

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  '<your-hostname-or-ip>/api/v1/order/:orderId/package' \
  -d '{"orderSerial": "<order-serial>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    '<your-hostname-or-ip>/api/v1/order/a0196e90-041b-4470-a6b9-70ce2f987c3f/package'
    -d '{"orderSerial": "8EHE6LslRtqdcet092cM5g"}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "ddb9f970-d722-4d7c-a636-0b4985cc075f",
    "userId": "5cda4022-2278-4515-80c9-7191de5244a5",
    "username": "user",
    "password": "password",
    "countIp": 1,
    "type": "isp",
    "country": "GB",
    "ipList": [
      {
        "ip": "10.102.0.19",
        "port": 3128
      }
    ],
    "status": "enable",
    "insertDate": "2022-05-01 13:56:44",
    "updateDate": null,
    "expireDate": null
  }
}
```

## Get payment method

Get all payment method for anonymous

### Information:

* Method: `GET`
* URL: `api/v1/payment/list`
* Authorized type: `anonymous`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  '<your-hostname-or-ip>/api/v1/payment/list'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    '<your-hostname-or-ip>/api/v1/payment/list'
```

### Output:

```json5
{
  "status": "success",
  "totalItem": 1,
  "data": [
    {
      "serviceName": "fastspring",
      "mode": "test",
      "address": "venomsupply.test.onfastspring.com/popup-venomsupply"
    }
  ]
}
```
