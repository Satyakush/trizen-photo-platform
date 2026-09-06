const { z } = require("zod");

const eventIdSchema = z.object({
  eventId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid event ID"
    ),
});

module.exports = {
  eventIdSchema,
};