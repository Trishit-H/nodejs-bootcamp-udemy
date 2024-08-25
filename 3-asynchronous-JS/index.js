// What are we gonna do - we are gonna read the breed of the dog from the dog.txt file and do an http request to the get the image of that dog breed and save it to another text file.
// Alll will be done by callback functions to see the problem
// API - https://dog.ceo/api/breed/hound/images/random
// replace 'hound' with any dog breed

const fs = require('fs');
const superagent = require('superagent'); // to send api requests

fs.readFile(`${__dirname}/dog.txt`, 'utf-8', (err, data) => {
  if (err) return console.log(err.message);
  console.log(`Breed: ${data}`);

  superagent
    // get method to send request to the url
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    // first parameter - error, second parameter - resullt/response
    // the response of the api is in res.body
    .end((err, res) => {
      if (err) return console.log(err.message);
      console.log(res.body.message); // message contains the image url

      // then write the data into a file
      fs.writeFile(`${__dirname}/dog-img.txt`, res.body.message, (err) => {
        if (err) return console.log('Error writing file:', err.message);
        console.log('File written!');
      });
    });
});

// here 3 callbacks are nested each other.
// with even more callbacks, this coudl lead to bad code readability and makes it hard to maintain
