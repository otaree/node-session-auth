const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();

// include routes
const routes = require('./routes/router');

// connect to mongoDB
mongoose.connect('mongodb://localhost:27017/session-auth');
const db = mongoose.connection;

// server static file from /public
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));


app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// error handler 
// define as the last app.use callback
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message
    });
});

// listen on port 3000
app.listen(3000, () => console.log(`Express app listening on port 3000`));