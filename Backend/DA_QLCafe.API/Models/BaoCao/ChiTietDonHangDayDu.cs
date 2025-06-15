using System;

namespace DA_QLCafe.API.Models.BaoCao
{
    public class ChiTietDonHangDayDu
    {
        public int MaDonHang { get; set; }
        public DateTime ThoiGianDat { get; set; }
        public string TrangThaiDonHang { get; set; } = string.Empty;
        public string? TenNhanVien { get; set; }
        public string TenKhachHang { get; set; } = string.Empty;
        public string LoaiDonHang { get; set; } = string.Empty;
        public string? PhuongThucThanhToan { get; set; }
        public string TenKhuyenMai { get; set; } = string.Empty;
        public string TenBan { get; set; } = string.Empty;
        public string LoaiBan { get; set; } = string.Empty;
        public string TenSP { get; set; } = string.Empty;
        public int SoLuong { get; set; }
        public decimal GiaBan { get; set; }
        public decimal ThanhTienTungSP { get; set; }
        public decimal PhuPhi { get; set; }
        public decimal TongTienDonHangFinal { get; set; }
    }
}
