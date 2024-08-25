const fs = require('fs');
const superagent = require('superagent');

// promisifying the readFile method, such that we only have to pass the file name
const readFilePromisified = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf-8', (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

// promisifying the writeFile method, such it takes only the file path(where data needs to written) and the data to be written
const writeFilePromisified = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) return reject(err);

      resolve('Success!');
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
    // console.log(error.message);

    // rethrowing so that we can catch it in the .catch() when handling this function
    throw error;
  }
  return '2: READY!!';
};

/*
console.log('1: Will get dog pics!');
const x = getDogPic();
console.log(x); // output  - Promise { <pending> }
console.log('3: Done getting dog pics!');
*/

/*
async function returns a promise
instead of returning '2: READY!!', it tells us that x is a promise, which at this point is still running and so it is pending. So JavaScript cannot know that x will be '2: READY!!' at some point so it moves to the next console.log
And by the time js actually knows that the x should be '2: READY!!', the js execution has already finished

but what should we do if we want to really get the return value. then we'd have to treat async function as promise. so we'd use the .then method on it or again use async/await
*/

// Like this 👇👇
/*
console.log('1: Will get dog pics!');
getDogPic()
    .then(x => {
        console.log(x);
        console.log('3: Done getting dog pics!');
    })
    .catch(err => {
        console.log('ERROR!')
    });
*/

/*
OUTPUT - 
1: Will get dog pics!
Breed: retriever
Image url: https://images.dog.ceo/breeds/retriever-curly/n02099429_16.jpg
File written!
2: READY!!
3: Done getting dog pics!
*/

// In the above code, the issue is that it mixees Promises with async/await
// So let's  use async/await to handle the return value of getDogPic function
// we are just using IIFE instead of writing a whole new named function

(async () => {
  try {
    console.log('1: Will get dog pics!');
    const x = await getDogPic();
    console.log(x);
    console.log('3: Done getting dog pics!');
  } catch (err) {
    console.log('ERROR!');
  }
})();
