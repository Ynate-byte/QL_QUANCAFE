using System;

namespace DA_QLCafe.API.Models
{
    public class DatBan
    {
        public int Ma { get; set; }
        public int MaBan { get; set; }
        public int? MaKhachHang { get; set; }
        public DateTime ThoiGian_Dat { get; set; }
        public DateTime ThoiGian_BatDau { get; set; }
        public DateTime ThoiGian_KetThuc { get; set; }
        public int So_Luong_Khach { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
    }
}