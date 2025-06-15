namespace DA_QLCafe.API.Models
{
    // DTO này dùng để hiển thị thông tin từ View V_KhachHangLoyalty
    public class KhachHangLoyaltyDto
    {
        public int MaKhachHang { get; set; }
        public string TenKhachHang { get; set; } = string.Empty;
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
        
        public int DiemTichLuy { get; set; }
        public string HangKhachHang { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; } 
    }
}   