const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Event = require("../models/Event");
const Gallery = require("../models/Gallery");
const Photo = require("../models/Photo");
const cloudinary = require("../config/cloudinary");

const createEvent = async (data, adminId) => {
  const event = await Event.create({
    ...data,
    createdBy: adminId,
  });

  return event;
};

const getEvents = async (user) => {
  if (user.role === "admin") {
    return Event.find({ createdBy: user.id })
      .populate("teamMembers", "name email role")
      .sort({ eventDate: -1 });
  }

  return Event.find({ teamMembers: user.id })
    .populate("createdBy", "name email")
    .populate("teamMembers", "name email role")
    .sort({ eventDate: -1 });
};

const getEventById = async (eventId, user) => {
  const event = await Event.findById(eventId)
    .populate("createdBy", "name email role")
    .populate("teamMembers", "name email role");

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  const isAdminOwner =
    user.role === "admin" &&
    event.createdBy._id.toString() === user.id;

  const isAssignedTeamMember =
    user.role === "team_member" &&
    event.teamMembers.some(
      (member) => member._id.toString() === user.id
    );

  if (!isAdminOwner && !isAssignedTeamMember) {
    const error = new Error(
      "You are not authorized to access this event"
    );
    error.statusCode = 403;
    throw error;
  }

  return event;
};

const getGalleryByEventId = async (eventId, adminId) => {
  const event = await Event.findById(eventId).select(
    "createdBy"
  );

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (event.createdBy.toString() !== adminId) {
    const error = new Error(
      "You are not authorized to access this event gallery"
    );
    error.statusCode = 403;
    throw error;
  }

  const gallery = await Gallery.findOne({ eventId })
    .populate(
      "photoIds",
      "eventId uploadedBy filename storageUrl storagePublicId fileSize createdAt"
    )
    .populate("createdBy", "name email role");

  if (!gallery) {
    const error = new Error("Gallery not found");
    error.statusCode = 404;
    throw error;
  }

  return gallery;
};

/*
 * Delete an event and all resources belonging to it.
 */
const deleteEvent = async (eventId, adminId) => {
  const event = await Event.findById(eventId).select(
    "createdBy"
  );

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (event.createdBy.toString() !== adminId) {
    const error = new Error(
      "You are not authorized to delete this event"
    );
    error.statusCode = 403;
    throw error;
  }

  const photos = await Photo.find({ eventId }).select(
    "storagePublicId"
  );

  const publicIds = photos
    .map((photo) => photo.storagePublicId)
    .filter(Boolean);

  if (publicIds.length > 0) {
    try {
      await cloudinary.api.delete_resources(publicIds, {
        resource_type: "image",
        type: "upload",
      });
    } catch (error) {
      console.error(
        "Cloudinary event cleanup failed:",
        error
      );

      const cleanupError = new Error(
        "Failed to delete event photos from storage. The event was not deleted."
      );

      cleanupError.statusCode = 500;

      throw cleanupError;
    }
  }

  await Gallery.deleteOne({ eventId });
  await Photo.deleteMany({ eventId });
  await Event.deleteOne({ _id: eventId });

  return {
    eventId,
    deletedPhotos: photos.length,
  };
};

const getTeamMembers = async () => {
  return User.find({ role: "team_member" })
    .select("name email role createdAt")
    .sort({ createdAt: -1 });
};

const createTeamMember = async ({
  name,
  email,
  password,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error(
      "A user with this email already exists"
    );
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const teamMember = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "team_member",
  });

  return {
    id: teamMember._id,
    name: teamMember.name,
    email: teamMember.email,
    role: teamMember.role,
  };
};

const assignTeamMember = async (
  eventId,
  userId,
  adminId
) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (event.createdBy.toString() !== adminId) {
    const error = new Error(
      "You are not authorized to modify this event"
    );
    error.statusCode = 403;
    throw error;
  }

  const teamMember = await User.findOne({
    _id: userId,
    role: "team_member",
  });

  if (!teamMember) {
    const error = new Error("Team member not found");
    error.statusCode = 404;
    throw error;
  }

  const alreadyAssigned = event.teamMembers.some(
    (memberId) =>
      memberId.toString() === userId
  );

  if (alreadyAssigned) {
    const error = new Error(
      "Team member is already assigned"
    );
    error.statusCode = 400;
    throw error;
  }

  event.teamMembers.push(userId);

  await event.save();

  return Event.findById(eventId).populate(
    "teamMembers",
    "name email role"
  );
};

/*
 * Remove a team member from an event.
 *
 * IMPORTANT:
 * This removes ONLY the event assignment.
 *
 * The user account remains untouched.
 * Existing photos remain untouched.
 *
 * The operation is intentionally idempotent:
 * if the member is already removed, we simply
 * return the current event instead of throwing 400/404.
 */
const removeTeamMember = async (
  eventId,
  userId,
  adminId
) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  // Only the Admin who owns the event can modify it.
  if (event.createdBy.toString() !== adminId) {
    const error = new Error(
      "You are not authorized to modify this event"
    );
    error.statusCode = 403;
    throw error;
  }

  const wasAssigned = event.teamMembers.some(
    (memberId) =>
      memberId.toString() === userId.toString()
  );

  /*
   * If the member is already removed, don't treat
   * that as an error.
   */
  if (!wasAssigned) {
    const currentEvent = await Event.findById(eventId)
      .populate(
        "teamMembers",
        "name email role"
      );

    return {
      event: currentEvent,
      alreadyRemoved: true,
    };
  }

  /*
   * Remove only the assignment.
   *
   * Do NOT delete:
   * - User
   * - Photos
   * - Cloudinary files
   */
  event.teamMembers = event.teamMembers.filter(
    (memberId) =>
      memberId.toString() !== userId.toString()
  );

  await event.save();

  const updatedEvent = await Event.findById(
    eventId
  ).populate(
    "teamMembers",
    "name email role"
  );

  return {
    event: updatedEvent,
    alreadyRemoved: false,
  };
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getGalleryByEventId,
  deleteEvent,
  getTeamMembers,
  createTeamMember,
  assignTeamMember,
  removeTeamMember,
};