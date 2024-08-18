const fs = require('fs');
const http = require('http');
const url = require('url');

// reading the data from data.json file and storing into a variable
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');

// converting the JSON string into JavsScript object
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {

    // destructuring the query and pathname from the url using url.parse method
    const { query, pathname } = url.parse(req.url);

    // route for home/overview page
    if (pathname === '/' || pathname === '/overview') {
        res.end('This is OVERVIEW!')
    }

    // route to display details of book
    else if (pathname === '/product') {
        res.end('This is PRODUCT!')
    }

    // test route to display the content of data.json
    else if (pathname === '/api') {
        res.writeHead(200, {
            'Content-type': 'application/json'
        });
        res.end(data)
    }

    // case to handle non-existent urls
    else {
        res.writeHead(404, {
            'Content-type': 'text/html'
        });
        res.end('<h1>Page not found!</h1>')
    }
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests at port 8000!');
});