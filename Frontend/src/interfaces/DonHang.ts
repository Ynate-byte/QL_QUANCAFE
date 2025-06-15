export interface DonHang {
    ma: number;
    thoiGianDat: string;
    trangThai: string;
    maNhanVien: number | null;
    maKhachHang: number | null;
    loaiDonHang: string;
    ghiChuDonHang: string | null;
    maPhuongThucThanhToan: number | null;
    maKhuyenMai: number | null;
    maBan: number | null;
    phuPhi: number;
    maDatBan?: number | null; 
}