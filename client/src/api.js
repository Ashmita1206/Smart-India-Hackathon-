import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://smart-india-hackathon-gwnj.onrender.com/server",
});

// Add API key and JWT token automatically
API.interceptors.request.use((req) => {
  // Always add API key header
  const apiKey = process.env.REACT_APP_API_KEY || "12345-FAKE-KEY-67890";
  if (apiKey) {
    req.headers['X-API-Key'] = apiKey;
  }
  
  // Add JWT token if available (for authenticated requests)
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
