// Scenario - Imagine in our application we need to read a very large file and send it to the client. 

// First way - simply read the file into a varibale and then once that's done, we send it to the client
const fs = require('fs');
const http = require('http');

// const server = http.createServer();
// server.on('request', (req, res) => {
//     fs.readFile('test-file.txt', 'utf-8', (err, data) => {
//         if (err) console.log(err);
//         res.end(data);
//     });
// });

// server.listen(8000, '127.0.0.1', () => {
//     console.log('Waiting for requests...');
// });

// the problem with this is that node will have to read the entire file into memory and then can it only send the data to the client. it will be huge problem when the file is very big and a ton of requests are hitting our server becuase the node process will very qucikly run out of resources and the app will quit working.
// so in a production app, we cannot use this method


// Second solution - using streams
// the idea here is that we don't need to read the data into a varaible as in previous solution. Instead we will just create a readable stream, then as we recieve each chunck of data we send it to the client as a response which  is a writeable stream.

/*
const server = http.createServer();
server.on('request', (req, res) => {
    // we create a readable stream
    // this creates piece by piece data
    const readable = fs.createReadStream('testtttt-file.txt');

    // each time there is a new piece of data that we can consume, a readable stream emits a data event
    // and we can listen to that data event
    // and in the callback function of the event listener we have access to that piece of data through a chunk parameter
    readable.on('data', chunk => {
        // we create a writeable stream of this chunk and send it to the client as response
        res.write(chunk);
    });

    // and when the file reading is finished, the readable stream emits the end event
    readable.on('end', () => {
        // here response is also a stream, so we tell it no more data will be written to this writeable stream
        res.end();
    });

    // readable stream also emits an error event
    readable.on('error', err => {
        console.log(err);
        res.statusCode = 500;
        res.end('File not found!');
    })
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Waiting for requests...');
});
*/

// but there is a problem with this solution. our readable stream, the one that we are using to read the file from the disk is much much faster than sending the result with the response writeable stream over the network. and this will overwhelm the response stream, which cannot handle all these incoming data so fast. and this problem is called backpressure. So in this case, backpressure happens when the response cannot send the data nearly as fast as it is recieving it from the file.