export interface KhuyenMai {
  ma: number;
  tenKhuyenMai: string;
  moTa: string | null;
  ngayBatDau: string;
  ngayKetThuc: string;
  giaTriGiamGia: number;
  loaiKhuyenMai: 'PhanTram' | 'SoTien';
  trangThai: 'SapDienRa' | 'DangDienRa' | 'DaKetThuc';
}