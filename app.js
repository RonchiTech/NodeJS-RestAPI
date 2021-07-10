const express = require('express');
const feedRoutes = require('./routes/feed');
const bodyParser = require('body-parser');
const app = express();

// app.use(bodyParser.urlencoded({ extended: false })); //x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

app.use(feedRoutes);

app.use('/', (req, res, next) => {
  res.status(200).json({ message: 'Hello World' });
});

app.listen(8080);
