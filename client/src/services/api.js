import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    /*
     * Only attach the normal Admin/Team JWT when
     * the request does not already provide an
     * Authorization header.
     *
     * This is important for customer gallery requests,
     * because they use a separate gallery-specific token.
     */
    if (
      token &&
      !config.headers.Authorization
    ) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    /*
     * Only clear the normal login session when the
     * request was using the normal authentication
     * flow.
     *
     * A gallery-token failure should NOT log an
     * Admin/Team user out.
     */
    const requestAuthorization =
      error.config?.headers?.Authorization;

    const isGalleryRequest =
      requestAuthorization &&
      requestAuthorization.startsWith(
        "Bearer "
      ) &&
      requestAuthorization !==
        `Bearer ${localStorage.getItem("token")}`;

    if (
      error.response?.status === 401 &&
      !isGalleryRequest
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

export default api;