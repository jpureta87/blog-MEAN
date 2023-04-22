const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((createdUser) => {
        res.status(201).json({
          message: "User created!",
          user: createdUser,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Invalid Authentication credentials!",
        });
      });
  });
};

exports.login = (req, res, next) => {
  let user;
  User.findOne({ email: req.body.email })
    .then((userData) => {
      if (!userData) {
        return res.status(401).json({
          message: "Invalid Authentication credentials!",
        });
      }
      user = userData;
      return bcrypt.compare(req.body.password, userData.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Invalid Authentication credentials!",
        });
      }
      const token = jwt.sign(
        { email: user.email, userId: user._id },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600, //1 hr in seconds
        userId: user._id,
      });
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Invalid Authentication credentials!",
      });
    });
};
