const fs = require('fs');
const superagent = require('superagent'); // to send api requests

fs.readFile(`${__dirname}/dog.txt`, 'utf-8', (err, data) => {
  if (err) return console.log(err.message);
  console.log(`Breed: ${data}`);

  superagent
    // get method to send request to the url
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .then((res) => {
      console.log(res.body.message);

      // then write the data into a file
      fs.writeFile(`${__dirname}/dog-img.txt`, res.body.message, (err) => {
        if (err) return console.log('Error writing file:', err.message);
        console.log('File written!');
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// the get method of superagent returns a promise
// promise is an object that encapsulates the result of an asynchronous operation
// promise implements the concept of future value
// basically a value that we are expecting to recieve sometime in the future
// the promise is immediately available and it's promising us that it will get some data back in the future
