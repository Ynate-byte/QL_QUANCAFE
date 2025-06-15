namespace DA_QLCafe.API.Models
{
    public class NhanVien
    {
        public int Ma { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? SoDienThoai { get; set; }
        public string VaiTro { get; set; } = string.Empty;
        public DateTime? NgayVaoLam { get; set; }
        public decimal? LuongTheoGio { get; set; } 
        public string? MatKhau { get; set; } 
        public string TrangThaiTaiKhoan { get; set; } = "HoatDong";
    }
}