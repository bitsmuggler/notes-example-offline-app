## Setup

1. Setup a local or remote MongoDB cluster with a db

1. Set MongoDB connection string as env variable.

    MacOS: `export MONGODB_CONNECTIONSTRING=mongodb+srv://<<db-user>>:<<db-pw>>@<<url to the cluster>>/<<db-name>>`
 
1. Install npm dependencies

    ``npm install``

## Run Frontend

    ``npx gulp webserver``

## Run Backend

    ``npm run start``