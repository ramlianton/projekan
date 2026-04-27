// frontend/src/api/axiosInstance.js
import axios from 'axios';

// Buat instance axios dengan base URL backend kita
import axios from 'axios';

const axiosInstance = axios.create({
  // URL Ngrok yang baru (perhatikan ujungnya ada .dev/api)
  baseURL: 'https://prideful-uncrown-ethics.ngrok-free.dev/api', 
  headers: {
    'Content-Type': 'application/json',
    // Header sakti agar Ngrok tidak rewel
    'ngrok-skip-browser-warning': 'true' 
  }
});

// Interceptor: Menjalankan fungsi ini SEBELUM request dikirim ke server
axiosInstance.interceptors.request.use(
  (config) => {
    // Ambil token dari Local Storage browser
    const token = localStorage.getItem('token');
    
    // Jika token ada, sisipkan ke header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Menangani response dari server (opsional, untuk auto-logout jika token expired)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Jika status 401 (Unauthorized/Token Expired), hapus token dan tendang ke halaman login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;