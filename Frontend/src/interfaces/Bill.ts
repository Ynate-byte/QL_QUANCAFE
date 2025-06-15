export interface BillItemDto {
    tenSP: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
}

export interface BillDto {
    tenCuaHang: string;
    diaChiCuaHang: string;
    soDienThoaiCuaHang: string;
    loiCamOn: string;
    maDonHang: number;
    thoiGianThanhToan: string;
    tenNhanVien: string;
    tenKhachHang?: string;
    tenBan?: string;
    loaiDonHang: string;
    phuongThucThanhToan: string;
    chiTiet: BillItemDto[];
    tongTienHang: number;
    phuPhi: number;
    giamGia: number;
    tenKhuyenMai?: string;
    tongCong: number;
}
