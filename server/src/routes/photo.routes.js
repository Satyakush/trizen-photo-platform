const express = require("express");

const {
  uploadPhotos,
  getEventPhotos,
  getMyPhotos,
} = require("../controllers/photo.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");
const validate = require("../middleware/validate.middleware");

const {
  eventIdSchema,
} = require("../validators/photo.validator");

const router = express.Router();

router.post(
  "/:eventId/photos",
  authenticate,
  authorize("admin", "team_member"),
  validate(eventIdSchema, "params"),
  upload.array("photos", 20),
  uploadPhotos
);

router.get(
  "/:eventId/photos",
  authenticate,
  authorize("admin", "team_member"),
  validate(eventIdSchema, "params"),
  getEventPhotos
);

router.get(
  "/:eventId/my-photos",
  authenticate,
  authorize("team_member"),
  validate(eventIdSchema, "params"),
  getMyPhotos
);

module.exports = router;