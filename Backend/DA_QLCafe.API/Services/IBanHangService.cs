using DA_QLCafe.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    public interface IBanHangService
    {
        // Lấy dữ liệu ban đầu
        Task<IEnumerable<LoaiBanVoiBanDto>> GetBanTheoLoai();
        Task<IEnumerable<DanhMucVoiSanPhamDto>> GetSanPhamTheoDanhMuc();
        Task<IEnumerable<KhuyenMai>> GetKhuyenMais();
        Task<IEnumerable<PhuongThucThanhToan>> GetPhuongThucThanhToans();
        Task<bool> CheckStock(int maSanPham, int soLuong);

        // Quản lý đơn hàng
        Task<int> TaoDonHang(TaoDonHangDto donHangDto);
        Task<DonHang?> GetDonHangDangThucHienCuaBan(int maBan);
        Task<IEnumerable<ChiTietDonHangDto>> GetChiTietDonHang(int maDonHang);
        Task<bool> ThemNhieuSanPhamVaoDonHang(int maDonHang, List<ChiTietDonHangDto> chiTietDtos);
        Task<bool> CapNhatSoLuongSanPham(int maDonHang, int maSanPham, int soLuongMoi);
        Task<bool> XoaSanPhamKhoiDonHang(int maDonHang, int maSanPham);
        Task<bool> CapNhatTrangThaiDonHang(int maDonHang, string trangThaiMoi);
        Task<bool> CapNhatKhachHangChoDon(int maDonHang, int? maKhachHang);

        // Gộp và Thanh toán
        Task<int> GopDonHang(List<int> donHangIds, int maNhanVien);
        Task<bool> HoanThanhThanhToan(int maDonHang, int maPhuongThucThanhToan, int? maKhuyenMai, int? diemSuDung);
        Task<int> GopVaThanhToanDonHang(List<int> donHangIds, int maNhanVien, int? maKhachHang);
        
        Task<BillDto?> GetBillDetails(int maDonHang);

    }
}
