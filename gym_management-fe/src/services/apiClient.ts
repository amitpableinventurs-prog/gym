import axios from "axios";
import Cookies from "js-cookie";
import store, { persistor } from "../redux/store";
import { clearUser } from "../redux/userSlice";

const apiClient = axios.create({ baseURL: import.meta.env.VITE_APP_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const endSession = () => {
  Cookies.remove("authToken");
  store.dispatch(clearUser());
  void persistor.purge();
  window.location.assign("/login");
};

apiClient.interceptors.response.use(undefined, (error) => {
  const expired = error.response?.status === 401;
  const suspended = error.response?.data?.code === "ACCOUNT_SUSPENDED";
  if (expired || suspended) {
    endSession();
  }
  return Promise.reject(error);
});

/** The server's explanation of a failed request, if it sent one. */
export const apiErrorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

export const apiErrorCode = (error: unknown): string | undefined =>
  axios.isAxiosError(error) ? error.response?.data?.code : undefined;

export default apiClient;
