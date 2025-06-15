using System;

namespace DA_QLCafe.API.Models
{
    // Dùng để hiển thị danh sách
    public class DatBanDto
    {
        public int Ma { get; set; }
        public string TenBan { get; set; } = string.Empty;
        public string? TenKhachHang { get; set; }
        public DateTime ThoiGian_BatDau { get; set; }
        public DateTime ThoiGian_KetThuc { get; set; }
        public int So_Luong_Khach { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
    }

    // Dùng để tạo mới
    public class TaoDatBanDto
    {
        public int MaBan { get; set; }
        public int? MaKhachHang { get; set; }
        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public int SoLuongKhach { get; set; }
        public string? GhiChu { get; set; }
    }
}