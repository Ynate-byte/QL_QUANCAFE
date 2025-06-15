using System.Text.Json;
using System.Data;
using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System; 
using System.Linq;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ quản lý các hoạt động liên quan đến kho hàng, bao gồm nhà cung cấp, nguyên liệu và phiếu nhập.
    /// </summary>
    public class KhoService : IKhoService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="KhoService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public KhoService(DbContext context) { _context = context; }
        #endregion

        #region API Nhà Cung Cấp
        /// <summary>
        /// Lấy tất cả nhà cung cấp hiện có.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="NhaCungCap"/>.</returns>
        public async Task<IEnumerable<NhaCungCap>> GetNhaCungCaps()
        {
            var query = "SELECT * FROM NHACUNGCAP";
            using (var connection = _context.CreateConnection())
                return await connection.QueryAsync<NhaCungCap>(query);
        }

        /// <summary>
        /// Thêm một nhà cung cấp mới.
        /// </summary>
        /// <param name="ncc">Đối tượng nhà cung cấp cần thêm.</param>
        /// <returns>True nếu thêm thành công, False nếu thất bại. Ném <see cref="InvalidOperationException"/> nếu tên nhà cung cấp đã tồn tại.</returns>
        public async Task<bool> AddNhaCungCap(NhaCungCap ncc)
        {
            var query = "INSERT INTO NHACUNGCAP (TenNhaCungCap, DiaChi, SoDienThoai, Email) VALUES (@TenNhaCungCap, @DiaChi, @SoDienThoai, @Email)";
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    return await connection.ExecuteAsync(query, ncc) > 0;
                }
                catch (SqlException ex) when (ex.Number == 2627) // UNIQUE KEY constraint violation
                {
                    throw new InvalidOperationException("Tên nhà cung cấp này đã tồn tại.");
                }
            }
        }

        /// <summary>
        /// Cập nhật thông tin của một nhà cung cấp.
        /// </summary>
        /// <param name="ncc">Đối tượng nhà cung cấp với thông tin cập nhật.</param>
        /// <returns>True nếu cập nhật thành công, False nếu không tìm thấy. Ném <see cref="InvalidOperationException"/> nếu tên nhà cung cấp đã tồn tại.</returns>
        public async Task<bool> UpdateNhaCungCap(NhaCungCap ncc)
        {
            var query = "UPDATE NHACUNGCAP SET TenNhaCungCap = @TenNhaCungCap, DiaChi = @DiaChi, SoDienThoai = @SoDienThoai, Email = @Email WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    return await connection.ExecuteAsync(query, ncc) > 0;
                }
                catch (SqlException ex) when (ex.Number == 2627) // UNIQUE KEY constraint violation
                {
                    throw new InvalidOperationException("Tên nhà cung cấp này đã tồn tại.");
                }
            }
        }

        /// <summary>
        /// Xóa một nhà cung cấp.
        /// </summary>
        /// <param name="ma">Mã nhà cung cấp cần xóa.</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy.</returns>
        public async Task<bool> DeleteNhaCungCap(int ma)
        {
            var query = "DELETE FROM NHACUNGCAP WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync(query, new { Ma = ma }) > 0;
        }
        #endregion

        #region API Nguyên Liệu
        /// <summary>
        /// Lấy tất cả nguyên liệu.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="NguyenLieu"/>.</returns>
        public async Task<IEnumerable<NguyenLieu>> GetNguyenLieus()
        {
            var query = "SELECT * FROM NGUYENLIEU";
            using (var connection = _context.CreateConnection())
                return await connection.QueryAsync<NguyenLieu>(query);
        }

        /// <summary>
        /// Thêm một nguyên liệu mới.
        /// </summary>
        /// <param name="nl">Đối tượng nguyên liệu cần thêm.</param>
        /// <returns>True nếu thêm thành công, False nếu thất bại. Ném <see cref="InvalidOperationException"/> nếu tên nguyên liệu đã tồn tại.</returns>
        public async Task<bool> AddNguyenLieu(NguyenLieu nl)
        {
            var query = @"INSERT INTO NGUYENLIEU (TenNguyenLieu, SoLuongTon, DonViTinh, GiaNhap, MaNhaCungCap, SoLuongTon_Toi_Thieu) 
                            VALUES (@TenNguyenLieu, @SoLuongTon, @DonViTinh, @GiaNhap, @MaNhaCungCap, @SoLuongTon_Toi_Thieu)";
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    return await connection.ExecuteAsync(query, nl) > 0;
                }
                catch (SqlException ex) when (ex.Number == 2627)
                {
                    throw new InvalidOperationException("Tên nguyên liệu này đã tồn tại.");
                }
            }
        }

        /// <summary>
        /// Cập nhật thông tin của một nguyên liệu.
        /// </summary>
        /// <param name="nl">Đối tượng nguyên liệu với thông tin cập nhật.</param>
        /// <returns>True nếu cập nhật thành công, False nếu không tìm thấy. Ném <see cref="InvalidOperationException"/> nếu tên nguyên liệu đã tồn tại.</returns>
        public async Task<bool> UpdateNguyenLieu(NguyenLieu nl)
        {
            var query = @"UPDATE NGUYENLIEU SET TenNguyenLieu = @TenNguyenLieu, SoLuongTon = @SoLuongTon, DonViTinh = @DonViTinh, 
                            GiaNhap = @GiaNhap, MaNhaCungCap = @MaNhaCungCap, SoLuongTon_Toi_Thieu = @SoLuongTon_Toi_Thieu WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    return await connection.ExecuteAsync(query, nl) > 0;
                }
                catch (SqlException ex) when (ex.Number == 2627)
                {
                    throw new InvalidOperationException("Tên nguyên liệu này đã tồn tại.");
                }
            }
        }

        /// <summary>
        /// Xóa một nguyên liệu khỏi hệ thống.
        /// </summary>
        /// <param name="ma">Mã nguyên liệu cần xóa.</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy.</returns>
        /// <exception cref="InvalidOperationException">Ném ra nếu nguyên liệu đang được sử dụng trong công thức (lỗi khóa ngoại).</exception>
        public async Task<bool> DeleteNguyenLieu(int ma)
        {
            var query = "DELETE FROM NGUYENLIEU WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    return await connection.ExecuteAsync(query, new { Ma = ma }) > 0;
                }
                catch (SqlException ex) when (ex.Number == 547) // Lỗi vi phạm ràng buộc khóa ngoại
                {
                    throw new InvalidOperationException("Xung đột ràng buộc khóa ngoại.");
                }
            }
        }

        /// <summary>
        /// Lấy danh sách các công thức đang sử dụng một nguyên liệu cụ thể.
        /// </summary>
        /// <param name="maNguyenLieu">Mã nguyên liệu.</param>
        /// <returns>Danh sách các đối tượng <see cref="CongThucSuDungDto"/>.</returns>
        public async Task<IEnumerable<CongThucSuDungDto>> GetCongThucSuDungNguyenLieu(int maNguyenLieu)
        {
            var query = @"
                SELECT 
                    ct.MA AS MaCongThuc,
                    ct.TENCONGTHUC AS TenCongThuc,
                    sp.TENSP AS TenSanPham
                FROM CHITIETCONGTHUC ctc
                JOIN CONGTHUCPHACHE ct ON ctc.MACONGTHUC = ct.MA
                JOIN SANPHAM sp ON ct.MASANPHAM = sp.MA
                WHERE ctc.MANGUYENLIEU = @MaNguyenLieu";
            
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<CongThucSuDungDto>(query, new { MaNguyenLieu = maNguyenLieu });
            }
        }
        #endregion

        #region API Phiếu Nhập
        /// <summary>
        /// Lấy lịch sử tất cả các phiếu nhập.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="PhieuNhap"/>.</returns>
        public async Task<IEnumerable<PhieuNhap>> GetLichSuPhieuNhap()
        {
            var query = "SELECT * FROM PHIEUNHAP ORDER BY NgayNhap DESC";
            using (var connection = _context.CreateConnection())
                return await connection.QueryAsync<PhieuNhap>(query);
        }

        /// <summary>
        /// Tạo một phiếu nhập mới cùng với các chi tiết.
        /// </summary>
        /// <param name="phieuNhapDto">Đối tượng DTO chứa thông tin phiếu nhập và chi tiết.</param>
        /// <returns>Mã của phiếu nhập mới được tạo.</returns>
        public async Task<int> TaoPhieuNhap(TaoPhieuNhapDto phieuNhapDto)
        {
            var tongTien = phieuNhapDto.ChiTietPhieuNhap.Sum(ct => ct.SoLuongNhap * ct.DonGiaNhap);

            var procedureName = "AddPhieuNhapWithDetails";
            var jsonChiTiet = JsonSerializer.Serialize(phieuNhapDto.ChiTietPhieuNhap);

            var parameters = new DynamicParameters();
            parameters.Add("MaNhanVienNhap", phieuNhapDto.MaNhanVienNhap, DbType.Int32);
            parameters.Add("TongTienNhap", tongTien, DbType.Decimal);
            parameters.Add("GhiChu", phieuNhapDto.GhiChu, DbType.String);
            parameters.Add("JsonPhieuNhapDetails", jsonChiTiet, DbType.String);

            using (var connection = _context.CreateConnection())
            {
                var newId = await connection.QuerySingleAsync<int>(procedureName, parameters, commandType: CommandType.StoredProcedure);
                return newId;
            }
        }
        
        /// <summary>
        /// Lấy chi tiết của một phiếu nhập cụ thể.
        /// </summary>
        /// <param name="maPhieuNhap">Mã phiếu nhập.</param>
        /// <returns>Danh sách các đối tượng <see cref="ChiTietPhieuNhapViewDto"/>.</returns>
        public async Task<IEnumerable<ChiTietPhieuNhapViewDto>> GetChiTietPhieuNhap(int maPhieuNhap)
        {
            var query = @"
                SELECT 
                    ctpn.MA AS MaChiTietPhieuNhap,
                    ctpn.MANGUYENLIEU AS MaNguyenLieu,
                    nl.TENNGUYENLIEU AS TenNguyenLieu,
                    ctpn.SOLUONGNHAP AS SoLuongNhap,
                    ctpn.DONGIANHAP AS DonGiaNhap
                FROM CHITIETPHIEUNHAP ctpn
                JOIN NGUYENLIEU nl ON ctpn.MANGUYENLIEU = nl.MA
                WHERE ctpn.MAPHIEUNHAP = @MaPhieuNhap";

            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<ChiTietPhieuNhapViewDto>(query, new { MaPhieuNhap = maPhieuNhap });
            }
        }
        #endregion
    }
}