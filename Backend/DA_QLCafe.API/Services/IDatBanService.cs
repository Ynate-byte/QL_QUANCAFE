using DA_QLCafe.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    public interface IDatBanService
    {
        Task<IEnumerable<DatBanDto>> GetDatBansTheoNgay(DateTime ngay);
        Task<bool> TaoDatBan(TaoDatBanDto dto);
        Task<bool> UpdateTrangThai(int ma, string trangThai);
        Task<int> ConfirmArrival(int maDatBan, int maNhanVien);
    }
}