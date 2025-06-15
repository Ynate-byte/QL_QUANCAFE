export interface ChiTietDonHangDayDu {
    maDonHang: number;
    thoiGianDat: string;
    trangThaiDonHang: string;
    tenNhanVien: string | null;
    tenKhachHang: string;
    loaiDonHang: string;
    phuongThucThanhToan: string | null;
    tenKhuyenMai: string;
    tenBan: string;
    loaiBan: string;
    tenSP: string;
    soLuong: number;
    giaBan: number;
    thanhTienTungSP: number;
    phuPhi: number;
    tongTienDonHangFinal: number;
}

export interface LoiNhuanSanPham {
    maSanPham: number;
    tenSP: string;
    giaBanHienTai: number;
    chiPhiNguyenLieuUocTinh: number;
    loiNhuanGopUocTinhPerUnit: number;
}

export interface KhuyenMaiHieuQua {
    maKhuyenMai: number;
    tenKhuyenMai: string;
    soDonHangApDung: number;
    tongDoanhThu: number;
}

export interface BangLuong {
    maNhanVien: number;
    hoTen: string;
    luongTheoGio: number | null;
    tongSoGioLam: number;  
    luongThucNhan: number;
}
export interface ProductPerformance {
    maSanPham: number;
    tenSanPham: string;
    soLuongBan: number;
    tongDoanhThu: number;
    tongChiPhi: number;
    tongLoiNhuan: number;
}
export interface DoanhThuLoiNhuan {
    totalRevenue: number;
    totalCOGS: number;
    totalSalaries: number;
    totalProfit: number;
}