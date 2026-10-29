const express = require("express");
const apiFactory = require("../controllers/api/AuthApiController");
const { csrf } = require("../middlewares/csrf.middleware");
const { requireApiAuth } = require("../middlewares/auth.middleware");
module.exports = (auth) => {
  const router = express.Router(),
    controller = apiFactory(auth);
  router.get("/csrf", controller.csrf);
  router.post("/login", csrf, controller.login);
  router.get("/me", requireApiAuth, controller.me);
  router.post("/logout", requireApiAuth, csrf, controller.logout);
  return router;
};
