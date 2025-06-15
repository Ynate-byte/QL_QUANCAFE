import type { NhaCungCap } from '../interfaces/NhaCungCap';
import type { NguyenLieu } from '../interfaces/NguyenLieu';
import type { PhieuNhap } from '../interfaces/PhieuNhap';
import type { ChiTietPhieuNhapViewDto } from '../interfaces/Dto';
import type { TaoPhieuNhapDto } from '../interfaces/Dto';
import { getAuthHeader } from './authHeader';

import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/Kho`;

// #region API Nhà Cung Cấp

/**
 * @summary Lấy tất cả danh sách nhà cung cấp.
 * @returns {Promise<NhaCungCap[]>} Danh sách nhà cung cấp.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getNCCs = async (): Promise<NhaCungCap[]> => {
    const response = await fetch(`${API_BASE_URL}/nhacungcap`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error('Lỗi khi tải danh sách nhà cung cấp.'); }
    return response.json();
};

/**
 * @summary Thêm một nhà cung cấp mới.
 * @param {Omit<NhaCungCap, 'ma'>} data Dữ liệu nhà cung cấp cần thêm (không bao gồm mã).
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const addNCC = (data: Omit<NhaCungCap, 'ma'>) => fetch(`${API_BASE_URL}/nhacungcap`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

/**
 * @summary Cập nhật thông tin của một nhà cung cấp.
 * @param {NhaCungCap} data Đối tượng nhà cung cấp với thông tin cập nhật.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const updateNCC = (data: NhaCungCap) => fetch(`${API_BASE_URL}/nhacungcap/${data.ma}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

/**
 * @summary Xóa một nhà cung cấp.
 * @param {number} ma Mã nhà cung cấp cần xóa.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const deleteNCC = (ma: number) => fetch(`${API_BASE_URL}/nhacungcap/${ma}`, {
    method: 'DELETE',
    headers: getAuthHeader()
});
// #endregion

// #region API Nguyên Liệu

/**
 * @summary Lấy tất cả danh sách nguyên liệu.
 * @returns {Promise<NguyenLieu[]>} Danh sách nguyên liệu.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getNguyenLieus = async (): Promise<NguyenLieu[]> => {
    const response = await fetch(`${API_BASE_URL}/nguyenlieu`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error('Lỗi khi tải danh sách nguyên liệu.'); }
    return response.json();
}

/**
 * @summary Thêm một nguyên liệu mới.
 * @param {Omit<NguyenLieu, 'ma'>} data Dữ liệu nguyên liệu cần thêm (không bao gồm mã).
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const addNguyenLieu = (data: Omit<NguyenLieu, 'ma'>) => fetch(`${API_BASE_URL}/nguyenlieu`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

/**
 * @summary Cập nhật thông tin của một nguyên liệu.
 * @param {NguyenLieu} data Đối tượng nguyên liệu với thông tin cập nhật.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const updateNguyenLieu = (data: NguyenLieu) => fetch(`${API_BASE_URL}/nguyenlieu/${data.ma}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

/**
 * @summary Xóa một nguyên liệu.
 * @param {number} ma Mã nguyên liệu cần xóa.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const deleteNguyenLieu = (ma: number) => fetch(`${API_BASE_URL}/nguyenlieu/${ma}`, {
    method: 'DELETE',
    headers: getAuthHeader()
});
// #endregion

// #region API Phiếu Nhập

/**
 * @summary Lấy lịch sử tất cả các phiếu nhập.
 * @returns {Promise<PhieuNhap[]>} Danh sách các phiếu nhập.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getLichSuPhieuNhap = async (): Promise<PhieuNhap[]> => {
    const response = await fetch(`${API_BASE_URL}/phieunhap`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error('Lỗi khi tải lịch sử phiếu nhập.'); }
    return response.json();
}

/**
 * @summary Tạo một phiếu nhập mới.
 * @param {TaoPhieuNhapDto} data Dữ liệu phiếu nhập cần tạo.
 * @returns {Promise<Response>} Đối tượng Response từ API.
 */
export const taoPhieuNhap = (data: TaoPhieuNhapDto) => fetch(`${API_BASE_URL}/phieunhap`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

/**
 * @summary Lấy chi tiết của một phiếu nhập.
 * @param {number} maPhieuNhap Mã phiếu nhập.
 * @returns {Promise<ChiTietPhieuNhapViewDto[]>} Danh sách chi tiết phiếu nhập.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getChiTietPhieuNhap = async (maPhieuNhap: number): Promise<ChiTietPhieuNhapViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/phieunhap/${maPhieuNhap}/chitiet`, { headers: getAuthHeader() });

    if (!response.ok) {
        throw new Error('Lỗi khi tải chi tiết phiếu nhập.');
    }
    return response.json();
};
// #endregion