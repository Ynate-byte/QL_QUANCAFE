import type { PhanHoiKhachHang } from "../interfaces/PhanHoi";
import { getAuthHeader } from "./authHeader";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/PhanHoi`;

// Interface để định nghĩa cấu trúc của các bộ lọc
interface Filters {
    tuKhoa?: string;
    trangThai?: string;
    loai?: string;
}

// #region API Gửi Phản Hồi (Dành cho Khách hàng)

/**
 * @summary Gửi một phản hồi mới từ khách hàng.
 * @param {object} data Dữ liệu phản hồi, bao gồm số điện thoại (tùy chọn), loại phản hồi và nội dung.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const submitFeedback = async (data: { soDienThoai?: string, loaiPhanHoi: string, noiDung: string }) => {
    return fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
};

// #endregion

// #region API Quản Lý Phản Hồi (Dành cho Quản lý)

/**
 * @summary Lấy danh sách các phản hồi khách hàng với tùy chọn bộ lọc.
 * @param {Filters} filters Đối tượng chứa các bộ lọc như từ khóa, trạng thái và loại phản hồi.
 * @returns {Promise<PhanHoiKhachHang[]>} Một Promise chứa mảng các đối tượng PhanHoiKhachHang.
 * @throws {Error} Nếu có lỗi xảy ra trong quá trình tải danh sách phản hồi.
 */
export const getPhanHois = async (filters: Filters): Promise<PhanHoiKhachHang[]> => {
    // Xây dựng query string từ các bộ lọc
    const params = new URLSearchParams();
    if (filters.tuKhoa) {
        params.append('tuKhoa', filters.tuKhoa);
    }
    if (filters.trangThai && filters.trangThai !== 'Tất cả') {
        params.append('trangThai', filters.trangThai);
    }
    if (filters.loai && filters.loai !== 'Tất cả') {
        params.append('loai', filters.loai);
    }
    
    const queryString = params.toString();
    // Nối query string vào URL nếu có
    const requestUrl = `${API_BASE_URL}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(requestUrl, { headers: getAuthHeader() });

    if (!response.ok) {
        throw new Error("Lỗi khi tải danh sách phản hồi");
    }
    return response.json();
};

/**
 * @summary Cập nhật trạng thái xử lý của một phản hồi.
 * @param {number} ma Mã phản hồi cần cập nhật.
 * @param {string} trangThai Trạng thái mới của phản hồi.
 * @param {number} maNhanVien Mã nhân viên thực hiện xử lý.
 * @returns {Promise<Response>} Một Promise chứa đối tượng Response từ API.
 */
export const updatePhanHoiStatus = (ma: number, trangThai: string, maNhanVien: number) => {
    return fetch(`${API_BASE_URL}/${ma}/trangthai`, { // Sửa endpoint cho đúng với backend
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThai, maNhanVien })
    });
};

// #endregion