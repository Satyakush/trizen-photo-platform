import api from "./api";

export const getEvents = async () => {
  const response = await api.get("/events");
  return response.data;
};

export const getEvent = async (eventId) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};

export const createEvent = async (data) => {
  const response = await api.post("/events", data);
  return response.data;
};

export const getTeamMembers = async () => {
  const response = await api.get("/events/team-members");
  return response.data;
};

export const createTeamMember = async (data) => {
  const response = await api.post(
    "/events/team-members",
    data
  );

  return response.data;
};

export const assignTeamMember = async (eventId, userId) => {
  const response = await api.post(
    `/events/${eventId}/team`,
    { userId }
  );

  return response.data;
};