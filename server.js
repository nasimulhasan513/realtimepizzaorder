require("dotenv").config();
const express = require("express");
const expressjslayouts = require("express-ejs-layouts");
const path = require("path");
const mongoose = require("mongoose");
const routes = require("./routes/web");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");

const app = express();

// db connection

const url = "mongodb://localhost/pizza";
mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
});

const connection = mongoose.connection;

connection
  .once("open", () => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("connection error");
  });
// session store
let mongoStore = MongoDbStore.create({
  mongoUrl: url,
  collection: "sessions",
});

// session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// Global Middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(flash());
app.use(express.static("public"));
app.use(express.json());
app.use(expressjslayouts);
app.set("views", path.join(__dirname, "/resources/view"));
app.set("view engine", "ejs");

routes(app);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("listening on port http://localhost:" + PORT);
});
