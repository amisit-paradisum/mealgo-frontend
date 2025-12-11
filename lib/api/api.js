import axios from "axios";
import { getRecoil, setRecoil } from "recoil-nexus";
import { accessTokenState } from "@/recoil/auth";

const api = axios.create({
  baseURL: "https://mealgo.whitefish.uk",
});

api.interceptors.request.use((config) => {
  const token = getRecoil(accessTokenState);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");

        if (!refresh) {
          setRecoil(accessTokenState, null);
          return Promise.reject(error);
        }
        const res = await api.get("/auth/refresh", {
          headers: {
            "refresh-token": refresh
          }
        })

        const newAccessToken = res.data.accessToken;

        localStorage.setItem("access", newAccessToken);
        setRecoil(accessTokenState, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (e) {
        localStorage.removeItem("access");
        setCurrentScreen("login"); 
        setRecoil(accessTokenState, null);
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
