namespace DA_QLCafe.API.Models.Auth
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public int? MaNhanVien { get; set; }
        public string? HoTen { get; set; }
        public string? VaiTro { get; set; }
    }
}