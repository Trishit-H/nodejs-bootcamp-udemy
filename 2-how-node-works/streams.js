// Scenario - Imagine in our application we need to read a very large file and send it to the client. 

// First way - simply read the file into a varibale and then once that's done, we send it to the client
const fs = require('fs');
const http = require('http');

const server = http.createServer();
server.on('request', (req, res) => {
    fs.readFile('test-file.txt', 'utf-8', (err, data) => {
        if (err) console.log(err);
        res.end(data);
    });
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Waiting for requests...');
});

// the problem with this is that node will have to read the entire file into memory and then can it only send the data to the client. it will be huge problem when the file is very big and a ton of requests are hitting our server becuase the node process will very qucikly run out of resources and the app will quit working.
// so in a production app, we cannot use this method