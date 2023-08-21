# MongoDB Discriminator

## Description

The purpose of this repository is to illustrate the issue with multi-doucment transactions in the Cosmos DB implementation of the MongoDB API when cross-region replication is enabled.

## How to reproduce

In order to use the repository, following the following steps:

- Create the DB using the `cosmos-mongo-multi-region-az.json` ARM template
- Copy the connection string from the Azure Portal
- Rename the `env.example` file to `.env` and enter the value for the connection string
- Run `npm install`
- Run `npm run dev`
- Note the error
- Drop the database and recreate it using the `cosmos-mongo-single-region-az.json` ARM template
- Copy the connection string from the Azure Portal and update the `.env` file
- Re-run the application and note that it runs successfully

