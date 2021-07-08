const express = require('express');
const feedRoutes = require('./routes/feed')
const app = express();
app.use('/',(req,res,next)=> {
    res.send('<h1>Hello World!</h1>');
})
app.use(feedRoutes);
app.listen(8080);
