const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: 'a9gk129gj1',
        title: 'First Post',
        content: 'This is my first post',
        imageUrl: '/images/bits.jpg',
        creator: { name: 'Ronchi Pogi' },
        createdAt: new Date(),
      },
    ],
  });
};

exports.postPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).json({
      message: 'Validation failed, entered data is incorrect.',
      errors: errors.array(),
    });
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.body.imageUrl;
  //Create Post in DB
  const post = new Post({
    title,
    imageUrl: 'images/test.jpg',
    content,
    creator: { name: 'Ronchi Floyd' },
  });
  post
    .save()
    .then((result) => {
      console.log('RESULT::', result);
      res.status(201).json({
        message: 'Post created successfully!',
        post: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
