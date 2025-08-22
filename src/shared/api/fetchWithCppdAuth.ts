import axios from "axios";
import type { FetchResponse } from "../../app/types";
import { useAuthStore } from "../../entities/user/store";

export const fetchWithCppdAuth = async <T>(
  url: string,
  options: {
    method?: string;
    params?: Record<string, string | number>;
    headers?: Record<string, string>;
    data?: any;
    withCredentials?: boolean;
  } = {},
  navigate?: (path: string) => void
): Promise<FetchResponse<T>> => {
  const fullUrl = `/api/cppd-service/v1${url}`;

  console.log(
    `[fetchWithCppdAuth] Начало запроса: ${options.method || "GET"} ${fullUrl}`
  );
  console.log("[fetchWithCppdAuth] Заголовки:", options.headers || {});
  console.log("[fetchWithCppdAuth] Параметры:", options.params || {});

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await axios({
      url: fullUrl,
      method: options.method || "GET",
      headers,
      params: options.params || {},
      data: options.data,
      withCredentials: true,
    });

    console.log(`[fetchWithCppdAuth] Успешный ответ от ${fullUrl}:`, {
      status: response.status,
      data: response.data,
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

    console.error(`[fetchWithCppdAuth] Ошибка при запросе ${fullUrl}:`, {
      status,
      error: err.message,
      responseData: err.response?.data,
      code: err.code,
    });
    console.error(
      `[fetchWithCppdAuth] Полный ответ сервера:`,
      err.response?.data
    );

    switch (status) {
      case 401:
        errorMessage = "Сессия истекла. Пожалуйста, войдите заново.";
        if (navigate) {
          useAuthStore.getState().logout(navigate);
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
          err.response?.data?.detail ||
          `Ошибка соединения с сервером: ${err.message} (${
            err.code || "unknown"
          })`;
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
