namespace DA_QLCafe.API.Models.BaoCao
{
    public class KhuyenMaiHieuQuaDto
    {
        public int MaKhuyenMai { get; set; }
        public string TenKhuyenMai { get; set; } = string.Empty;
        public int SoDonHangApDung { get; set; }
        public decimal TongDoanhThu { get; set; }
    }
}