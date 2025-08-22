import axios from "axios";
import { type FetchResponse } from "../../app/types";
import { useAuthStore } from "../../entities/user/store";

const BASE_URL = "/api/auth-service/v1";

interface FetchOptions {
  method?: string;
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
  data?: any;
  withCredentials?: boolean;
}

export const fetchWithAuth = async <T>(
  url: string,
  options: FetchOptions = {},
  navigate?: (path: string) => void
): Promise<FetchResponse<T>> => {
  const fullUrl = `${BASE_URL}${url}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    console.log(`[fetchWithAuth] Запрос на ${fullUrl}:`, {
      method: options.method || "GET",
      params: options.params,
      headers,
      data: options.data,
      withCredentials: true,
    });

    const response = await axios({
      url: fullUrl,
      method: options.method || "GET",
      headers,
      params: options.params || {},
      data: options.data,
      withCredentials: true,
    });

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      detail: response.data.detail || undefined,
      data: response.data,
    };
  } catch (err: any) {
    const status = err.response?.status;
    let errorMessage: string;

    console.error(`[fetchWithAuth] Ошибка при запросе к ${fullUrl}:`, {
      error: err.message,
      response: err.response?.data,
      status,
    });

    switch (status) {
      case 401:
        errorMessage = "Сессия истекла. Пожалуйста, войдите заново.";
        if (navigate && url !== "/auth/login") {
          useAuthStore.getState().setAuthenticated(false);
          navigate("/login");
        }
        break;
      case 400:
        errorMessage =
          err.response?.data?.detail ||
          "Некорректный запрос. Проверьте параметры.";
        break;
      case 404:
        errorMessage =
          err.response?.data?.detail ||
          "Ресурс не найден. Проверьте настройки сервера.";
        break;
      default:
        errorMessage =
          err.response?.data?.detail || "Ошибка соединения с сервером";
    }

    return {
      ok: false,
      status,
      detail: errorMessage,
      data: err.response?.data,
    };
  }
};

export const fetchWithCppdAuth = async <T>(
  url: string,
  options: FetchOptions = {},
  navigate?: (path: string) => void
): Promise<FetchResponse<T>> => {
  const fullUrl = `/api/cppd-service/v1${url}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await axios({
      url: fullUrl,
      method: options.method || "GET",
      headers,
      params: options.params || {},
      data: options.data,
      withCredentials: true,
    });

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      detail: response.data.detail || undefined,
      claims: response.data.claims || undefined,
      total_pages: response.data.total_pages || undefined,
      data: response.data,
    };
  } catch (err: any) {
    const status = err.response?.status;
    let errorMessage: string;

    switch (status) {
      case 401:
        errorMessage = "Сессия истекла. Пожалуйста, войдите заново.";
        if (navigate) {
          navigate("/login");
        }
        break;
      case 400:
        errorMessage =
          err.response?.data?.detail ||
          "Некорректный запрос. Проверьте параметры.";
        break;
      case 404:
        errorMessage =
          err.response?.data?.detail ||
          "Ресурс не найден. Проверьте настройки сервера.";
        break;
      default:
        errorMessage =
          err.response?.data?.detail || "Ошибка соединения с сервером";
    }

    return {
      ok: false,
      status,
      detail: errorMessage,
      claims: undefined,
      total_pages: undefined,
      data: err.response?.data,
    };
  }
};
