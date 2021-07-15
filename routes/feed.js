const express = require('express');
const { body } = require('express-validator/check');
const feedController = require('../controllers/feedController');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

router.get('/posts',isAuth, feedController.getPosts);

router.post(
  '/post',
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ],
  feedController.postPost
);

router.get('/post/:postId', feedController.getPost);

// router.patch('post/:postId', feedController.patchPost);

router.patch(
  '/post/:postId',
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ],
  feedController.patchPost
);

router.delete('/post/:postId', feedController.deletePost);

module.exports = router;
