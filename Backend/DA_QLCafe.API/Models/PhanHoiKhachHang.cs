namespace DA_QLCafe.API.Models
{
    public class PhanHoiKhachHang
    {
        public int Ma { get; set; }
        public int? MaKhachHang { get; set; }
        public DateTime ThoiGian_PhanHoi { get; set; }
        public string Loai_PhanHoi { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        public string TrangThai_XuLy { get; set; } = string.Empty;
        public int? NhanVien_XuLy { get; set; }
        public string? GhiChu_XuLy { get; set; }
    }
}