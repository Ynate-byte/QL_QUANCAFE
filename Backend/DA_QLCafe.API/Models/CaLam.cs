namespace DA_QLCafe.API.Models
{
    public class CaLam
    {
        public int Ma { get; set; }
        public string TenCa { get; set; } = string.Empty;
        public TimeSpan GioBatDau { get; set; }
        public TimeSpan GioKetThuc { get; set; }
        public decimal SoGioLam { get; set; }
    }
}