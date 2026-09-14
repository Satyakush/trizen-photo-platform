const express = require("express");

const {
  createGallery,
  getGallery,
  updateGallery,
  publishGallery,
  verifyGalleryPin,
  getPublicGalleryPhotos,
} = require("../controllers/gallery.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const authenticateGallery = require("../middleware/gallery.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createGallerySchema,
  updateGallerySchema,
  eventIdSchema,
  galleryIdSchema,
  gallerySlugSchema,
  verifyGallerySchema,
} = require("../validators/gallery.validator");

const router = express.Router();

router.post(
  "/events/:eventId/galleries",
  authenticate,
  authorize("admin"),
  validate(eventIdSchema, "params"),
  validate(createGallerySchema),
  createGallery
);

router.get(
  "/galleries/:galleryId",
  authenticate,
  authorize("admin"),
  validate(galleryIdSchema, "params"),
  getGallery
);

router.put(
  "/galleries/:galleryId",
  authenticate,
  authorize("admin"),
  validate(galleryIdSchema, "params"),
  validate(updateGallerySchema),
  updateGallery
);

router.post(
  "/galleries/:galleryId/publish",
  authenticate,
  authorize("admin"),
  validate(galleryIdSchema, "params"),
  publishGallery
);

router.post(
  "/public/galleries/:slug/verify",
  validate(gallerySlugSchema, "params"),
  validate(verifyGallerySchema),
  verifyGalleryPin
);

router.get(
  "/public/galleries/:slug/photos",
  authenticateGallery,
  validate(gallerySlugSchema, "params"),
  getPublicGalleryPhotos
);

module.exports = router;
