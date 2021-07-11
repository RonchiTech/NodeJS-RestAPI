const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');
const bodyParser = require('body-parser');

const MONGODB_URI =
  'mongodb+srv://ronchinodejs:3vPLxB5YBlzDn0R0@cluster0.d74th.mongodb.net/messages';

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

app.use((error, req, res, next) => {
  console.log(error);
  const errStatus = error.statusCode || 500;
  const errMessage = error.message;
  res.status(errStatus).json({ message: errMessage });
});
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(8080, () => {
      console.log('App is listening at http://localhost:8080');
    });
  })
  .catch((err) => {
    console.log(err);
  });
