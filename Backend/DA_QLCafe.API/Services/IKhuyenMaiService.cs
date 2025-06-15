using DA_QLCafe.API.Models;

namespace DA_QLCafe.API.Services
{
    public interface IKhuyenMaiService
    {
        Task<IEnumerable<KhuyenMai>> GetKhuyenMais();
        Task<bool> AddKhuyenMai(KhuyenMai km);
        Task<bool> UpdateKhuyenMai(KhuyenMai km);
        Task<bool> DeleteKhuyenMai(int ma);
    }
}