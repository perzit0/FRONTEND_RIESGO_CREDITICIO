import axios from 'axios';
import { obtenerToken } from '../../storage/secureStorage';

// En local apunta a localhost. Para producción cambiar a la URL de Render.
export const BASE_URL = 'https://backend-riesgo-crediticio.onrender.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: agrega el token JWT automáticamente en cada request.
// Así ninguna pantalla necesita manejar el header manualmente.
apiClient.interceptors.request.use(
  async (config) => {
    const token = await obtenerToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: si el backend devuelve 401 (token expirado
// o inválido), limpia el storage para forzar re-login.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { cerrarSesion } = await import('../../storage/secureStorage');
      await cerrarSesion();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
