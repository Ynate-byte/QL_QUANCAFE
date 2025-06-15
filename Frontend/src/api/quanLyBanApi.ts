import type { LoaiBan } from "../interfaces/LoaiBan";
import type { Ban } from "../interfaces/Ban";
import { getAuthHeader } from "./authHeader";

import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/Quanlyban`;

// #region API Quản lý Loại Bàn

/**
 * @summary Lấy tất cả các loại bàn từ server.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const getLoaiBans = () => fetch(`${API_BASE_URL}/loaiban`, { headers: getAuthHeader() });

/**
 * @summary Thêm một loại bàn mới.
 * @param {object} data Đối tượng chứa tên loại bàn cần thêm.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const addLoaiBan = (data: { tenLoaiBan: string }) => fetch(`${API_BASE_URL}/loaiban`, {
    method: 'POST', headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});

/**
 * @summary Cập nhật thông tin của một loại bàn đã có.
 * @param {LoaiBan} data Đối tượng loại bàn đầy đủ với thông tin cập nhật.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const updateLoaiBan = (data: LoaiBan) => fetch(`${API_BASE_URL}/loaiban/${data.ma}`, {
    method: 'PUT', headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});

/**
 * @summary Xóa một loại bàn dựa trên mã.
 * @param {number} ma Mã của loại bàn cần xóa.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const deleteLoaiBan = (ma: number) => fetch(`${API_BASE_URL}/loaiban/${ma}`, {
    method: 'DELETE', headers: getAuthHeader()
});

// #endregion

// #region API Quản lý Bàn

/**
 * @summary Lấy tất cả các bàn từ server.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const getBans = () => fetch(`${API_BASE_URL}/ban`, { headers: getAuthHeader() });

/**
 * @summary Thêm một bàn mới.
 * @param {Omit<Ban, 'ma' | 'trangThai'>} data Đối tượng bàn mới (không bao gồm mã và trạng thái).
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const addBan = (data: Omit<Ban, 'ma' | 'trangThai'>) => fetch(`${API_BASE_URL}/ban`, {
    method: 'POST', headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});

/**
 * @summary Cập nhật thông tin của một bàn đã có.
 * @param {Ban} data Đối tượng bàn đầy đủ với thông tin cập nhật.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const updateBan = (data: Ban) => fetch(`${API_BASE_URL}/ban/${data.ma}`, {
    method: 'PUT', headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify(data)
});

/**
 * @summary Xóa một bàn dựa trên mã.
 * @param {number} ma Mã của bàn cần xóa.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const deleteBan = (ma: number) => fetch(`${API_BASE_URL}/ban/${ma}`, {
    method: 'DELETE', headers: getAuthHeader()
});

// #endregion