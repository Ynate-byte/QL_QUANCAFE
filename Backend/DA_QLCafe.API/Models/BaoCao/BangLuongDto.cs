namespace DA_QLCafe.API.Models.BaoCao
{
    public class BangLuongDto
    {
        public int MaNhanVien { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public decimal? LuongTheoGio { get; set; }
        public decimal TongSoGioLam { get; set; }   
        public decimal LuongThucNhan { get; set; }
    }
}