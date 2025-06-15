export interface KhachHang {
  ma: number;
  hoTen: string;
  soDienThoai: string | null;
  email: string | null;
  ngaySinh: string | null;
  diemTichLuy: number;
}

export interface KhachHangLoyalty extends Omit<KhachHang, 'ma' | 'hoTen' | 'ngaySinh'>{
    maKhachHang: number;
    tenKhachHang: string;
    hangKhachHang: string;
    ngaySinh?: string | null;
}