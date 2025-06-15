namespace DA_QLCafe.API.Models
{
    public class SanPham
    {
        public int Ma { get; set; }
        public string TenSP { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public decimal Gia { get; set; }
        public int MaDanhMuc { get; set; }
        public string? HinhAnhSP { get; set; }
        public decimal SoLuongTaoRa { get; set; }
        public int? SoLuongTon { get; set; }
        public bool IsAvailable { get; set; }
    }
}
