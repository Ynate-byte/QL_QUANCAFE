using DA_QLCafe.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    public interface IKhachHangService
    {
        Task<IEnumerable<KhachHang>> TimKiemKhachHang(string tuKhoa);
        Task<IEnumerable<KhachHangLoyaltyDto>> GetKhachHangs();
        Task<bool> AddKhachHang(KhachHang kh);
        Task<bool> UpdateKhachHang(KhachHang kh);
        Task<bool> DeleteKhachHang(int ma);
        Task<KhachHangLoyaltyDto?> TraCuuKhachHang(string sdt);
    }
}