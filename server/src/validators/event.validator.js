const { z } = require("zod");

const createEventSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Event name must be at least 2 characters")
    .max(100, "Event name must not exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .default(""),

  eventDate: z.coerce.date({
    error: "Please provide a valid event date",
  }),
});

const createTeamMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

const assignTeamMemberSchema = z.object({
  userId: z
    .string()
    .min(1, "Team member ID is required"),
});

module.exports = {
  createEventSchema,
  createTeamMemberSchema,
  assignTeamMemberSchema,
};