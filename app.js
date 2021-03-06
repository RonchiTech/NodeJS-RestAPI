const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const cors = require('cors');
const MONGODB_URI =
  'mongodb+srv://ronchinodejs:3vPLxB5YBlzDn0R0@cluster0.d74th.mongodb.net/messages';

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded({ extended: false })); //x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use('/images', express.static(path.join(process.cwd(), 'images')));

// app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PATCH,PUT,DELETE,OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

app.use('/api', feedRoutes);
app.use('/auth', authRoutes);

// app.use('/', (req, res, next) => {
//   res.status(200).json({ message: 'Hello World' });
// });

app.use((error, req, res, next) => {
  console.log(error);
  const errStatus = error.statusCode || 500;
  const errMessage = error.message;
  const data = error.data;
  res.status(errStatus).json({ message: errMessage, data });
});
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    const server = app.listen(8080, ()=> {
      console.log('Server is running on port 8080');
    });
    // console.log('SERVER:',server);
    const io = require('./socket').init(server);
    io.on('connection', (socket) => {
      console.log('Client Connected!!');
      // console.log('Socket:::', socket);
    });
  })
  .catch((err) => {
    console.log(err);
  });
