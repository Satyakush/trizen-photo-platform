const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Event = require("../models/Event");
const Gallery = require("../models/Gallery");

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
  const event = await Event.findById(eventId).select("createdBy");

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

const getTeamMembers = async () => {
  return User.find({ role: "team_member" })
    .select("name email role createdAt")
    .sort({ createdAt: -1 });
};

const createTeamMember = async ({ name, email, password }) => {
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

const assignTeamMember = async (eventId, userId, adminId) => {
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
    (memberId) => memberId.toString() === userId
  );

  if (alreadyAssigned) {
    const error = new Error("Team member is already assigned");
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

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getGalleryByEventId,
  getTeamMembers,
  createTeamMember,
  assignTeamMember,
};