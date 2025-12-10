import axios from "axios";
import { getRecoil, setRecoil } from "recoil-nexus";
import { accessTokenState } from "@/recoil/auth";

const api = axios.create({
  baseURL: "https://mealgo.whitefish.uk",
  withCredentials: true, // ⬅ 쿠키 전달
});

api.interceptors.request.use((config) => {
  const token = getRecoil(accessTokenState);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🔁 Response: 401 → 리프레시 요청 → 액세스 갱신 → 재요청
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 쿠키 자동 생성
        const res = await axios.post(
          "https://mealgo.whitefish.uk/auth/refresh",
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = res.data.accessToken;
        setRecoil(accessTokenState, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (e) {
        setRecoil(accessTokenState, null);
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
