const crypto = require("node:crypto");
module.exports = function sessionOptions(store) {
  return {
    secret:
      process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    ...(store ? { store } : {}),
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 1800000,
    },
  };
};
