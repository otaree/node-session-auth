const express = require('express');
const router = express.Router();
const _ = require('lodash');

const User = require('../models/user');
const requiresLogin = require('../uitls/authenticate');

// GET /
router.get('/', (req, res) => {
    res.sendFile('/index.html');
});

router.post('/', (req, res, next) => {
    const user = _.pick(req.body, ["email", "username", "password", "passwordConf"]);

    if (Object.keys(user).length === 4) {
        const newUser = new User(user);

        newUser.save()
            .then(() => res.redirect('/'))
            .catch((err) => next(err));
    } else {
        let err = new Error('Please fill all field');
        next(err);
    }
});

router.get('/profile', requiresLogin, (req, res, next) => {
    const userId = req.session.userId;
    User.findById(userId)
        .then(user => {
            if (user) {
                res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Profile</title>
                </head>
                <body>
                    <h1>Name:${user.username}</h1>
                    <h2>Email:${user.email}</h2>
                    <p>
                        <a href='/logout'>Logout</a>
                    </p>
                </body>
                </html>
                `)
            } else {
                throw Error('user not found');
            }
        }).catch(err => next(err));


});

router.post('/login', (req, res, next) => {
    const body = _.pick(req.body, ["email", "password"]);

    if (Object.keys(body).length === 2) {
        User.authenticate(body.email, body.password, (err, user) => {
            if (err) {
                return next(err);
            } else if (user) {
                req.session.userId = user._id;
                res.redirect('/profile');
            } else {
                res.redirect('/');
            }
        });
    } else {
        let err = new Error('Please fill all field');
        next(err);
    }

});

router.get('/logout', (req, res, next) => {
    if (req.session) {
        // delete session object
        req.session.destroy(err => {
            if (err) {
                return next(err);
            } else {
                res.redirect('/');
            }
        });
    }
});

module.exports = router;