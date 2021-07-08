const express = require('express');
const feedController = require('../controllers/feedController');
const router = express.Router();

router.route('/post').get(feedController.getPosts).post(feedController.postPost)

module.exports = router;
