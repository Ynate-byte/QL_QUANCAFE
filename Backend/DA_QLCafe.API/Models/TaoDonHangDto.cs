namespace DA_QLCafe.API.Models
{
    public class TaoDonHangDto
    {
        public int MaNhanVien { get; set; }
        public int? MaKhachHang { get; set; }
        public string LoaiDonHang { get; set; } = string.Empty;
        public string? GhiChuDonHang { get; set; }
        public int? MaPhuongThucThanhToan { get; set; }
        public int? MaKhuyenMai { get; set; }
        public int? MaBan { get; set; }
        public List<ChiTietDonHangDto> ChiTietDonHang { get; set; } = new List<ChiTietDonHangDto>();
    }
}