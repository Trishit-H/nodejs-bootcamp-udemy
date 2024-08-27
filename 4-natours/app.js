const fs = require('fs');
const express = require('express');

// adds various methods of express
const app = express();

// middleware
app.use(express.json());

const PORT = 3000;

// //routes
// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Hello from the server....', app: 'natorus' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this url');
// });

// reading mock data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// GET route to get all the tours
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// GET route to get one specific tour through params
app.get('/api/v1/tours/:id', (req, res) => {
  // converting the id to Number type because everything is stored as string in req.params
  const id = parseInt(req.params.id);

  // using find method to access the object whose id matches with the one in the params
  // if no object found, then find returns undefined
  const tour = tours.find((element) => element.id === id);

  // checking if the tour exists or not
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// POST route to create a new tour
app.post('/api/v1/tours', (req, res) => {
  // creating id for each new post
  const newId = tours[tours.length - 1].id + 1;

  // Object.assign to merge two objects
  // could also spread operator - { id: newId, ...req.body }
  const newTour = Object.assign({ id: newId }, req.body);

  // adding this tour to the tours array
  tours.push(newTour);

  // persisting this data into the json file
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
});

// starting the server
app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}`);
});
