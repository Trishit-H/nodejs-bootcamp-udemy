const fs = require('fs');
const superagent = require('superagent'); // to send api requests

// promisifying the readFile method, such that we only have to pass the file name
const readFilePromisified = (file) => {
    // Return a new Promise object
    // the Promise object takes in a constructor function that is executed immediately
    return new Promise((resolve, reject) => {
        // Use the 'fs.readFile' method to read the content of the file
        // The method takes the 'file' argument (filename) and a callback function
        fs.readFile(file, 'utf-8', (err, data) => {
            // If an error occurs during the file reading, reject the Promise with the error
            // this error or whatever we pass in the reject function will be consumed by the .catch method
            if (err) return reject(err);

            // If reading the file is successful, resolve the Promise with the file data
            // this data or whatever we pass in the resolve function will be consumed by the .then method
            resolve(data);
        });
    });
};

// promisifying the writeFile method, such it takes only the file path(where data needs to written) and the data to be written
const writeFilePromisified = (file, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, err => {
            if (err) return reject(err);

            resolve('Success!')
        });
    });
};


// but we still have a problem here because we are still doing callbacks instead callbacks
/*
readFilePromisified(`${__dirname}/dog.txt`)
    .then(res => {
        console.log(`Breed: ${res}`);
        superagent
            .get(`https://dog.ceo/api/breed/${res}/images/random`)
            .then(res => {
                console.log(res.body.message);
                writeFilePromisified(`${__dirname}/dog-img.txt`, res.body.message)
                    .then(res => console.log(res))
                    .catch(err => console.log(err))
            })
            .catch(err => {
                console.log(err.message);
            })
    });
*/

// what we wanna do is chain the then handlers
// and to do that we have to make each handler return a promise

readFilePromisified(`${__dirname}/dog.txt`)
    .then(res1 => {
        console.log(`Breed: ${res1}`);
        return superagent
            .get(`https://dog.ceo/api/breed/${res1}/images/random`)
    })
    .then(res2 => {
        console.log(res2.body.message);
        return writeFilePromisified(`${__dirname}/dog-img.txt`, res2.body.message)
    })
    .then(res3 => {
        console.log(res3)
    })
    .catch(err => {
        console.log(err.message)
    });

// so the trick for chaining .then method is to make sure that each .then returns a promise which we can handle with .then and which will return a promise agai and will be handled by the .then and so on...