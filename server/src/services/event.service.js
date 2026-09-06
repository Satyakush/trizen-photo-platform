const bcrypt = require("bcryptjs");

const Event = require("../models/Event");
const User = require("../models/User");

const createEvent = async (adminId, eventData) => {
  const event = await Event.create({
    ...eventData,
    createdBy: adminId,
  });

  return event;
};

const getEventsForUser = async (user) => {
  if (user.role === "admin") {
    return Event.find({
      createdBy: user.id,
    })
      .populate("teamMembers", "name email role")
      .sort({ createdAt: -1 });
  }

  return Event.find({
    teamMembers: user.id,
  })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

const createTeamMember = async ({
  name,
  email,
  password,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

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
  adminId,
  userId
) => {
  const event = await Event.findOne({
    _id: eventId,
    createdBy: adminId,
  });

  if (!event) {
    const error = new Error(
      "Event not found or you are not authorized to manage it"
    );

    error.statusCode = 404;

    throw error;
  }

  const user = await User.findById(userId);

  if (!user || user.role !== "team_member") {
    const error = new Error("Valid team member not found");

    error.statusCode = 404;

    throw error;
  }

  const alreadyAssigned = event.teamMembers.some(
    (memberId) =>
      memberId.toString() === userId.toString()
  );

  if (alreadyAssigned) {
    const error = new Error(
      "Team member is already assigned to this event"
    );

    error.statusCode = 409;

    throw error;
  }

  event.teamMembers.push(userId);

  await event.save();

  return Event.findById(event._id).populate(
    "teamMembers",
    "name email role"
  );
};

module.exports = {
  createEvent,
  getEventsForUser,
  createTeamMember,
  assignTeamMember,
};