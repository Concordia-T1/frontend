import axios from 'axios';
import Cookies from 'js-cookie';

export const fetchWithAuth = async (url: string, options: any = {}, navigate?: (path: string) => void) => {
  try {
    const response = await axios({
      url: `/api/auth-service/v1${url}`,
      headers: {
        Authorization: Cookies.get('access_token') ? `Bearer ${Cookies.get('access_token')}` : undefined,
      },
      withCredentials: true,
      ...options,
    });
    return response;
  } catch (err: any) {
    if (err.response?.status === 401) {
      if (navigate) {
        navigate('/login');
      }
      throw new Error('Сессия истекла. Пожалуйста, войдите заново.');
    }
    throw err.response?.data?.detail || 'Ошибка соединения с сервером';
  }
};
