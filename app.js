const express = require('express');
const feedRoutes = require('./routes/feed');
const bodyParser = require('body-parser');
const app = express();

// app.use(bodyParser.urlencoded({ extended: false })); //x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(feedRoutes);

app.use('/', (req, res, next) => {
  res.status(200).json({ message: 'Hello World' });
});

app.listen(8080);
