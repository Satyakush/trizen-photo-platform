const { z } = require("zod");

const createGallerySchema = z.object({
  photoIds: z
    .array(
      z
        .string()
        .regex(
          /^[0-9a-fA-F]{24}$/,
          "Invalid photo ID"
        )
    )
    .min(1, "Select at least one photo"),

  pin: z
    .string()
    .regex(
      /^\d{4,6}$/,
      "PIN must contain 4 to 6 digits"
    ),
});

const eventIdSchema = z.object({
  eventId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid event ID"
    ),
});

const galleryIdSchema = z.object({
  galleryId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid gallery ID"
    ),
});

const gallerySlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Gallery slug is required")
    .max(150, "Invalid gallery slug"),
});

const verifyGallerySchema = z.object({
  pin: z
    .string()
    .regex(
      /^\d{4,6}$/,
      "PIN must contain 4 to 6 digits"
    ),
});

module.exports = {
  createGallerySchema,
  eventIdSchema,
  galleryIdSchema,
  gallerySlugSchema,
  verifyGallerySchema,
};