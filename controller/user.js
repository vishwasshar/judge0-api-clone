const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUser = (req, res) => {
  bcrypt
    .hash(req.body.password, 12)
    .then((hashedPw) => {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPw,
      });

      return newUser.save();
    })
    .then((data) => {
      res
        .status(201)
        .json({ message: "User Created Successfully", useId: data._id });
    })
    .catch(() => {
      console.log("Error in creating user");
    })
    .catch(() => {});
};

const loginUser = (req, res) => {
  let loadedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        res.send("err");
      }
      loadedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        res.json({ status: "Wrong Password" });
      } else {
        const token = jwt.sign({ userObj: loadedUser }, "viSecret", {
          expiresIn: "1h",
        });
        res.status(200).json({ message: "LoggedIn", token });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const getAllUser = (req, res) => {
  User.find()
    .then((data) => {
      res.json(data);
    })
    .catch(() => {
      console.log("err");
    });
};

const getUser = (req, res) => {
  User.find({ email: "vishwassharma@gmail.com" })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = { createUser, getAllUser, getUser, loginUser };
