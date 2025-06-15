using System;

namespace DA_QLCafe.API.Models
{
    public class DonHang
    {
        public int Ma { get; set; }
        public DateTime ThoiGianDat { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public int? MaNhanVien { get; set; }
        public int? MaKhachHang { get; set; }
        public string LoaiDonHang { get; set; } = string.Empty;
        public string? GhiChuDonHang { get; set; }
        public int? MaPhuongThucThanhToan { get; set; }
        public int? MaKhuyenMai { get; set; }
        public int? MaBan { get; set; }
        public int? MaDatBan { get; set; }
    }
}