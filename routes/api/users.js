const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const validateRegisterInput = require('../../validation/register');
const router = express.Router();
const User = require("../../models/User");
const keys = require('../../config/keys');
const passport = require("passport");

// @route POST api/users/register
// @description Register User
// @access Public Route
router.post("/register", (req, res) => {
    //Validation
    const {errors, isValid} = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({
            email: req.body.email,
        })
        .then((user) => {
            if (user) {
                return res.status(400).json({
                    email: "Email already exists",
                });
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: "200",
                    r: "pg",
                    d: "mm",
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password,
                });

                //Hashing of password
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;

                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;

                        newUser.password = hash;
                        newUser
                            .save()
                            .then((user) => res.json(user))
                            .catch((err) => console.log(err));
                    });
                });
            }
        })
        .catch((err) => console.log(err));
});

//@route POST api/users/login
//@desc Login User Page
//@access Public
router.post('/login', (req, res) => {
    //validate email and password
    const email = req.body.email;
    const password = req.body.password;

    //Find user by email
    User.findOne({
            email
        })
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    email: "User not found."
                });
            }

            //Check Password
            bcrypt.compare(password, user.password)
                .then((isMatch) => {
                    if (isMatch) {
                        //create payload
                        const payload = {
                            name: user.name,
                            id: user.id,
                            avatar: user.avatar,
                        };

                        //sign token
                        jwt.sign(payload, keys.secretOrKey, {
                            expiresIn: 3600
                        }, (err, token) => {
                            if (err) throw err;
                            if (token) {
                                return res.json({
                                    // msg: "Success generating token",
                                    token: 'Bearer ' + token
                                });
                            } else {
                                //passwords did not match
                                res.status(400).json({
                                    password: "Incorrect Password"
                                });
                            }
                        });
                    }
                });
        })
        .catch();
})

//@route GET /api/users/current
//@desc Return the current user info
//@access Private - this means there is an added layer in between the route and call back function

router.get('/current', passport.authenticate('jwt', ({
    session: false
})), (req, res) => {
    return res.json(req.user);
})

//@route /api/users/delete
//@access Private
//@desc Delete a user

router.delete('/delete', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    User.findOneAndRemove({
        _id: req.user.id
    }).then(() => res.json({
        success: true
    })).catch(err => console.log(err));
})

module.exports = router;