const eventService = require("../services/event.service");

const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const events = await eventService.getEvents(
      req.user
    );

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event =
      await eventService.getEventById(
        req.params.eventId,
        req.user
      );

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

const getGalleryByEventId = async (
  req,
  res,
  next
) => {
  try {
    const gallery =
      await eventService.getGalleryByEventId(
        req.params.eventId,
        req.user.id
      );

    res.status(200).json({
      success: true,
      gallery,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const result =
      await eventService.deleteEvent(
        req.params.eventId,
        req.user.id
      );

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

const getTeamMembers = async (
  req,
  res,
  next
) => {
  try {
    const teamMembers =
      await eventService.getTeamMembers();

    res.status(200).json({
      success: true,
      teamMembers,
    });
  } catch (error) {
    next(error);
  }
};

const createTeamMember = async (
  req,
  res,
  next
) => {
  try {
    const teamMember =
      await eventService.createTeamMember(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Team member created successfully",
      teamMember,
    });
  } catch (error) {
    next(error);
  }
};

const assignTeamMember = async (
  req,
  res,
  next
) => {
  try {
    const event =
      await eventService.assignTeamMember(
        req.params.eventId,
        req.body.userId,
        req.user.id
      );

    res.status(200).json({
      success: true,
      message:
        "Team member assigned successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

const removeTeamMember = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await eventService.removeTeamMember(
        req.params.eventId,
        req.params.userId,
        req.user.id
      );

    res.status(200).json({
      success: true,
      message: result.alreadyRemoved
        ? "Team member was already removed from this event."
        : "Team member removed from event successfully.",
      event: result.event,
    });
  } catch (error) {
    next(error);
  }
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