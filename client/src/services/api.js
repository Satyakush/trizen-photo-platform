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
     * Track whether this request is using the normal
     * Admin/Team authentication token.
     *
     * Gallery requests can provide their own Authorization
     * header, so we must not overwrite it.
     */
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;

      config._usesNormalAuth = true;
    } else if (config.headers.Authorization) {
      /*
       * This request already supplied its own Authorization
       * header, for example a customer gallery token.
       */
      config._usesNormalAuth = false;
    } else {
      config._usesNormalAuth = false;
    }

    console.log(
      "API REQUEST:",
      config.method?.toUpperCase(),
      config.url,
      config._usesNormalAuth,
      Boolean(config.headers.Authorization)
    );


    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const config = error.config;

    /*
     * Only clear the normal login session when:
     *
     * 1. The request actually used the normal Admin/Team JWT
     * 2. The backend rejected that JWT with 401
     *
     * A request without authentication should NOT automatically
     * destroy an existing login session.
     */
    if (
      status === 401 &&
      config?._usesNormalAuth === true
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    /*
     * Gallery requests have their own Authorization token.
     * Their 401 must never log out the Admin/Team user.
     */

    return Promise.reject(error);
  }
);

export default api;