const bcrypt = require("bcryptjs");

const db = require("../db");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const userDB = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (userDB.rows.length) {
    return res.status(400).json({
      error: "Email already exists",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = {
    name,
    email,
    username: email,
    registrationDate: new Date().toISOString(),
  };

  const result = await db.query(
    "INSERT INTO users(name, email, username, password, registration_date) VALUES($1, $2, $3, $4, $5) RETURNING *",
    [
      user.name,
      user.email,
      user.username,
      hashedPassword,
      user.registrationDate,
    ]
  );

  res.status(201).json({
    message: "Account created",
  });
};

const setPassword = async (req, res) => {
  const { password } = req.body;

  const userDB = await db.query("SELECT * FROM users WHERE email = $1", [
    req.user.email,
  ]);

  if (userDB.rows.length && !userDB.rows[0].password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      "UPDATE users SET password = $1 WHERE email = $2 RETURNING *",
      [hashedPassword, userDB.rows[0].email]
    );

    return res.status(200).json({
      message: "Password Added!",
    });
  }

  res.status(403).json({
    error: "Forbidden",
  });
};

module.exports = {
  register,
  setPassword,
};
