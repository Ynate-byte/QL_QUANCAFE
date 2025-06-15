export interface NhanVien {
    ma: number;
    hoTen: string;
    email: string | null;
    soDienThoai: string | null;
    vaiTro: string;
    ngayVaoLam: string | null;
    luongTheoGio: number | null;
    trangThaiTaiKhoan: string;
    matKhau?: string;
}

export interface UpdateNhanVienResult {
    Message: string;
    DeletedShifts: string[];
}