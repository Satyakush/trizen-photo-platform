const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createEventSchema,
  eventIdSchema,
  createTeamMemberSchema,
  assignTeamMemberSchema,
} = require("../validators/event.validator");

const {
  createEvent,
  getEvents,
  getEventById,
  getTeamMembers,
  createTeamMember,
  assignTeamMember,
} = require("../controllers/event.controller");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createEventSchema),
  createEvent
);

router.get(
  "/",
  authenticate,
  authorize("admin", "team_member"),
  getEvents
);

/*
 * Team member management
 *
 * These routes must come BEFORE /:eventId
 * so "team-members" is not interpreted as an event ID.
 */

router.get(
  "/team-members",
  authenticate,
  authorize("admin"),
  getTeamMembers
);

router.post(
  "/team-members",
  authenticate,
  authorize("admin"),
  validate(createTeamMemberSchema),
  createTeamMember
);

router.get(
  "/:eventId",
  authenticate,
  authorize("admin", "team_member"),
  validate(eventIdSchema, "params"),
  getEventById
);

router.post(
  "/:eventId/team",
  authenticate,
  authorize("admin"),
  validate(eventIdSchema, "params"),
  validate(assignTeamMemberSchema),
  assignTeamMember
);

module.exports = router;