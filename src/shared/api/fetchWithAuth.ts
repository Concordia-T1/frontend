import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { useAuthStore } from "../../entities/user/store";
import Cookies from "js-cookie";

export async function fetchWithAuth(url: string, options: AxiosRequestConfig = {}) {
    const { accessToken, refreshToken, logout } = useAuthStore.getState();

    const headers = {
        ...options.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    try {
        const response = await axios({
            url,
            ...options,
            headers,
            withCredentials: true,
        });

        return response;
    } catch (error: unknown) {
        const err = error as AxiosError;
        if (err.response?.status === 401) {
            try {
                const refreshResponse = await axios.post("/auth/refresh", {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` },
                    withCredentials: true,
                });

                const newTokenCookie = Cookies.get("access_refresh");
                if (!newTokenCookie) {
                    logout();
                    throw new Error("Сессия истекла, пожалуйста, войдите снова");
                }

                const [newAccessToken, newRefreshToken] = newTokenCookie.split("_");
                useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

                return await axios({
                    url,
                    ...options,
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${newAccessToken}`,
                    },
                    withCredentials: true,
                });
            } catch (refreshError: unknown) {
                logout();
                throw new Error("Сессия истекла, пожалуйста, войдите снова");
            }
        }
        throw error;
    }
}