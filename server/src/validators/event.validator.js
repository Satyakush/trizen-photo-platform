const { z } = require("zod");

const createEventSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Event name must be at least 2 characters")
    .max(100, "Event name must be at most 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .default(""),

  eventDate: z
    .string()
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "Invalid event date"
    ),
});

const eventIdSchema = z.object({
  eventId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid event ID"),
});

const createTeamMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
});

const assignTeamMemberSchema = z.object({
  userId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid team member ID"),
});

module.exports = {
  createEventSchema,
  eventIdSchema,
  createTeamMemberSchema,
  assignTeamMemberSchema,
};