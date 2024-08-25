const express = require('express');

// adds various methods of express
const app = express();

const PORT = 3000;

//routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from the server....', app: 'natorus' });
});

app.post('/', (req, res) => {
  res.send('You can post to this url');
});

// starting the server
app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}`);
});
