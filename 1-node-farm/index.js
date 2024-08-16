const fs = require('fs');
const http = require('http');
const url = require('url');

//<------------------------------------- FILE READING AND WRITING --------------------------------->//

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


//<----------------------------------------- SERVER -------------------------------------------->//
const server = http.createServer((req, res) => {

    const pathName = req.url;

    if (pathName === '/' || pathName === '/overview') {
        res.end('This is OVERVIEW!')
    } else if (pathName === '/product') {
        res.end('This is PRODUCT!')
    } else if (pathName === '/api') {

        // here __dirname means the directory the file is located at
        // whereas ./ means the current directory from where we are executing our script
        // so if we were to write './dev-tools/data.json' and the run the index.js file from the desktop, then . here would mean desktop and the not directory the index.js is inside
        // so it's best practice to use __dirname instead of ./
        // EXCEPTION - when using the require() function to import our own modules. in that case the . means the current directry and not the directory from where the script is being executed
        fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (err, data) => {

            // this method converts JSON string to a JavaScript object
            const productData = JSON.parse(data);

            // we specify the content type to be application/json since we are sending json data
            res.writeHead(200, {
                'Content-Type': 'application/json',
            })

            res.end(data);
        })
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