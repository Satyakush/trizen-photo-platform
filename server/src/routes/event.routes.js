const express = require("express");

const {
  createEvent,
  getEvents,
  createTeamMember,
  assignTeamMember,
} = require("../controllers/event.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createEventSchema,
  createTeamMemberSchema,
  assignTeamMemberSchema,
} = require("../validators/event.validator");

const router = express.Router();

// Create an event
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createEventSchema),
  createEvent
);

// Get events for current user
router.get(
  "/",
  authenticate,
  authorize("admin", "team_member"),
  getEvents
);

// Create a team member
router.post(
  "/team-members",
  authenticate,
  authorize("admin"),
  validate(createTeamMemberSchema),
  createTeamMember
);

// Assign team member to an event
router.post(
  "/:eventId/team",
  authenticate,
  authorize("admin"),
  validate(assignTeamMemberSchema),
  assignTeamMember
);

module.exports = router;