const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createEventSchema,
  eventIdSchema,
  createTeamMemberSchema,
  assignTeamMemberSchema,
  userIdSchema,
} = require("../validators/event.validator");

const {
  createEvent,
  getEvents,
  getEventById,
  getGalleryByEventId,
  deleteEvent,
  getTeamMembers,
  createTeamMember,
  assignTeamMember,
  removeTeamMember,
} = require("../controllers/event.controller");

const router = express.Router();

/*
 * CREATE EVENT
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createEventSchema),
  createEvent
);

/*
 * GET EVENTS
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "team_member"),
  getEvents
);

/*
 * TEAM MEMBERS
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

/*
 * EVENT GALLERY
 */
router.get(
  "/:eventId/gallery",
  authenticate,
  authorize("admin"),
  validate(eventIdSchema, "params"),
  getGalleryByEventId
);

/*
 * REMOVE TEAM MEMBER FROM EVENT
 *
 * Both eventId and userId are validated.
 * The validation middleware now preserves both params.
 */
router.delete(
  "/:eventId/team/:userId",
  authenticate,
  authorize("admin"),
  validate(eventIdSchema, "params"),
  validate(userIdSchema, "params"),
  removeTeamMember
);

/*
 * DELETE EVENT
 */
router.delete(
  "/:eventId",
  authenticate,
  authorize("admin"),
  validate(eventIdSchema, "params"),
  deleteEvent
);

/*
 * GET EVENT BY ID
 */
router.get(
  "/:eventId",
  authenticate,
  authorize("admin", "team_member"),
  validate(eventIdSchema, "params"),
  getEventById
);

/*
 * ASSIGN TEAM MEMBER
 */
router.post(
  "/:eventId/team",
  authenticate,
  authorize("admin"),
  validate(eventIdSchema, "params"),
  validate(assignTeamMemberSchema),
  assignTeamMember
);

module.exports = router;