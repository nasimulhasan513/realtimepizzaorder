const User = require("../../models/user");
const bcrypt = require("bcrypt");
const password = require("passport");
const passport = require("passport");
const authController = () => {
  return {
    login(req, res) {
      res.render("auth/login");
    },
    postLogin(req, res, next) {
      const { name, email, password } = req.body;
      if (!email || !password) {
        req.flash("error", "All fields are required.");
        req.flash("email", email);
        return res.redirect("/login");
      }
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          req.flash("error", info.message);
          return next();
        }
        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }
        req.login(user, (err) => {
          if (err) {
            req.flash("error", info.message);
          }
          return res.redirect("/");
        });
      })(req, res, next);
    },
    register(req, res) {
      res.render("auth/register");
    },
    async postRegister(req, res) {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        req.flash("error", "All fields are required.");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }
      // check if user is already registered
      User.exists({ email }, (err, result) => {
        if (result) {
          req.flash("error", "Email already exists.");
          req.flash("name", name);
          req.flash("email", email);
          return res.redirect("/register");
        }
      });
      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });

      user
        .save()
        .then(() => {
          // Login
          return res.redirect("/");
        })
        .catch((err) => {
          req.flash("error", "Something went wrong.");
          return res.redirect("/register");
        });
    },
    logout(req, res) {
      req.logout();
      return res.redirect("/");
    },
  };
};

module.exports = authController;
