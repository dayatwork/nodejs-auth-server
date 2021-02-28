require("dotenv").config();
const express = require("express");
const app = express();
// const cors = require("cors");
const passport = require("passport");
const cookieSession = require("cookie-session");

// Initialize PassportJS
require("./passport/init")(passport);

// Routes
const authRoutes = require("./routes/auth.route");
const { protect } = require("./middleware/auth.middleware");

// Middlewares
// if (process.env.NODE_ENV === "development") {
//   app.use(cors()); //development
// } else {
//   app.use(cors({ origin: "https://nodejs-auth.dayat.dev", credentials: true })); // production
// }

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Unprotected Route
app.get("/", (req, res) =>
  res.status(200).json({ message: "NodeJS Authentication" })
);

app.get("/profile", (req, res) => res.status(200).json({ user: req.user }));

// Protected Route
app.get("/protect", protect, (req, res) => {
  res.status(200).json({
    title: "This is a protected page",
    message: "You should  not get access to this page if you are not logged in",
  });
});

// Routes Middlewares
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
