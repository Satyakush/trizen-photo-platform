import api from "./api";

export const getEventPhotos = async (eventId) => {
  const response = await api.get(`/events/${eventId}/photos`);

  return response.data.data || response.data.photos || [];
};

export const getMyPhotos = async (eventId) => {
  const response = await api.get(`/events/${eventId}/my-photos`);

  return response.data.data || response.data.photos || [];
};

export const uploadPhotos = async (eventId, files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("photos", file);
  });

  const response = await api.post(
    `/events/${eventId}/photos`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};