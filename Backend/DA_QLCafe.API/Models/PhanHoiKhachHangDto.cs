namespace DA_QLCafe.API.Models
{
    public class PhanHoiKhachHangDto
    {
        public int Ma { get; set; }
        public DateTime ThoiGian_PhanHoi { get; set; }
        public string Loai_PhanHoi { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        public string TrangThai_XuLy { get; set; } = string.Empty;
        public string? TenKhachHang { get; set; } 
        public string? TenNhanVienXuLy { get; set; }
    }
}