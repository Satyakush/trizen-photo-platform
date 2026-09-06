const eventService = require("../services/event.service");

const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const events = await eventService.getEventsForUser(
      req.user
    );

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

const createTeamMember = async (req, res, next) => {
  try {
    const teamMember =
      await eventService.createTeamMember(req.body);

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: teamMember,
    });
  } catch (error) {
    next(error);
  }
};

const assignTeamMember = async (req, res, next) => {
  try {
    const event = await eventService.assignTeamMember(
      req.params.eventId,
      req.user.id,
      req.body.userId
    );

    res.status(200).json({
      success: true,
      message: "Team member assigned successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  createTeamMember,
  assignTeamMember,
};