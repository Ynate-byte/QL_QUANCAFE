using DA_QLCafe.API.Models;

namespace DA_QLCafe.API.Services
{
    public interface INhanSuService
    {
        Task<IEnumerable<NhanVien>> GetNhanViens();
        Task<bool> AddNhanVien(NhanVien nv);
        Task<bool> DeleteNhanVien(int ma);
        Task<UpdateNhanVienResult> UpdateNhanVien(NhanVien nv);
        Task<IEnumerable<CaLam>> GetCaLams();
        Task<IEnumerable<LichLamViecDto>> GetLichLamViecTheoNgay(DateTime ngay);
        Task<bool> AddLichLamViec(LichLamViec lich);
        Task<bool> DeleteLichLamViec(int ma);
    }
}