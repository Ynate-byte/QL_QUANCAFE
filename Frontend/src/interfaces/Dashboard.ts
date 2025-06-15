export interface NguyenLieuCanhBao {
    maNguyenLieu: number;
    tenNguyenLieu: string;
    soLuongTon: number;
    donViTinh: string;
    soLuongTon_Toi_Thieu: number | null;
    chiTietCanhBao: string;
}
export interface DoanhThuTrongNgay {
    tongDoanhThu: number;
    soDonHang: number;
}

export interface SanPhamBanChay {
    tenSP: string;
    soLuongBan: number;
}
export interface DoanhThuTheoNgay {
    ngay: string;
    tongDoanhThu: number;
}

export interface TyLeDanhMuc {
    tenDanhMuc: string;
    soLuongBan: number;
}