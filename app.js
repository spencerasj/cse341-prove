const path = require("path");
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;
const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

const corsOptions = {
  origin: "https://cse341-prove-heroku.herokuapp.com/",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false,
  family: 4,
};

// const MONGODB_URL =
//   process.env.MONGODB_URL ||
//   "mongodb+srv://Jen:fifl6xklo2dFi0w8@cluster0.b2hr6.mongodb.net/shop?retryWrites=true&w=majority";

mongoose
  // .connect(MONGODB_URL, options)
  // .then((result) => {
  //   User.findOne().then((user) => {
  //     if (!user) {
  //       const user = new User({
  //         name: "Jen",
  //         email: "jen@test.com",
  //         cart: {
  //           items: [],
  //         },
  //       });
  //       user.save();
  //     }
  //   });
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  })
  .catch((err) => {
    console.log(err);
  });
