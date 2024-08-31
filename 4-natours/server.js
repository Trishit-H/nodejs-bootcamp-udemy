/*
We created this file because it's good practice to have everything related to the server in one file and everything related to express in separate file (app.js)

server.js is our main file, where everything starts
*/
const dotenv = require('dotenv');

// what this does is it loads the content of config.env file to process.env
dotenv.config({ path: './config.env' });

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}`);
});
