namespace DA_QLCafe.API.Models
{
    public class TaoPhieuNhapDto
    {
        public int MaNhanVienNhap { get; set; }
        public string? GhiChu { get; set; }
        public List<ChiTietPhieuNhapDto> ChiTietPhieuNhap { get; set; } = new List<ChiTietPhieuNhapDto>();
    }
}