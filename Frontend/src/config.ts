// Frontend/src/config.ts
// Đây là cách React/Vite đọc biến môi trường bắt đầu bằng VITE_
export const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5129/api";
// Giá trị sau || là fallback khi chạy local dev hoặc khi biến môi trường chưa được set