const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        posts: posts
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
    // console.log(errors.array());
    // return res.status(422).json({
    //   message: 'Validation failed, entered data is incorrect.',
    //   errors: errors.array(),
    // });
  }

  const title = req.body.title;
  const content = req.body.content;
  // const imageUrl = req.body.imageUrl;
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
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Post Not Found');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
