# Task Streaming Service

## Project Description
Tasks Mgmt REST API with an exposed socket for streaming new tasks

## Repository Architecture

This monorepo implements Clean NestJs Architecture with Typescript (Controller, Service, and Data Layer).

## Postman Documentation

[https://documenter.getpostman.com/view/11044390/2sA3JT4eZD](Task Mgt CRUD API)

## App Features

- Authentication & Authorization
- Request Validation 
- Task Management (CRUD)
- Task Streaming with Socket.io
- Containerization with Docker
- E2E Testing


## Installation

```bash
$ yarn install
```

## Running the app

```bash
# copy `.env.example` file into `.env` file
$ cp .env.example .env

# with docker compose
$ docker-compose up

# development
# ensure you have a mongodb instance running on localhost/start the mongo docker container
$ yarn run start:dev
```

## Task stream (Websockets)

# Steps to Test Task Streaming 
(can't export/pushlish websocket collection in postman)
-- connect the the websocket at the same port as the webserver (localhost:6061)
-- provide Bearer authorization (e.g "Bearer <jwt_token>") token on the "authorization" header field
-- listen/subscribe to events `data_stream`, and `connection`


## Test

```bash
# e2e tests. (ensure the mongo database instance is running)
$ yarn run test
```
