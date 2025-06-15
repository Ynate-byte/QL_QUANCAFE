namespace DA_QLCafe.API.Models
{
    public class CongThucPhaChe
    {
        public int Ma { get; set; }
        public int MaSanPham { get; set; }
        public string TenCongThuc { get; set; } = string.Empty;
        public string? MoTa { get; set; }
    }
}