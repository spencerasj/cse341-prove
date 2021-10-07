const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const errorController = require("./controllers/error");
const User = require("./models/user");
const PORT = process.env.PORT || 5000;
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  User.findById("615e9777df2a32a9c29d756d")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://Jen:fifl6xklo2dFi0w8@cluster0.b2hr6.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Jen",
          email: "jen@test.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  })
  .catch((err) => {
    console.log(err);
  });
