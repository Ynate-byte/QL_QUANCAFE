using DA_QLCafe.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    public interface IQuanLyBanService
    {
        Task<IEnumerable<LoaiBan>> GetLoaiBans();
        Task<bool> AddLoaiBan(LoaiBan loaiBan);
        Task<bool> UpdateLoaiBan(LoaiBan loaiBan);
        Task<bool> DeleteLoaiBan(int ma);

        Task<IEnumerable<Ban>> GetBans();
        Task<bool> AddBan(Ban ban);
        Task<bool> UpdateBan(Ban ban);
        Task<bool> DeleteBan(int ma);
    }
}
