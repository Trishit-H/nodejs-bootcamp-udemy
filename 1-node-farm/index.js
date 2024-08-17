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

// we moved this upward because we don't want to read the file everytime a request to /api is made
// we only read it once and store it in a variable and send the data
// also we change the readFile to readFileSync because we only read it once

// here __dirname means the directory the file is located at
// whereas ./ means the current directory from where we are executing our script
// so if we were to write './dev-tools/data.json' and the run the index.js file from the desktop, then . here would mean desktop and the not directory the index.js is inside
// so it's best practice to use __dirname instead of ./
// EXCEPTION - when using the require() function to import our own modules. in that case the . means the current directry and not the directory from where the script is being executed
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8')
// this method converts JSON string to a JavaScript object
const dataObj = JSON.parse(data);

// similarly we read the template at the top because we only want it read and storedto memory once and not everytime a route is hit
const templateOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const templateCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const templateProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

// we use the replace method to replace the placeholder with the data from data.json
const replaceTemplate = (template, product) => {
    let output = template.replace(/{%PRODUCT_NAME%}/g, product.productName);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%DESCRIPTION%}/g, product.description)
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%ID%}/g, product.id)

    if (!product.organic) {
        output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic')
    }

    return output;
}

const server = http.createServer((req, res) => {

    const pathName = req.url;

    // overview page
    if (pathName === '/' || pathName === '/overview') {
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
    } else if (pathName === '/product') {
        res.end('This is PRODUCT!')

        // api page
    } else if (pathName === '/api') {
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
        res.end('<h1>Page not found!</h1>')
    }
});

// first parameter - PORT number, second parameter - address of localhost. This is optional.
server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests on port 8000!');
})