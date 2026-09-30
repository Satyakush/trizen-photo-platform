import api from "./api";

export const registerAdmin = async (data, setupKey) => {
  const response = await api.post("/auth/register", data, {
    headers: { "x-admin-setup-key": setupKey },
  });
  return response.data;
};

export const login = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};
