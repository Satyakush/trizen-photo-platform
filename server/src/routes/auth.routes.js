const express = require("express");

const {
  register,
  login,
} = require("../controllers/auth.controller");

const validate = require("../middleware/validate.middleware");
const requireSetupKey = require("../middleware/setup.middleware");

const {
  registerSchema,
  loginSchema,
} = require("../validators/auth.validator");

const router = express.Router();

router.post(
  "/register",
  requireSetupKey,
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

module.exports = router;
