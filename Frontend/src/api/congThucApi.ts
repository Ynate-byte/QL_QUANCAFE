import type { CongThucDayDu } from "../interfaces/CongThuc";
import type { TaoCongThucDto } from "../interfaces/Dto";
import { getAuthHeader } from "./authHeader";

import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/Congthuc`;

// #region API Quản lý Công thức

/**
 * @summary Lấy thông tin công thức và chi tiết công thức của một sản phẩm.
 * @param {number} maSanPham Mã sản phẩm.
 * @returns {Promise<CongThucDayDu | null>} Thông tin công thức đầy đủ hoặc null nếu không tìm thấy.
 * @throws {Error} Nếu có lỗi khi tải công thức (khác lỗi 404).
 */
export const getCongThuc = async (maSanPham: number): Promise<CongThucDayDu | null> => {
    const response = await fetch(`${API_BASE_URL}/${maSanPham}`, { headers: getAuthHeader() });
    if (!response.ok) {
        if (response.status === 404) return null; // Trả về null nếu không tìm thấy
        throw new Error("Lỗi khi tải công thức");
    }
    return response.json();
};

/**
 * @summary Lưu (thêm mới hoặc cập nhật) một công thức pha chế.
 * @param {TaoCongThucDto} data Dữ liệu công thức cần lưu.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const luuCongThuc = (data: TaoCongThucDto) => {
    return fetch(API_BASE_URL, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
};
// #endregion