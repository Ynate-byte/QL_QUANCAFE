namespace DA_QLCafe.API.Models
{
    public class ChiTietPhieuNhapViewDto
    {
        public int MaChiTietPhieuNhap { get; set; }
        public int MaNguyenLieu { get; set; }
        public string TenNguyenLieu { get; set; } = string.Empty;
        public decimal SoLuongNhap { get; set; }
        public decimal DonGiaNhap { get; set; }
        public decimal ThanhTien => SoLuongNhap * DonGiaNhap;
    }
}