namespace DA_QLCafe.API.Models
{
    public class ChiTietCongThuc
    {
        public int Ma { get; set; }
        public int MaCongThuc { get; set; }
        public int MaNguyenLieu { get; set; }
        public decimal SoLuongCan { get; set; }
        public string DonViTinh { get; set; } = string.Empty;
    }
}