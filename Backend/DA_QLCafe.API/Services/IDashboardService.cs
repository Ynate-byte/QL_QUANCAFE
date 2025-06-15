using DA_QLCafe.API.Models;
using DA_QLCafe.API.Models.Dashboard;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    public interface IDashboardService
    {
        Task<IEnumerable<NguyenLieuCanhBao>> GetCanhBaoTonKho();
        Task<DoanhThuTrongNgayDto> GetDoanhThuTrongNgay();
        Task<IEnumerable<SanPhamBanChayDto>> GetSanPhamBanChay(int topN);
        Task<IEnumerable<DoanhThuTheoNgayDto>> GetDoanhThu7NgayQua();
        Task<IEnumerable<TyLeDanhMucDto>> GetTyLeBanTheoDanhMuc7NgayQua();
        Task<IEnumerable<KhachHang>> GetKhachHangSinhNhatHomNay();
    }
}