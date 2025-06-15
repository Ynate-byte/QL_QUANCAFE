import type { KhuyenMai } from "../interfaces/KhuyenMai";
import { getAuthHeader } from "./authHeader";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/KhuyenMai`;

// #region API Quản lý Khuyến mãi

/**
 * @summary Lấy toàn bộ danh sách khuyến mãi từ server.
 * @returns {Promise<KhuyenMai[]>} Một Promise chứa mảng các đối tượng KhuyenMai.
 * @throws {Error} Nếu có lỗi xảy ra trong quá trình tải danh sách khuyến mãi.
 */
export const getKhuyenMais = async (): Promise<KhuyenMai[]> => {
    const response = await fetch(API_BASE_URL, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi tải danh sách khuyến mãi"); }
    return response.json();
};

/**
 * @summary Gửi dữ liệu để thêm một khuyến mãi mới vào server.
 * @param {Omit<KhuyenMai, 'ma'>} data Đối tượng khuyến mãi mới, không bao gồm mã (Ma).
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const addKhuyenMai = (data: Omit<KhuyenMai, 'ma'>) => {
    return fetch(API_BASE_URL, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
};

/**
 * @summary Gửi dữ liệu để cập nhật một khuyến mãi đã có trên server.
 * @param {KhuyenMai} data Đối tượng khuyến mãi đầy đủ với thông tin cập nhật, bao gồm cả mã (Ma).
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const updateKhuyenMai = (data: KhuyenMai) => {
    return fetch(`${API_BASE_URL}/${data.ma}`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
};

/**
 * @summary Gửi yêu cầu xóa một khuyến mãi khỏi server dựa trên mã.
 * @param {number} ma Mã của khuyến mãi cần xóa.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const deleteKhuyenMai = (ma: number) => {
    return fetch(`${API_BASE_URL}/${ma}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
};

// #endregion