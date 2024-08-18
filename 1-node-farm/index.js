const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

// we use slugify to create slugs.
// slug is a basically the last part of the url that contains a unique string that identifies the resource that the website is displaying
// eg: in our node-farm project instead of 127.0.0.1:8000/product?id=0 we could have 127.0.0.1:8000/fresh-avocados
// so here 'fresh-avocados' is the slug
const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

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

// we moved this upward because we don't want to read the file everytime a request to /api is made
// we only read it once and store it in a variable and send the data
// also we change the readFile to readFileSync because we only read it once

// In Node.js, `__dirname` refers to the directory where the current script is located,
// regardless of where we execute the script. 
// In contrast, `./` refers to the current working directory from which we are running the script.
// So, if we use './dev-tools/data.json' and run the script from a different directory (like the desktop), 
// `.` would refer to the desktop, not the directory where the script is located.
// Therefore, it's a best practice to use `__dirname` for file paths to ensure the path is relative 
// to the script's location.
// 
// EXCEPTION: When using `require()` to import our own modules, `./` refers to the directory relative 
// to the script in which the `require()` statement appears, not the working directory from which 
// the script is executed.
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8")
// this method converts JSON string to a JavaScript object
const dataObj = JSON.parse(data);

// similarly we read the template at the top because we only want it read and storedto memory once and not everytime a route is hit
const templateOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const templateCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const templateProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

// generated slugs
const slugs = dataObj.map(el => slugify(el.productName, { lower: true }))
console.log(slugs);

// everytime we make a request, this callback function in createServer method is executed
const server = http.createServer((req, res) => {

    // url.parse returns the information about the url in the form of an object
    // pathname is the path of the url and query is the query is a object that returns the query info
    const { query, pathname } = url.parse(req.url, true);

    // overview page
    if (pathname === '/' || pathname === '/overview') {
        /// we specify the content type since we are sending a html here
        res.writeHead(200, {
            'Content-type': 'text/html'
        })

        // here we map over the data in data.json file and for each object in the array we use the replaceTemplate function that replaces all the placeholder in the templateCard with the actual data from dta.json
        // we use the join method at the end to convert the array of elements returned by map method into a string.
        const cardHTML = dataObj.map(el => replaceTemplate(templateCard, el)).join();

        // then we replace the placeholder for cards in the overview template with the string we got in cardHTML
        const output = templateOverview.replace('{%PRODUCT_CARDS%}', cardHTML);

        res.end(output);

        // product page
    } else if (pathname === '/product') {
        res.writeHead(200, {
            'Content-type': 'text/html'
        });

        // it returns the object with the id in the query paramter from the dataObj
        const product = dataObj[query.id];

        // then we replace all the placeholder with the from template-product.html with the actual data
        const output = replaceTemplate(templateProduct, product);
        res.end(output)

        // api page
    } else if (pathname === '/api') {
        // we specify the content type to be application/json since we are sending json data
        res.writeHead(200, {
            'Content-type': 'application/json',
        })
        res.end(data);

        // page not found
    } else {
        // first paramter - status code
        // second parameter - headers object. header is the information about the response that we send back to the browser
        // header and status code needs to be sent before the repsonse
        res.writeHead(404, {
            'Content-type': 'text/html', // this means the browser is expecting some html as response
            'my-own-header': 'this-is-a-made-up-header' // we can also make our own header and send it
        })
        res.end("<h1>Page not found!</h1>")
    }
});

// first parameter - PORT number, second parameter - address of localhost. This is optional.
server.listen(8000, '127.0.0.1', () => {
    console.log("Listening to requests on port 8000!");
});