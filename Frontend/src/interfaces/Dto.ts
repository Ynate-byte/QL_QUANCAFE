// DTO cho việc tạo Đơn hàng
export interface TaoDonHangChiTietDto {
    maSanPham: number;
    soLuong: number;
    giaBan: number;
}
export interface TaoDonHangDto {
    maNhanVien: number;
    maKhachHang?: number | null;
    loaiDonHang: string;
    maBan?: number | null;
    ghiChuDonHang?: string;
    maPhuongThucThanhToan?: number;
    maKhuyenMai?: number | null;
    chiTietDonHang: TaoDonHangChiTietDto[];
}

// DTO cho việc tạo Phiếu Nhập
export interface TaoPhieuNhapChiTietDto {
    maNguyenLieu: number;
    soLuongNhap: number;
    donGiaNhap: number;
}
export interface TaoPhieuNhapDto {
    maNhanVienNhap: number;
    ghiChu?: string;
    chiTietPhieuNhap: TaoPhieuNhapChiTietDto[];
}

// DTO cho việc tạo Công thức
export interface TaoCongThucChiTietDto {
    maNguyenLieu: number;
    soLuongCan: number;
    donViTinh: string;
}
export interface TaoCongThucDto {
    maSanPham: number;
    tenCongThuc: string;
    moTaCongThuc?: string;
    chiTietCongThuc: TaoCongThucChiTietDto[];
}

// DTO cho việc tạo Đặt Bàn
export interface TaoDatBanDto {
    maBan: number;
    maKhachHang?: number | null;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    soLuongKhach: number;
    ghiChu?: string;
}

export interface ChiTietPhieuNhapViewDto {
  maChiTietPhieuNhap: number;
  maNguyenLieu: number;
  tenNguyenLieu: string;
  soLuongNhap: number;
  donGiaNhap: number;
  thanhTien: number; 
}