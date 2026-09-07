import api from "./api";

export const createGallery = async (
  eventId,
  data
) => {
  const response = await api.post(
    `/events/${eventId}/galleries`,
    data
  );

  return response.data;
};

export const getGallery = async (galleryId) => {
  const response = await api.get(
    `/galleries/${galleryId}`
  );

  return response.data;
};

export const updateGallery = async (
  galleryId,
  data
) => {
  const response = await api.put(
    `/galleries/${galleryId}`,
    data
  );

  return response.data;
};

export const publishGallery = async (
  galleryId
) => {
  const response = await api.post(
    `/galleries/${galleryId}/publish`
  );

  return response.data;
};