const fs = require('fs');
const http = require('http');
const url = require('url');

const replacePlaceholder = require('./modules/replacePlaceholder');

// reading the data from data.json file and storing into a variable
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');

// converting the JSON string into JavsScript object
const dataObj = JSON.parse(data);

// reading all the html templates
const overviewTemplate = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const cardTemplate = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const bookTemplate = fs.readFileSync(`${__dirname}/templates/template-book.html`, 'utf-8');

const server = http.createServer((req, res) => {

    // destructuring the query and pathname from the url using url.parse method
    const { query, pathname } = url.parse(req.url, true);

    // route for home/overview page
    if (pathname === '/' || pathname === '/overview') {
        // content type to html since we are sending an html page
        res.writeHead(200, {
            'Content-type': 'text/html'
        });

        const cardHTML = dataObj.map(el => replacePlaceholder(cardTemplate, el)).join();

        const finalHTML = overviewTemplate.replace(/{%BOOK_CARDS%}/g, cardHTML);

        res.end(finalHTML)
    }

    // route to display details of book
    else if (pathname === '/product') {
        res.writeHead(200, {
            'Content-type': 'text/html'
        });

        const book = dataObj.filter(el => el.id === Number(query.id))[0];

        const output = replacePlaceholder(bookTemplate, book);

        res.end(output);
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