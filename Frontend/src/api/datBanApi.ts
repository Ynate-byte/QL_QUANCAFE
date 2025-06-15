import type { DatBanDto } from "../interfaces/DatBan";
import type { TaoDatBanDto } from "../interfaces/Dto";
import { getAuthHeader } from "./authHeader";

import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/Datban`;

// #region API Quản lý Đặt bàn

/**
 * @summary Lấy danh sách các lượt đặt bàn theo ngày.
 * @param {string} ngay Ngày cần lấy đặt bàn (định dạng YYYY-MM-DD).
 * @returns {Promise<DatBanDto[]>} Danh sách các lượt đặt bàn.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getDatBans = async (ngay: string): Promise<DatBanDto[]> => {
    const response = await fetch(`${API_BASE_URL}?ngay=${ngay}`, { headers: getAuthHeader() });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải danh sách đặt bàn: ${errorText}`);
    }
    return response.json();
};

/**
 * @summary Tạo một lượt đặt bàn mới.
 * @param {TaoDatBanDto} data Dữ liệu lượt đặt bàn cần tạo.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const taoDatBan = (data: TaoDatBanDto) => {
    return fetch(API_BASE_URL, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
};

/**
 * @summary Cập nhật trạng thái của một lượt đặt bàn.
 * @param {number} ma Mã lượt đặt bàn.
 * @param {string} trangThai Trạng thái mới.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const updateTrangThaiDatBan = (ma: number, trangThai: string) => {
    return fetch(`${API_BASE_URL}/${ma}/trangthai`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThai })
    });
};

/**
 * @summary Xác nhận khách hàng đã đến và tạo đơn hàng liên quan từ lượt đặt bàn.
 * @param {number} maDatBan Mã lượt đặt bàn.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const confirmArrivalApi = (maDatBan: number) => {
    return fetch(`${API_BASE_URL}/${maDatBan}/confirm-arrival`, {
        method: 'POST',
        headers: getAuthHeader()
    });
};
// #endregion