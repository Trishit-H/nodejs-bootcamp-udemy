/*
We created this file because it's good practice to have everything related to the server in one file and everything related to express in separate file (app.js)

server.js is our main file, where everything starts
*/

const app = require('./app');

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}`);
});
