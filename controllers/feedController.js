const { validationResult } = require('express-validator/check');

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

  //Create Post in DB

  res.status(201).json({
    message: 'Post created successfully!',
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: { name: 'Ronchi Floyd' },
      createdAt: new Date(),
    },
  });
};
