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

// here we are tryna get 3 random dog images
// meaning 3 requests to the url
// and we will learn how to resolve such many promises together
const getDogPic = async () => {
  try {
    const data = await readFilePromisified(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);

    // each returns a promise
    const res1Promise = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    const res2Promise = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    const res3Promise = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);

    // here promise.all will returns a single promise that resolves when all input promise have been resolved
    // the returned promise resolves into an array of the results of the input promises
    const all = await Promise.all([res1Promise, res2Promise, res3Promise]);

    const imgs = all.map((el) => el.body.message);
    console.log(imgs);

    // console.log(`Image url: ${res.body.message}`);

    await writeFilePromisified(`${__dirname}/dog-img.txt`, imgs.join('\n'));
    console.log('File written!');
  } catch (error) {
    // console.log(error.message);

    // rethrowing so that we can catch it in the .catch() when handling this function
    throw error;
  }
  return '2: READY!!';
};

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
