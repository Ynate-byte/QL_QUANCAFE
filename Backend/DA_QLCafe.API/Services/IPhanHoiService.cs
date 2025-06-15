using DA_QLCafe.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    public interface IPhanHoiService
    {
        Task<bool> AddNewFeedback(PhanHoiRequestDto dto);
        Task<IEnumerable<PhanHoiKhachHangDto>> GetPhanHois(string? tuKhoa, string? trangThai, string? loai);
        Task<bool> UpdatePhanHoiStatus(int ma, string trangThai, int maNhanVien);
    }
}