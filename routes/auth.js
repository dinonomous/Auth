const express = require('express');
const router = express.Router();
const userModel = require("../config/database");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const { compareSync, hashSync } = require('bcrypt');
const passport = require('passport');

dotenv.config();

router.get('/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] })
);

router.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/login'
  })
);

/* POST login credentials. */
router.post("/login", (req, res) => {
  userModel.findOne({ userName: req.body.userName })
    .then(user => {
      if (!user) {
        // Use a 404 status code for "User not found"
        return res.status(404).json({ title: 'Login', success: false, message: 'User not found' });
      }

      if (!compareSync(req.body.password, user.password)) {
        // Use a 401 status code for "Unauthorized" or wrong password
        return res.status(401).json({ title: 'Login', success: false, message: 'Wrong password' });
      }

      const payload = { userName: user.userName, id: user._id };
      const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1d' });

      // Send JWT in response body instead of setting a cookie
      res.status(200).json({ success: true, message: 'Login successful', token });
    })
    .catch(err => {
      // Use a 500 status code for "Internal Server Error"
      res.status(500).json({ title: 'Login', success: false, message: `Something went wrong: ${err}` });
    });
});

/* POST register a new user. */
router.post("/register", (req, res) => {
  const user = new userModel({ userName: req.body.userName, password: hashSync(req.body.password, 10) });
  user.save()
    .then(user => {
      res.status(201).json({ success: true, message: 'User created successfully', user });
    })
    .catch(err => {
      res.status(500).json({ success: false, message: `Something went wrong: ${err}` });
    });
});

/* GET logout route. */
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logout successful' });
});

module.exports = router;
