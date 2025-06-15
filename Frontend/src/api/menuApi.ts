import type { DanhMucSanPham } from "../interfaces/DanhMucSanPham";
import type { SanPham } from "../interfaces/SanPham";
import { getAuthHeader } from "./authHeader";

import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/Menu`;

// #region API Danh Mục Sản Phẩm

/**
 * @summary Lấy danh sách tất cả các danh mục sản phẩm từ server.
 * @returns {Promise<DanhMucSanPham[]>} Một Promise chứa mảng các đối tượng DanhMucSanPham.
 * @throws {Error} Nếu có lỗi xảy ra trong quá trình tải danh sách danh mục.
 */
export const getDanhSachDanhMuc = async (): Promise<DanhMucSanPham[]> => {
    const response = await fetch(`${API_BASE_URL}/danhmuc`, { headers: getAuthHeader() });
    if (!response.ok) { // Thêm kiểm tra lỗi cho response.ok
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải danh sách danh mục: ${errorText}`);
    }
    return response.json();
}

/**
 * @summary Gửi dữ liệu để thêm một danh mục sản phẩm mới.
 * @param {{ tenDanhMuc: string }} danhMuc Đối tượng chứa tên danh mục cần thêm.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const themDanhMuc = async (danhMuc: { tenDanhMuc: string }): Promise<Response> => {
    return await fetch(`${API_BASE_URL}/danhmuc`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(danhMuc)
    });
}

/**
 * @summary Gửi dữ liệu để cập nhật một danh mục sản phẩm đã có.
 * @param {DanhMucSanPham} danhMuc Đối tượng danh mục sản phẩm đầy đủ với thông tin cập nhật.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const suaDanhMuc = async (danhMuc: DanhMucSanPham): Promise<Response> => {
    return await fetch(`${API_BASE_URL}/danhmuc/${danhMuc.ma}`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(danhMuc)
    });
}

/**
 * @summary Gửi yêu cầu xóa một danh mục sản phẩm dựa trên mã.
 * @param {number} ma Mã của danh mục sản phẩm cần xóa.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const xoaDanhMuc = async (ma: number): Promise<Response> => {
    return await fetch(`${API_BASE_URL}/danhmuc/${ma}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
    });
}

// #endregion

// #region API Sản Phẩm

/**
 * @summary Lấy danh sách tất cả các sản phẩm từ server.
 * @returns {Promise<SanPham[]>} Một Promise chứa mảng các đối tượng SanPham.
 * @throws {Error} Nếu có lỗi xảy ra trong quá trình tải danh sách sản phẩm.
 */
export const getDanhSachSanPham = async (): Promise<SanPham[]> => {
    const response = await fetch(`${API_BASE_URL}/sanpham`, { headers: getAuthHeader() });
    if (!response.ok) { // Thêm kiểm tra lỗi cho response.ok
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải danh sách sản phẩm: ${errorText}`);
    }
    return response.json();
}

/**
 * @summary Gửi dữ liệu để thêm một sản phẩm mới vào menu.
 * @param {Omit<SanPham, 'ma'>} sanPham Đối tượng sản phẩm mới, không bao gồm mã (Ma).
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const themSanPham = async (sanPham: Omit<SanPham, 'ma'>): Promise<Response> => {
    return await fetch(`${API_BASE_URL}/sanpham`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(sanPham)
    });
}

/**
 * @summary Gửi dữ liệu để cập nhật thông tin một sản phẩm đã có.
 * @param {SanPham} sanPham Đối tượng sản phẩm đầy đủ với thông tin cập nhật.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const suaSanPham = async (sanPham: SanPham): Promise<Response> => {
    return await fetch(`${API_BASE_URL}/sanpham/${sanPham.ma}`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(sanPham)
    });
}

/**
 * @summary Gửi yêu cầu xóa một sản phẩm khỏi menu dựa trên mã.
 * @param {number} ma Mã của sản phẩm cần xóa.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const xoaSanPham = async (ma: number): Promise<Response> => {
    return await fetch(`${API_BASE_URL}/sanpham/${ma}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
    });
}

// #endregion