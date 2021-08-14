const express = require("express");
// const ejs = require("ejs");
const expressjslayouts = require("express-ejs-layouts");
const path = require("path");

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.use(expressjslayouts);
app.set("views", path.join(__dirname, "/resources/view"));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("listening on port http://localhost:" + PORT);
});
