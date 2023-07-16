const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUser,
  getUser,
  loginUser,
} = require("../controller/user");

router.put("/create", (req, res) => {
  createUser(req, res);
});

router.post("/login", (req, res) => {
  loginUser(req, res);
});

router.get("/:email", (req, res) => {
  getUser(req, res);
});

router.get("/", (req, res) => {
  getAllUser(req, res);
});

module.exports = router;
