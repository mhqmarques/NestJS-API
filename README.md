## Description

API project built using Nest.js to be used as portfolio.

## Concepts and technologies used

- CRUD
- API REST
- Authentication and Authorization
  - Jwt
  - Passport
  - Strategy
  - Nest Guard
- Prisma ORM
- PostgreSql
- Validation
- Docker and Docker Compose
- Test
  - Jest
  - Pactum
  - E2E
- Documentation
  - Swegger

## Set Up

### set environment

`DATABASE_URL= [database_url_connection]`

`JWT_SECRET= [some_secret]`

### run commands

```bash
$ npm install // install
$ npm run db:dev:restart // start postgres in docker and push migrations
$ npm run start:dev // start api in dev mode
```

## API Documentation

1. Start the application [ see `run commands`]
2. In a browser access `http://localhost:3333/api`
