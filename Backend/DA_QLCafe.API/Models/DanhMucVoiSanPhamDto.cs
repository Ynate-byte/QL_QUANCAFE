using System.Collections.Generic;

namespace DA_QLCafe.API.Models
{
    public class DanhMucVoiSanPhamDto
    {
        public int MaDanhMuc { get; set; }
        public string TenDanhMuc { get; set; } = string.Empty; 
        public List<SanPham> DanhSachSanPham { get; set; } = new List<SanPham>();
    }
}
