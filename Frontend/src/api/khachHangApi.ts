import type { KhachHang, KhachHangLoyalty } from "../interfaces/KhachHang";
import { getAuthHeader } from "./authHeader";

import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/Khachhang`;

// #region API Quản lý Khách hàng

/**
 * @summary Tìm kiếm khách hàng theo từ khóa (tên hoặc số điện thoại).
 * @param {string} tuKhoa Từ khóa tìm kiếm.
 * @returns {Promise<KhachHang[]>} Danh sách khách hàng phù hợp.
 * @throws {Error} Nếu có lỗi khi tìm kiếm.
 */
export const timKiemKhachHang = async (tuKhoa: string): Promise<KhachHang[]> => {
    // Trả về mảng rỗng nếu từ khóa quá ngắn để tránh tìm kiếm không cần thiết
    if (tuKhoa.length < 2) return []; 
    const response = await fetch(`${API_BASE_URL}/timkiem?tuKhoa=${encodeURIComponent(tuKhoa)}`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi tìm kiếm khách hàng"); }
    return response.json();
};

/**
 * @summary Lấy danh sách tất cả khách hàng cùng thông tin khách hàng thân thiết.
 * @returns {Promise<KhachHangLoyalty[]>} Danh sách khách hàng với thông tin loyalty.
 * @throws {Error} Nếu có lỗi khi tải danh sách khách hàng.
 */
export const getKhachHangs = async (): Promise<KhachHangLoyalty[]> => {
    const response = await fetch(API_BASE_URL, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi tải danh sách khách hàng"); }
    return response.json();
};

/**
 * @summary Thêm một khách hàng mới vào hệ thống.
 * @param {Omit<KhachHang, 'ma' | 'diemTichLuy'>} data Dữ liệu khách hàng cần thêm (không bao gồm mã và điểm tích lũy).
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const addKhachHang = (data: Omit<KhachHang, 'ma' | 'diemTichLuy'>) => fetch(API_BASE_URL, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

/**
 * @summary Cập nhật thông tin của một khách hàng hiện có.
 * @param {KhachHang} data Đối tượng khách hàng với thông tin cập nhật.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const updateKhachHang = (data: KhachHang) => fetch(`${API_BASE_URL}/${data.ma}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

/**
 * @summary Xóa một khách hàng khỏi hệ thống.
 * @param {number} ma Mã khách hàng cần xóa.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const deleteKhachHang = (ma: number) => fetch(`${API_BASE_URL}/${ma}`, {
    method: 'DELETE',
    headers: getAuthHeader()
});

// #endregion

// #region API Tra Cứu (Không yêu cầu đăng nhập)

/**
 * @summary Tra cứu điểm thành viên bằng số điện thoại.
 * @param {string} sdt Số điện thoại của khách hàng.
 * @returns {Promise<KhachHangLoyalty>} Thông tin khách hàng thân thiết nếu tìm thấy.
 * @throws {Error} Nếu không tìm thấy thông tin hoặc có lỗi khác.
 */
export const traCuuDiem = async (sdt: string): Promise<KhachHangLoyalty> => {
    const response = await fetch(`${API_BASE_URL}/tracuu?sdt=${encodeURIComponent(sdt)}`);
    if (!response.ok) {
        throw new Error("Không tìm thấy thông tin"); // Thông báo lỗi đơn giản cho trường hợp 404 hoặc lỗi khác
    }
    return response.json();
};

// #endregion