namespace DA_QLCafe.API.Models
{
    public class NguyenLieu
    {
        public int Ma { get; set; }
        public string TenNguyenLieu { get; set; } = string.Empty;
        public decimal SoLuongTon { get; set; }
        public string DonViTinh { get; set; } = string.Empty;
        public decimal? GiaNhap { get; set; }
        public int? MaNhaCungCap { get; set; }
        public decimal? HanMucTrungBinhNhap { get; set; }
        public decimal? SoLuongTon_Toi_Thieu { get; set; }
    }
}