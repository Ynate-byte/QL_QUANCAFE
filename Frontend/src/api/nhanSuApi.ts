import type { CaLam } from "../interfaces/CaLam";
import type { LichLamViec } from "../interfaces/LichLamViec";
import type { NhanVien } from "../interfaces/NhanVien";
import { getAuthHeader } from "./authHeader";

import { API_URL } from "../config";
const API_BASE_URL = `${API_URL}/Nhansu`;

// #region API Quản lý Nhân viên

/**
 * @summary Lấy danh sách tất cả nhân viên từ server.
 * @returns {Promise<NhanVien[]>} Một Promise chứa mảng các đối tượng NhanVien.
 * @throws {Error} Nếu có lỗi xảy ra trong quá trình tải danh sách nhân viên.
 */
export const getNhanViens = async (): Promise<NhanVien[]> => {
    const response = await fetch(`${API_BASE_URL}/nhanvien`, { headers: getAuthHeader() });
    if (!response.ok) { // Thêm kiểm tra lỗi cho response.ok
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải danh sách nhân viên: ${errorText}`);
    }
    return response.json();
}

/**
 * @summary Gửi dữ liệu để thêm một nhân viên mới.
 * @param {Omit<NhanVien, 'ma'>} data Đối tượng nhân viên mới, không bao gồm mã (Ma).
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const addNhanVien = (data: Omit<NhanVien, 'ma'>) => fetch(`${API_BASE_URL}/nhanvien`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

/**
 * @summary Gửi dữ liệu để cập nhật một nhân viên đã có.
 * @param {NhanVien} data Đối tượng nhân viên đầy đủ với thông tin cập nhật.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const updateNhanVien = (data: NhanVien) => fetch(`${API_BASE_URL}/nhanvien/${data.ma}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

/**
 * @summary Gửi yêu cầu xóa một nhân viên dựa trên mã.
 * @param {number} ma Mã của nhân viên cần xóa.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const deleteNhanVien = (ma: number) => fetch(`${API_BASE_URL}/nhanvien/${ma}`, {
    method: 'DELETE',
    headers: getAuthHeader()
});

// #endregion

// #region API Ca làm & Lịch làm việc

/**
 * @summary Lấy danh sách tất cả các ca làm từ server.
 * @returns {Promise<CaLam[]>} Một Promise chứa mảng các đối tượng CaLam.
 * @throws {Error} Nếu có lỗi xảy ra trong quá trình tải danh sách ca làm.
 */
export const getCaLams = async (): Promise<CaLam[]> => {
    const response = await fetch(`${API_BASE_URL}/calam`, { headers: getAuthHeader() });
    if (!response.ok) { // Thêm kiểm tra lỗi cho response.ok
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải danh sách ca làm: ${errorText}`);
    }
    return response.json();
}

/**
 * @summary Lấy lịch làm việc của nhân viên theo ngày cụ thể.
 * @param {string} ngay Ngày cần lấy lịch làm việc (định dạng ngày).
 * @returns {Promise<LichLamViec[]>} Một Promise chứa mảng các đối tượng LichLamViec.
 * @throws {Error} Nếu có lỗi xảy ra trong quá trình tải lịch làm việc.
 */
export const getLichLamViec = async (ngay: string): Promise<LichLamViec[]> => {
    const response = await fetch(`${API_BASE_URL}/lichlamviec?ngay=${ngay}`, { headers: getAuthHeader() });
    if (!response.ok) { // Thêm kiểm tra lỗi cho response.ok
        const errorText = await response.text();
        throw new Error(`Lỗi khi tải lịch làm việc: ${errorText}`);
    }
    return response.json();
}

/**
 * @summary Gửi dữ liệu để thêm một lịch làm việc mới cho nhân viên.
 * @param {{ maNhanVien: number, maCa: number, ngayLamViec: string }} data Dữ liệu lịch làm việc cần thêm.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const addLichLamViec = (data: { maNhanVien: number, maCa: number, ngayLamViec: string }) => 
    fetch(`${API_BASE_URL}/lichlamviec`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

/**
 * @summary Gửi yêu cầu xóa một lịch làm việc dựa trên mã.
 * @param {number} ma Mã của lịch làm việc cần xóa.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const deleteLichLamViec = (ma: number) => fetch(`${API_BASE_URL}/lichlamviec/${ma}`, {
    method: 'DELETE',
    headers: getAuthHeader()
});

// #endregion