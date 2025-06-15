namespace DA_QLCafe.API.Models
{
    public class PhieuNhap
    {
        public int Ma { get; set; }
        public DateTime NgayNhap { get; set; }
        public decimal TongTienNhap { get; set; }
        public int? MaNhanVienNhap { get; set; }
        public string? GhiChu { get; set; }
    }
}