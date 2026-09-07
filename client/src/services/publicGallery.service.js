import api from "./api";

export const verifyGalleryPin = async (slug, pin) => {
  const response = await api.post(
    `/public/galleries/${slug}/verify`,
    { pin }
  );

  return response.data;
};

export const getPublicGalleryPhotos = async (
  slug,
  token
) => {
  const response = await api.get(
    `/public/galleries/${slug}/photos`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};