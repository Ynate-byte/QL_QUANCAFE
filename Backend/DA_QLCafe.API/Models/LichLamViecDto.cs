namespace DA_QLCafe.API.Models
{
    public class LichLamViecDto
    {
        public int Ma { get; set; }
        public int MaNhanVien { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public int MaCa { get; set; }
        public string TenCa { get; set; } = string.Empty;
        public DateTime NgayLamViec { get; set; }
    }
}