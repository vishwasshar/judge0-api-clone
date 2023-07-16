const express = require("express");
const router = express.Router();
const {
  codeSubmission,
  fetchAllCode,
  fetchById,
  codeExecuter,
} = require("../controller/code");
const isAuth = require("../middleware/isAuth");

router.post("/submit", isAuth, (req, res) => {
  codeSubmission(req, res);
});

// console.log(max);
router.post("/execute", (req, res) => {
  if (req.body.lang == "c") {
    codeExecuter(req, res);
  } else {
    res.json({ res: "Language not Supported" });
  }
});

router.get("/:id", isAuth, (req, res) => {
  fetchById(req, res);
});

router.post("/", isAuth, (req, res) => {
  fetchAllCode(req, res);
});

module.exports = router;
