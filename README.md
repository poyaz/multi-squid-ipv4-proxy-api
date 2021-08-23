API
===

## Generate IP

For generate new IP address you should use this API. If your ip range exist, this job has been skipped

### Information:

* Method: `POST`
* URL: `api/v1/proxy/generate`
* Body: `{"ip": "<your-ip-address>", "mask": <ip-mask>, "gateway": "<your-gateway>"}`

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/proxy/generate' \
  -d '{"ip": "<your-ip-address>", "mask": <ip-mask>, "gateway": "<your-gateway>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/proxy/generate' \
    -d '{"ip": "192.168.1.1", "mask": 24, "gateway": "192.168.1.224"}'
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
    '<your-hostname-or-ip>/api/v1/job/7bc4d68da9974543aa119aca7d13b684'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "7bc4d68da9974543aa119aca7d13b684",
    // status list: processing, finish
    "status": "processing",
    // total ip record should be added
    "totalRecord": 225,
    // total record has been added
    "totalRecordAdd": 25,
    // total record exist in system
    "totalRecordExist": 200,
    // total record has been error
    "totalRecordError": 0
  }
}
```

## Init proxy

After generate IP address and finish job, you should start or init proxy server

### Information:

* Method: `GET`
* URL: `api/v1/proxy/init`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/proxy/init'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/proxy/init'
```

### Output:

```json5
{
  "status": "success"
}
```

## Stop proxy

If you want stop all proxy, use this API

### Information:

* Method: `GET`
* URL: `api/v1/proxy/stop`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/proxy/stop'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/proxy/stop'
```

### Output:

```json5
{
  "status": "success"
}
```

## Create users

This API use for create new user

### Information:

* Method: `POST`
* URL: `api/v1/user`
* Body: `{"username": "<your-username>", "password": "<your-password>"}`

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user' \
  -d '{"username": "<your-username>", "password": "<your-password>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
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

## Change password

Change password for exist user in system

### Information:

* Method: `POST`
* URL: `api/v1/user/:username/password`
* Body: `{"password": "<your-new-password>"}`

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:username/password' \
  -d '{"password": "<your-new-password>"}'
```

### Example:

```bash
curl \
    -X POST \
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

* Method: `POST`
* URL: `api/v1/user/:username/disable`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:username/disable'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user/:username/disable'
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

* Method: `POST`
* URL: `api/v1/user/:username/enable`

```bash
curl \
  -X GET \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/user/:username/enable'
```

### Example:

```bash
curl \
    -X GET \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/user/:username/enable'
```

### Output:

```json5
{
  "status": "success"
}
```

## Create package

Create new package for users

### Information:

* Method: `POST`
* URL: `api/v1/package`
* Body: `{"username": "<your-username>", "countIp": <total-ip-need-use>, "expire": "<expire-date>"}`

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/package' \
  -d '{"username": "<your-username>", "countIp": <total-ip-need-use>, "expire": "<expire-date>"}'
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/package'
    -d '{"username": "my_username", "countIp": 25, "expire": "2021-10-25"}'
```

### Output:

```json5
{
  "status": "success",
  "data": {
    "id": "cb194947-29b2-47cc-bb7f-24e10d4515e2",
    "username": "my_username",
    "countIp": 25,
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
      "expire": "2021-10-25"
    },
    {
      "id": "ebc143cd-221a-4841-86ff-13687105b99e",
      "username": "my_username",
      "countIp": 10,
      "expire": "2021-08-25"
    }
  ]
}
```

## Renew package

If package expire date not end, You can renew expire date

### Information:

* Method: `POST`
* URL: `api/v1/package/:packageId/renew`
* Body: `{"expire": "<expire-date>"}`

```bash
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-token>' \
  '<your-hostname-or-ip>/api/v1/package/:packageId/renew' \
  -d {"expire": "<expire-date>"}
```

### Example:

```bash
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer token' \
    '<your-hostname-or-ip>/api/v1/package/cb194947-29b2-47cc-bb7f-24e10d4515e2/renew' \
    -d '{"expire": "2021-11-01"}'
```

### Output:

```json5
{
  "status": "success"
}
```
