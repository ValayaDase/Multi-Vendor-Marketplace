import axios from "axios";

// Get URL from environment variable or use localhost as fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers:  {
    "Content-Type":  "application/json",
  },
});

// REQUEST INTERCEPTOR:  Automatically add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (Unauthorized) - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    // Handle 403 (Forbidden) - User doesn't have permission
    if (error.response?.status === 403) {
      alert("Access denied. You don't have permission to perform this action.");
      return Promise.reject(new Error("Access denied"));
    }

    // Handle 404 (Not Found)
    if (error.response?. status === 404) {
      console.error("Resource not found:", error.config.url);
    }

    // Handle 500 (Server Error)
    if (error.response?.status === 500) {
      alert("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

// Helper for image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  return `${API_BASE_URL}${imagePath}`;
};

// Export the axios instance
export default api;