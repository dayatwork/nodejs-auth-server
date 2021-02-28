const express = require("express");
const passport = require("passport");
const { register, setPassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// ======= Email & Password =======
router.post("/register", register);

// router.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: `/profile`,
//     failureRedirect: "/auth/invalid-credentials",
//   })
// );
router.post(
  "/login",
  passport.authenticate("local", {
    // successRedirect: `/profile`,
    failureRedirect: "/auth/invalid-credentials",
  }),
  (req, res, next) => {
    console.log("middleware login", req.user);
    next();
  }
);

// ========= Set Password =========
router.put("/set-password", protect, setPassword);

// ============ Google ============
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failed" }),
  function (req, res) {
    res.redirect("/profile");
  }
);

// ============ Facebook ============
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/auth/failed" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

// ============ Github ============
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/failed" }),
  function (req, res) {
    res.redirect(`/profile`);
  }
);

router.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.status(200).json({ message: "logout" });
});

router.get("/success", (req, res) => {
  return res.status(200).json({
    message: "Logged in!",
  });
});

router.get("/failed", (req, res) => {
  return res.status(500).json({
    error: "You failed to log in!",
  });
});

router.get("/invalid-credentials", (req, res) => {
  return res.status(400).json({
    error: "Invalid Credentials",
  });
});

module.exports = router;
