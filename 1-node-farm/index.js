const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

//<-------------------------------------------- FILE READING AND WRITING -------------------------------------------->//

// Blocking, synchronous code
// const textInput = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textInput);

// const textOutput = `This is what we know about avocados: ${textInput}. \nCreated on: ${new Date().toLocaleString()}`;
// fs.writeFileSync('./txt/output.txt', textOutput);
// console.log('File written!');

// Non-blocking, synchronous code
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if (err) return console.log('ERROR! 💥');
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//             console.log(data3);
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//                 console.log('Your file has been written! 😋');
//             })
//         })
//     })
// });

// console.log('Will read-file!');


//<-------------------------------------------------- SERVER -------------------------------------------------->//
const server = http.createServer((req, res) => {

    const pathName = req.url;

    if (pathName === '/' || pathName === '/overview') {
        res.end('This is OVERVIEW!')
    } else if (pathName === '/product') {
        res.end('This is PRODUCT!')
    } else {
        // first paramter - status code
        // second parameter - headers object. header is the information about the response that we send back to the browser
        // header and status code needs to be sent before the repsonse
        res.writeHead(404, {
            'Content-type': 'text/html', // this means the browser is expecting some html as response
            'my-own-header': 'this-is-a-made-up-header' // we can also make our own header and send it
        })
        res.end('<h1>Page not found!</h1>')
    }
});

// first parameter - PORT number, second parameter - address of localhost. This is optional.
server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests on port 8000!');
})