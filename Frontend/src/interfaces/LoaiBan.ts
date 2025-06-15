import type { Ban } from "./Ban";
import type { SanPham } from "./SanPham";

export interface LoaiBan {
    ma: number;
    tenLoaiBan: string;
}

export interface LoaiBanVoiBan {
    maLoaiBan: number;
    tenLoaiBan: string;
    danhSachBan: Ban[];
}

export interface DanhMucVoiSanPham {
    maDanhMuc: number;
    tenDanhMuc: string;
    danhSachSanPham: SanPham[];
}
