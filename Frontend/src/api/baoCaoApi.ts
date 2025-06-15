import type { ChiTietDonHangDayDu, LoiNhuanSanPham, KhuyenMaiHieuQua, BangLuong, ProductPerformance, DoanhThuLoiNhuan } from "../interfaces/BaoCao";
import { getAuthHeader } from "./authHeader";
import { API_URL } from "../config";
import type { BillDto } from "../interfaces/Bill";

const API_BASE_URL = `${API_URL}/BaoCao`;

// #region Báo Cáo Doanh Thu & Đơn Hàng

/**
 * @summary Lấy lịch sử đơn hàng đã thanh toán trong một khoảng thời gian.
 * @param {string} fromDate Ngày bắt đầu (định dạng YYYY-MM-DD).
 * @param {string} toDate Ngày kết thúc (định dạng YYYY-MM-DD).
 * @returns {Promise<ChiTietDonHangDayDu[]>} Danh sách chi tiết đơn hàng đầy đủ.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getLichSuDonHang = async (fromDate: string, toDate: string): Promise<ChiTietDonHangDayDu[]> => {
    const response = await fetch(`${API_BASE_URL}/lichsudonhang?fromDate=${fromDate}&toDate=${toDate}`, { 
        headers: getAuthHeader() 
    });
    if (!response.ok) { throw new Error("Lỗi khi tải lịch sử đơn hàng"); }
    return response.json();
};

/**
 * @summary Lấy tổng quan doanh thu và lợi nhuận trong một khoảng thời gian.
 * @param {string} fromDate Ngày bắt đầu (định dạng YYYY-MM-DD).
 * @param {string} toDate Ngày kết thúc (định dạng YYYY-MM-DD).
 * @returns {Promise<DoanhThuLoiNhuan>} Đối tượng chứa tổng doanh thu và lợi nhuận.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getDoanhThuLoiNhuan = async (fromDate: string, toDate: string): Promise<DoanhThuLoiNhuan> => {
    const response = await fetch(`${API_BASE_URL}/doanhthu-loinhuan?fromDate=${fromDate}&toDate=${toDate}`, { 
        headers: getAuthHeader() 
    });
    if (!response.ok) { throw new Error("Lỗi khi tải báo cáo doanh thu và lợi nhuận"); }
    return response.json();
};

/**
 * @summary Lấy chi tiết của một đơn hàng cụ thể.
 * @param {number} maDonHang Mã đơn hàng.
 * @returns {Promise<ChiTietDonHangDayDu[]>} Danh sách chi tiết đơn hàng đầy đủ.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getChiTietDonHang = async (maDonHang: number): Promise<ChiTietDonHangDayDu[]> => {
    const response = await fetch(`${API_BASE_URL}/lichsudonhang/${maDonHang}`, { 
        headers: getAuthHeader() 
    });
    if (!response.ok) { throw new Error("Lỗi khi tải chi tiết đơn hàng"); }
    return response.json();
};

/**
 * @summary Lấy danh sách các đơn hàng đã hoàn thành của ngày hôm nay.
 * @returns {Promise<ChiTietDonHangDayDu[]>} Danh sách chi tiết đơn hàng hôm nay.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getDonHangHomNay = async (): Promise<ChiTietDonHangDayDu[]> => {
    const response = await fetch(`${API_BASE_URL}/don-hang-hom-nay`, { 
        headers: getAuthHeader() 
    });
    if (!response.ok) { throw new Error("Lỗi khi tải đơn hàng hôm nay"); }
    return response.json();
};

/**
 * @summary Lấy thông tin chi tiết hóa đơn (bill) cho một đơn hàng cụ thể.
 * @param {number} maDonHang Mã đơn hàng.
 * @returns {Promise<BillDto>} Đối tượng BillDto chứa thông tin hóa đơn.
 * @throws {Error} Nếu có lỗi khi tải thông tin hóa đơn.
 */
export const getBillDetailsForReportApi = async (maDonHang: number): Promise<BillDto> => {
    const response = await fetch(`${API_BASE_URL}/donhang/${maDonHang}/bill`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi tải thông tin hóa đơn"); }
    return response.json();
};
// #endregion

// #region Báo Cáo Sản Phẩm & Khuyến Mãi

/**
 * @summary Lấy báo cáo lợi nhuận ước tính trên mỗi sản phẩm.
 * @returns {Promise<LoiNhuanSanPham[]>} Danh sách lợi nhuận theo sản phẩm.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getLoiNhuanSanPham = async (): Promise<LoiNhuanSanPham[]> => {
    const response = await fetch(`${API_BASE_URL}/loinhuansanpham`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi tải báo cáo lợi nhuận"); }
    return response.json();
};

/**
 * @summary Lấy báo cáo hiệu quả của các chương trình khuyến mãi.
 * @returns {Promise<KhuyenMaiHieuQua[]>} Danh sách hiệu quả khuyến mãi.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getHieuQuaKhuyenMai = async (): Promise<KhuyenMaiHieuQua[]> => {
    const response = await fetch(`${API_BASE_URL}/hieuquakhuyenmai`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi tải báo cáo hiệu quả khuyến mãi"); }
    return response.json();
};

/**
 * @summary Lấy báo cáo hiệu suất sản phẩm (số lượng bán và doanh thu) trong một khoảng thời gian.
 * @param {string} fromDate Ngày bắt đầu (định dạng YYYY-MM-DD).
 * @param {string} toDate Ngày kết thúc (định dạng YYYY-MM-DD).
 * @returns {Promise<ProductPerformance[]>} Danh sách hiệu suất sản phẩm.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getProductPerformance = async (fromDate: string, toDate: string): Promise<ProductPerformance[]> => {
    const response = await fetch(`${API_BASE_URL}/product-performance?fromDate=${fromDate}&toDate=${toDate}`, { 
        headers: getAuthHeader() 
    });
    if (!response.ok) { throw new Error("Lỗi khi tải báo cáo hiệu quả sản phẩm"); }
    return response.json();
};
// #endregion

// #region Báo Cáo Lương

/**
 * @summary Lấy bảng lương của nhân viên cho một tháng và năm cụ thể.
 * @param {number} month Tháng (1-12).
 * @param {number} year Năm.
 * @returns {Promise<BangLuong[]>} Danh sách bảng lương.
 * @throws {Error} Nếu có lỗi khi tải dữ liệu.
 */
export const getBangLuong = async (month: number, year: number): Promise<BangLuong[]> => {
    const response = await fetch(`${API_BASE_URL}/bangluong?month=${month}&year=${year}`, { 
        headers: getAuthHeader() 
    });
    if (!response.ok) { throw new Error("Lỗi khi tải báo cáo lương"); }
    return response.json();
};
// #endregion