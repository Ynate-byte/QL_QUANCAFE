import type { KhuyenMai } from "../interfaces/KhuyenMai";
import type { PhuongThucThanhToan } from "../interfaces/PhuongThucThanhToan";
import type { TaoDonHangDto, TaoDonHangChiTietDto } from "../interfaces/Dto";
import type { DonHang } from "../interfaces/DonHang";
import type { LoaiBanVoiBan, DanhMucVoiSanPham } from "../interfaces/LoaiBan";
import type { BillDto } from "../interfaces/Bill";
import { getAuthHeader } from "./authHeader";
import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/Banhang`;

// #region LẤY DỮ LIỆU BAN ĐẦU
/**
 * @summary Lấy danh sách các bàn được phân loại theo loại bàn.
 */
export const layDanhSachBanTheoLoai = async (): Promise<LoaiBanVoiBan[]> => {
    const response = await fetch(`${API_BASE_URL}/ban-theo-loai`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi lấy danh sách bàn"); }
    return response.json();
};

/**
 * @summary Lấy danh sách sản phẩm được nhóm theo danh mục.
 */
export const laySanPhamTheoDanhMuc = async (): Promise<DanhMucVoiSanPham[]> => {
    const response = await fetch(`${API_BASE_URL}/sanpham-theo-danhmuc`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi lấy danh sách sản phẩm theo danh mục"); }
    return response.json();
};

/**
 * @summary Lấy danh sách các chương trình khuyến mãi hiện có.
 */
export const layKhuyenMaiHienCo = async (): Promise<KhuyenMai[]> => {
    const response = await fetch(`${API_BASE_URL}/khuyenmai`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi lấy danh sách khuyến mãi"); }
    return response.json();
};

/**
 * @summary Lấy danh sách các phương thức thanh toán.
 */
export const layPhuongThucThanhToan = async (): Promise<PhuongThucThanhToan[]> => {
    const response = await fetch(`${API_BASE_URL}/phuongthucthanhtoan`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi lấy danh sách phương thức thanh toán"); }
    return response.json();
};

/**
 * @summary Kiểm tra số lượng tồn kho của một sản phẩm.
 */
export const checkStockApi = async (maSanPham: number, soLuong: number): Promise<{ isAvailable: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/check-stock?maSanPham=${maSanPham}&soLuong=${soLuong}`, {
        headers: getAuthHeader()
    });
    if (!response.ok) { throw new Error("Lỗi khi kiểm tra tồn kho."); }
    return response.json();
};
// #endregion

// #region QUẢN LÝ ĐƠN HÀNG
/**
 * @summary Lấy đơn hàng hiện tại đang được thực hiện cho một bàn cụ thể.
 */
export const getDonHangHienTai = async (maBan: number): Promise<DonHang | null> => {
    const response = await fetch(`${API_BASE_URL}/ban/${maBan}/donhang-hien-tai`, { headers: getAuthHeader() });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Lỗi khi tải đơn hàng của bàn.");
    return response.json();
};

/**
 * @summary Lấy chi tiết của một đơn hàng.
 */
export const getChiTietDonHangApi = async (maDonHang: number): Promise<TaoDonHangChiTietDto[]> => {
    const response = await fetch(`${API_BASE_URL}/donhang/${maDonHang}/chitiet`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi tải chi tiết đơn hàng."); }
    return response.json();
};

/**
 * @summary Tạo một đơn hàng mới.
 */
export const taoDonHangApi = async (donHangData: TaoDonHangDto): Promise<{ newOrderID: number }> => {
    const response = await fetch(`${API_BASE_URL}/donhang`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(donHangData),
    });
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Lỗi khi tạo đơn hàng: ${errorData}`);
    }
    return response.json();
};

/**
 * @summary Thêm nhiều sản phẩm vào một đơn hàng đã có.
 */
export const themNhieuSanPhamVaoDonHangApi = (maDonHang: number, chiTiet: TaoDonHangChiTietDto[]) => {
    return fetch(`${API_BASE_URL}/donhang/${maDonHang}/themsanpham-nhieu`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ chiTietDonHang: chiTiet })
    });
};

/**
 * @summary Cập nhật số lượng của một sản phẩm trong đơn hàng.
 */
export const capNhatSoLuongApi = (maDonHang: number, maSanPham: number, soLuongMoi: number) => {
    return fetch(`${API_BASE_URL}/donhang/${maDonHang}/sua-so-luong`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ maSanPham, soLuongMoi })
    });
};

/**
 * @summary Xóa một sản phẩm khỏi đơn hàng.
 */
export const xoaSanPhamApi = (maDonHang: number, maSanPham: number) => {
    return fetch(`${API_BASE_URL}/donhang/${maDonHang}/xoa-san-pham/${maSanPham}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
};

/**
 * @summary Cập nhật trạng thái của đơn hàng.
 */
export const capNhatTrangThaiDonHangApi = (maDonHang: number, trangThai: string) => {
    return fetch(`${API_BASE_URL}/donhang/${maDonHang}/trangthai`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThai })
    });
};

/**
 * @summary Cập nhật thông tin khách hàng cho một đơn hàng.
 */
export const capNhatKhachHangApi = (maDonHang: number, maKhachHang: number | null | undefined) => {
    return fetch(`${API_BASE_URL}/donhang/${maDonHang}/khachhang`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ maKhachHang })
    });
};
// #endregion

// #region GỘP & THANH TOÁN
/**
 * @summary Gộp nhiều đơn hàng thành một đơn hàng mới.
 */
export const gopDonHangApi = (donHangIds: number[]) => {
    return fetch(`${API_BASE_URL}/gop-don-hang`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(donHangIds),
    });
};

/**
 * @summary Thực hiện thanh toán cho một đơn hàng.
 */
export const thanhToanApi = (maDonHang: number, data: { maPhuongThucThanhToan: number; maKhuyenMai?: number | null; diemSuDung?: number }) => {
    return fetch(`${API_BASE_URL}/donhang/${maDonHang}/thanhtoan`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
};

/**
 * @summary Thực hiện thanh toán gộp cho nhiều đơn hàng.
 */
export const thanhToanGopApi = (data: { 
    donHangIds: number[], 
    maPhuongThucThanhToan: number, 
    maKhuyenMai?: number | null, 
    maKhachHang?: number | null,
    diemSuDung?: number 
}) => {
    return fetch(`${API_BASE_URL}/thanh-toan-gop`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
};
// #endregion

// #region IN HÓA ĐƠN
/**
 * @summary Lấy chi tiết hóa đơn (bill) cho một đơn hàng cụ thể.
 */
export const getBillDetailsApi = async (maDonHang: number): Promise<BillDto> => {
    const response = await fetch(`${API_BASE_URL}/donhang/${maDonHang}/bill`, { headers: getAuthHeader() });
    if (!response.ok) { throw new Error("Lỗi khi tải thông tin hóa đơn"); }
    return response.json();
};
// #endregion