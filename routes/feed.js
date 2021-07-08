const express = require('express');
const feedController = require('../controllers/feedController');
const router = express.Router();

router.route('/post').get(feedController.getPosts)

module.exports = router;
