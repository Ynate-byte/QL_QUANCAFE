export interface ChiTietCongThuc {
    maNguyenLieu: number;
    soLuongCan: number;
    donViTinh: string;
}

export interface CongThuc {
    ma: number;
    maSanPham: number;
    tenCongThuc: string;
    moTa: string | null;
}

export interface CongThucDayDu {
    congThuc: CongThuc;
    chiTiet: ChiTietCongThuc[];
}