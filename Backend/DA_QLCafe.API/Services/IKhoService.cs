using DA_QLCafe.API.Models;
namespace DA_QLCafe.API.Services
{
    public interface IKhoService
    {
        Task<IEnumerable<NhaCungCap>> GetNhaCungCaps();
        Task<bool> AddNhaCungCap(NhaCungCap ncc);
        Task<bool> UpdateNhaCungCap(NhaCungCap ncc);
        Task<bool> DeleteNhaCungCap(int ma);

        Task<IEnumerable<NguyenLieu>> GetNguyenLieus();
        Task<bool> AddNguyenLieu(NguyenLieu nl);
        Task<bool> UpdateNguyenLieu(NguyenLieu nl);
        Task<bool> DeleteNguyenLieu(int ma);
        
        Task<IEnumerable<PhieuNhap>> GetLichSuPhieuNhap();
        Task<int> TaoPhieuNhap(TaoPhieuNhapDto phieuNhapDto);
        Task<IEnumerable<ChiTietPhieuNhapViewDto>> GetChiTietPhieuNhap(int maPhieuNhap);
        Task<IEnumerable<CongThucSuDungDto>> GetCongThucSuDungNguyenLieu(int maNguyenLieu);

    }
}