const express = require("express");
const { getdb, mongooseConnect } = require("./util/database");

const userRoutes = require("./routes/user");
const codeRoutes = require("./routes/code");

const app = express();

app.use(express.json({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/user", userRoutes);

app.use("/code", codeRoutes);

// mongooseConnect(() => {
// });
app.listen(3001);
