const express = require("express");
const passport = require("passport");
const { register, setPassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// ======= Email & Password =======
router.post("/register", register);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: `/api/v1/profile`,
    failureRedirect: "/api/v1/auth/invalid-credentials",
  })
);

// ========= Set Password =========
router.put("/set-password", protect, setPassword);
// router.put(
//   "/set-password",
//   (req, res, next) => {
//     req.user = {
//       id: 1,
//       name: "Muhammad Hidayatullah",
//       email: "dayatproject@gmail.com",
//       image_identity:
//         "https://lh4.googleusercontent.com/-0r4FXPpb5Iw/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuck50RmZNSvYV7lKL1SJaXXDY4vU_A/s96-c/photo.jpg",
//       username: "dayatproject@gmail.com",
//       password: null,
//       registration_date: "2021-02-26T08:09:06.000Z",
//     };
//     next();
//   },
//   setPassword
// );

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
  passport.authenticate("google", { failureRedirect: "/api/v1/auth/failed" }),
  function (req, res) {
    res.redirect(`${process.env.CLIENT_URI}/profile`);
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
  passport.authenticate("facebook", { failureRedirect: "/api/v1/auth/failed" }),
  (req, res) => {
    // res.redirect("/profile");
    res.redirect(`${process.env.CLIENT_URI}/profile`);
  }
);

// ============ Github ============
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/api/v1/auth/failed" }),
  function (req, res) {
    // res.redirect("/profile");
    res.redirect(`${process.env.CLIENT_URI}/profile`);
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
