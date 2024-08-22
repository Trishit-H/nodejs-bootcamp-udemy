const fs = require('fs');
const superagent = require('superagent');

// promisifying the readFile method, such that we only have to pass the file name
const readFilePromisified = (file) => {
    // Return a new Promise object
    // the Promise object takes in a constructor function that is executed immediately
    return new Promise((resolve, reject) => {
        // Use the 'fs.readFile' method to read the content of the file
        // The method takes the 'file' argument (filename) and a callback function
        fs.readFile(file, 'utf-8', (err, data) => {
            // If an error occurs during the file reading, reject the Promise with the error
            if (err) return reject(err);

            // If reading the file is successful, resolve the Promise with the file data
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

const getDogPic = async () => {
    try {
        const data = await readFilePromisified(`${__dirname}/dog.txt`);
        console.log(`Breed: ${data}`);

        const res = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        console.log(`Image url: ${res.body.message}`);

        await writeFilePromisified(`${__dirname}/dog-img.txt`, res.body.message);
        console.log('File written!');
    } catch (error) {
        console.log(error.message);
    }
};

getDogPic();