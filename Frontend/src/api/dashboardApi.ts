import type { NguyenLieuCanhBao, DoanhThuTrongNgay, SanPhamBanChay, DoanhThuTheoNgay as DoanhThu7Ngay, TyLeDanhMuc } from '../interfaces/Dashboard';
import { getAuthHeader } from './authHeader';
import type { KhachHang } from '../interfaces/KhachHang';

import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/Dashboard`;

// #region Báo Cáo Doanh Thu & Hiệu Suất

/**
 * @summary Lấy tổng doanh thu của ngày hôm nay.
 * @returns {Promise<DoanhThuTrongNgay>} Đối tượng chứa tổng doanh thu và số đơn hàng trong ngày.
 */
export const getDoanhThuHomNay = async (): Promise<DoanhThuTrongNgay> => {
    const response = await fetch(`${API_BASE_URL}/doanhthuhomnay`, { headers: getAuthHeader() });
    // Handle potential non-OK responses if needed, though current backend might always return a default DTO
    if (!response.ok) {
        // Example: if backend sends error details, you might want to parse them
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải doanh thu hôm nay: ${errorText}`);
    }
    return response.json();
};

/**
 * @summary Lấy doanh thu theo từng ngày trong 7 ngày gần nhất.
 * @returns {Promise<DoanhThu7Ngay[]>} Danh sách doanh thu theo ngày.
 */
export const getDoanhThu7Ngay = async (): Promise<DoanhThu7Ngay[]> => {
    const response = await fetch(`${API_BASE_URL}/doanhthu7ngay`, { headers: getAuthHeader() });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải doanh thu 7 ngày: ${errorText}`);
    }
    return response.json();
};

/**
 * @summary Lấy danh sách các sản phẩm bán chạy nhất trong một khoảng thời gian.
 * @param {number} top Số lượng sản phẩm hàng đầu muốn lấy.
 * @returns {Promise<SanPhamBanChay[]>} Danh sách các sản phẩm bán chạy.
 */
export const getSanPhamBanChay = async (top: number): Promise<SanPhamBanChay[]> => {
    const response = await fetch(`${API_BASE_URL}/sanphambanchay?top=${top}`, { headers: getAuthHeader() });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải sản phẩm bán chạy: ${errorText}`);
    }
    return response.json();
};

/**
 * @summary Lấy tỷ lệ bán hàng theo danh mục trong 7 ngày qua.
 * @returns {Promise<TyLeDanhMuc[]>} Danh sách tỷ lệ bán theo danh mục.
 */
export const getTyLeDanhMuc = async (): Promise<TyLeDanhMuc[]> => {
    const response = await fetch(`${API_BASE_URL}/tyledanhmuc`, { headers: getAuthHeader() });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải tỷ lệ danh mục: ${errorText}`);
    }
    return response.json();
};

// #endregion

// #region Cảnh Báo & Thông Báo

/**
 * @summary Lấy danh sách các nguyên liệu cần cảnh báo tồn kho (dưới mức tối thiểu).
 * @returns {Promise<NguyenLieuCanhBao[]>} Danh sách các nguyên liệu cần cảnh báo.
 * @throws {Error} Nếu có lỗi khi tải cảnh báo.
 */
export const getCanhBaoTonKho = async (): Promise<NguyenLieuCanhBao[]> => {
    const response = await fetch(`${API_BASE_URL}/canhbaotonkho`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi tải cảnh báo tồn kho"); }
    return response.json();
};

/**
 * @summary Lấy danh sách khách hàng có sinh nhật trong ngày hôm nay.
 * @returns {Promise<KhachHang[]>} Danh sách khách hàng sinh nhật hôm nay.
 */
export const getSinhNhatHomNay = async (): Promise<KhachHang[]> => {
    const response = await fetch(`${API_BASE_URL}/sinhnhat-homnay`, { headers: getAuthHeader() });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải danh sách sinh nhật hôm nay: ${errorText}`);
    }
    return response.json();
};
// #endregion