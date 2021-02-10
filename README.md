## Setup

1. Set env MongoDB connection string as env variable.

    MacOS: `export MONGODB_CONNECTIONSTRING=mongodb+srv://<<db-user>>:<<db-pw>>@<<url to the cluster>>/<<db-name>>`

2. Install npm dependencies

``npm install``

## Run Frontend

``npx gulp webserver``

## Run Backend

``npm run start``