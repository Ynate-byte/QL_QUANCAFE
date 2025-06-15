namespace DA_QLCafe.API.Models
{
    public class KhachHang
    {
        public int Ma { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
        public int DiemTichLuy { get; set; }
        public DateTime? NgaySinh { get; set; }
    }
}