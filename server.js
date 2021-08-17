require("dotenv").config();
const express = require("express");
const expressjslayouts = require("express-ejs-layouts");
const path = require("path");
const mongoose = require("mongoose");
const routes = require("./routes/web");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");
const passport = require("passport");
const Emitter = require("events");

const app = express();

// db connection

const url = process.env.CONNECTION_URL;
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
// create emmite connectionr
const eventEmitter = new Emitter();

app.set("eventEmitter", eventEmitter);

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

// passport configuration
const passportConfig = require("./app/config/passport");
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global Middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

app.use(flash());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressjslayouts);
app.set("views", path.join(__dirname, "/resources/view"));
app.set("view engine", "ejs");

routes(app);
app.use((req, res) => {
  res.status(404).render("errors/404");
});

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log("listening on port http://localhost:" + PORT);
});

const io = require("socket.io")(server);

io.on("connection", (socket) => {
  // join
  socket.on("join", (roomName) => {
    socket.join(roomName);
    console.log("joined: " + roomName);
  });
});

eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});
eventEmitter.on("orderPlaced", (data) => {
  console.log("emitted to admin");
  io.to("adminRoom").emit("orderPlaced", data);
});
