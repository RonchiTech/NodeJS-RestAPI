const express = require('express');
const path = require('path');
const feedRoutes = require('./routes/feed');
const bodyParser = require('body-parser');
const app = express();

// app.use(bodyParser.urlencoded({ extended: false })); //x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(express.static(path.join(process.cwd(), 'public')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

app.use('/api', feedRoutes);

app.use('/', (req, res, next) => {
  res.status(200).json({ message: 'Hello World' });
});

app.listen(8080, () => {
  console.log('App is listening at http://localhost:8080');
});
