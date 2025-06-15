namespace DA_QLCafe.API.Models
{
    public class KhuyenMai
    {
        public int Ma { get; set; }
        public string TenKhuyenMai { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public decimal GiaTriGiamGia { get; set; }
        public string LoaiKhuyenMai { get; set; } = string.Empty;
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public string TrangThai { get; set; } = string.Empty;
    }
}