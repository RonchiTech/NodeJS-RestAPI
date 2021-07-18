const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const User = require('../models/user');
const io = require('../socket');
exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
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

exports.postPost = async (req, res, next) => {
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
  try {
    const post = new Post({
      title,
      imageUrl: imageUrl,
      content,
      creator: req.userId,
    });
    const _post = await post.save();

    // console.log('RESULT::', result);
    const user = await User.findById(req.userId);

    _creator = user;
    user.posts.push(post);
    const result = await user.save();
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    });
    console.log('POST:::', post);
    console.log('result:::', result);

    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: { _id: _creator._id, name: _creator.name },
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId).populate('creator');

    if (!post) {
      const error = new Error('Post Not Found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.patchPost = async (req, res, next) => {
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
  try {
    const post = await Post.findById(postId);

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
    const result = await post.save();
    res.status(200).json({ message: 'Post updated!', post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
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
    const resnpose = await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    const response = await user.save();
    res
      .status(200)
      .json({ message: 'Post deleted successfully!', post: response });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  const fileP = path.join(process.cwd(), filePath);
  fs.unlink(fileP, (err) => console.log(err));
};
