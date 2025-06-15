namespace DA_QLCafe.API.Models
{
    public class PhanHoiRequestDto
    {
        public string? SoDienThoai { get; set; }
        public string LoaiPhanHoi { get; set; } = string.Empty; 
        public string NoiDung { get; set; } = string.Empty;   
    }
}