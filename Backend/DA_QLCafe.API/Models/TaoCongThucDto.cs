namespace DA_QLCafe.API.Models
{
    // DTO cho chi tiết
    public class ChiTietCongThucDto
    {
        public int MaNguyenLieu { get; set; }
        public decimal SoLuongCan { get; set; }
        public string DonViTinh { get; set; } = string.Empty;
    }

    // DTO cho toàn bộ công thức
    public class TaoCongThucDto
    {
        public int MaSanPham { get; set; }
        public string TenCongThuc { get; set; } = string.Empty;
        public string? MoTaCongThuc { get; set; }
        public List<ChiTietCongThucDto> ChiTietCongThuc { get; set; } = new List<ChiTietCongThucDto>();
    }
}