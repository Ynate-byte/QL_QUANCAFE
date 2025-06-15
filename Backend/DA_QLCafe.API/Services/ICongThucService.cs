using DA_QLCafe.API.Models;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    public interface ICongThucService
    {
        Task<object?> GetCongThucBySanPham(int maSanPham);
        Task<int> LuuCongThuc(TaoCongThucDto congThucDto);
    }
}