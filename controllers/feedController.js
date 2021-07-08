exports.getPosts = (req, res, next) => {
  res.status(200).json({ message: 'Getting posts...' });
};

exports.postPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  //Create Post in DB

  res.status(201).json({
    message: 'Post created successfully!',
    post: {
      id: new Date().toISOString(),
      title,
      content,
    },
  });
};
