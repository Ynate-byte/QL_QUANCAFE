namespace DA_QLCafe.API.Models.Dashboard
{
    public class NguyenLieuCanhBao
    {
        public int MaNguyenLieu { get; set; }
        public string TenNguyenLieu { get; set; } = string.Empty;
        public decimal SoLuongTon { get; set; }
        public string DonViTinh { get; set; } = string.Empty;
        public decimal? SoLuongTon_Toi_Thieu { get; set; }
        public string ChiTietCanhBao { get; set; } = string.Empty;
    }
}