namespace DA_QLCafe.API.Models
{
    public class NhaCungCap
    {
        public int Ma { get; set; }
        public string TenNhaCungCap { get; set; } = string.Empty;
        public string? DiaChi { get; set; }
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
    }
}