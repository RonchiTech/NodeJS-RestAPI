const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      posts: posts,
      totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
  // .catch((err) => {
  //   if (!err.statusCode) {
  //     err.statusCode = 500;
  //   }
  //   next(err);
  // });
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
  if (!req.file) {
    const error = new Error('No attached file');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace('\\', '/');
  let _creator;
  const post = new Post({
    title,
    imageUrl: imageUrl,
    content,
    creator: req.userId,
  });
  post
    .save()
    .then((result) => {
      console.log('RESULT::', result);
      return User.findById(req.userId);
    })
    .then((user) => {
      _creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      console.log('POST:::', post);
      console.log('result:::', result);
      res.status(201).json({
        message: 'Post created successfully!',
        post: post,
        creator: { _id: _creator._id, name: _creator.name },
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

exports.patchPost = (req, res, next) => {
  console.log('HERE');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace('\\', '/');
  }
  if (!imageUrl) {
    const error = new Error('Image not attached.');
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Post Not Found');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const errPost = new Error('You are not authorized to delete this post');
        error.statusCode = 403;
        throw errPost;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Post updated!', post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Post Not Found');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const errPost = new Error('You are not authorized to delete this post');
        errPost.statusCode = 403;
        throw errPost;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((response) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((response) => {
      res
        .status(200)
        .json({ message: 'Post deleted successfully!', post: response });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  const fileP = path.join(process.cwd(), filePath);
  fs.unlink(fileP, (err) => console.log(err));
};
