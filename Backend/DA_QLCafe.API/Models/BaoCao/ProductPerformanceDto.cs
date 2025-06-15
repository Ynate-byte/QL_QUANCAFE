namespace DA_QLCafe.API.Models.BaoCao
{
    public class ProductPerformanceDto
    {
        public int MaSanPham { get; set; }
        public string TenSanPham { get; set; } = string.Empty;
        public int SoLuongBan { get; set; }
        public decimal TongDoanhThu { get; set; }
        public decimal TongChiPhi { get; set; }
        public decimal TongLoiNhuan { get; set; }
    }
}
