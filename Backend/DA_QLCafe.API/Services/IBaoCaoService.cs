using DA_QLCafe.API.Models.BaoCao;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DA_QLCafe.API.Models;

namespace DA_QLCafe.API.Services
{
    public interface IBaoCaoService
    {
        Task<DoanhThuLoiNhuanDto> GetDoanhThuLoiNhuan(DateTime fromDate, DateTime toDate);
        Task<IEnumerable<ChiTietDonHangDayDu>> GetLichSuDonHang(DateTime fromDate, DateTime toDate);
        Task<IEnumerable<LoiNhuanSanPhamDto>> GetLoiNhuanSanPham();
        Task<IEnumerable<KhuyenMaiHieuQuaDto>> GetHieuQuaKhuyenMai();
        Task<IEnumerable<ChiTietDonHangDayDu>> GetChiTietDonHang(int maDonHang);
        Task<IEnumerable<BangLuongDto>> GetBangLuong(int month, int year);
        Task<IEnumerable<ChiTietDonHangDayDu>> GetDonHangHomNay();
        Task<IEnumerable<ProductPerformanceDto>> GetProductPerformance(DateTime fromDate, DateTime toDate);
        Task<BillDto?> GetBillDetails(int maDonHang);
    }
}
