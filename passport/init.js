const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const bcrypt = require("bcryptjs");

const db = require("../db");

function initialize(passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (userId, done) {
    const result = await db.query("SELECT * FROM users WHERE id = $1 ", [
      userId,
    ]);
    const user = result.rows[0];
    done(null, user);
  });

  // =======================
  // == Passport Strategy ==
  // =======================
  // 1. Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async function (email, password, done) {
        const userDB = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);

        if (!userDB.rows.length) {
          return done(null, false, { message: "Invalid Credentials" });
        }

        const passwordMatch = await bcrypt.compare(
          password,
          userDB.rows[0].password
        );

        if (!passwordMatch) {
          return done(null, false, { message: "Invalid Credentials" });
        }

        return done(null, userDB.rows[0]);
      }
    )
  );

  // ==============================================================================
  // ========= Callback for 3rd party provider (Google, Facebook, Github) =========
  // ==============================================================================

  const callback = async function (accessToken, refreshToken, profile, done) {
    // Get user from database, and return user data if user exists
    const userDB = await db.query("SELECT * FROM users WHERE email = $1", [
      profile.emails[0].value,
    ]);

    if (userDB.rows.length) {
      return done(null, userDB.rows[0]);
    }

    // Create new user if user doesn't exist
    const user = {
      name: profile.displayName,
      email: profile.emails[0].value,
      imageIdentity: profile.photos[0].value,
      username: profile.emails[0].value,
      registrationDate: new Date().toISOString(),
    };

    const result = await db.query(
      "INSERT INTO users(name, email, image_identity, username, registration_date) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [
        user.name,
        user.email,
        user.imageIdentity,
        user.username,
        user.registrationDate,
      ]
    );

    return done(null, result.rows[0]);
  };

  // 2. Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/v1/auth/google/callback",
      },
      callback
    )
  );

  // 3. Facebook Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/v1/auth/facebook/callback",
        profileFields: ["id", "displayName", "email", "photos"],
      },
      callback
    )
  );

  // 4. Github Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/v1/auth/github/callback",
      },
      callback
    )
  );
}

module.exports = initialize;
