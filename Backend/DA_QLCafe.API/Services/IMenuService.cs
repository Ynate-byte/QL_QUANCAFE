using DA_QLCafe.API.Models;

namespace DA_QLCafe.API.Services
{
    public interface IMenuService
    {
        Task<IEnumerable<DanhMucSanPham>> GetDanhSachDanhMuc();
        Task<bool> ThemDanhMuc(DanhMucSanPham danhMuc);
        Task<bool> SuaDanhMuc(DanhMucSanPham danhMuc);
        Task<bool> XoaDanhMuc(int maDanhMuc);

        Task<IEnumerable<SanPham>> GetDanhSachSanPham();
        Task<bool> ThemSanPham(SanPham sanPham);
        Task<bool> SuaSanPham(SanPham sanPham);
        Task<bool> XoaSanPham(int maSanPham);
    }
}