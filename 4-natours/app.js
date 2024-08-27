const fs = require('fs');
const express = require('express');

// adds various methods of express
const app = express();

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

// starting the server
app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}`);
});
