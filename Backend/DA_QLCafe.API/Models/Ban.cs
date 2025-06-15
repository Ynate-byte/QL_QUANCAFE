namespace DA_QLCafe.API.Models
{
    public class Ban
    {
        public int Ma { get; set; }
        public string TenBan { get; set; } = string.Empty;
        public int? SucChua { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string LoaiBan { get; set; } = "Thuong";
        public int? MaLoaiBan { get; set; }
    }
}
