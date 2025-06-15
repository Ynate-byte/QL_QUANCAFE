using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data;
using System.Text;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ xử lý các nghiệp vụ liên quan đến phản hồi của khách hàng.
    /// </summary>
    public class PhanHoiService : IPhanHoiService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="PhanHoiService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public PhanHoiService(DbContext context) { _context = context; }
        #endregion

        #region API Gửi Phản Hồi
        /// <summary>
        /// Thêm một phản hồi mới từ khách hàng vào cơ sở dữ liệu.
        /// </summary>
        /// <param name="dto">Đối tượng DTO chứa thông tin phản hồi.</param>
        /// <returns>True nếu thêm thành công, False nếu thất bại.</returns>
        public async Task<bool> AddNewFeedback(PhanHoiRequestDto dto)
        {
            int? maKhachHang = null;
            using (var connection = _context.CreateConnection())
            {
                if (!string.IsNullOrWhiteSpace(dto.SoDienThoai))
                {
                    var findCustomerQuery = "SELECT Ma FROM KHACHHANG WHERE SoDienThoai = @SoDienThoai";
                    maKhachHang = await connection.QuerySingleOrDefaultAsync<int?>(findCustomerQuery, new { dto.SoDienThoai });
                }

                var procedureName = "InsertCustomerFeedback";
                var parameters = new DynamicParameters();
                parameters.Add("MaKhachHang", maKhachHang, DbType.Int32);
                parameters.Add("LoaiPhanHoi", dto.LoaiPhanHoi, DbType.String);
                parameters.Add("NoiDung", dto.NoiDung, DbType.String);

                var result = await connection.ExecuteAsync(procedureName, parameters, commandType: CommandType.StoredProcedure);
                return result > 0;
            }
        }
        #endregion

        #region API Quản Lý Phản Hồi
        /// <summary>
        /// Lấy danh sách các phản hồi khách hàng với tùy chọn lọc.
        /// </summary>
        /// <param name="tuKhoa">Từ khóa để tìm kiếm trong nội dung hoặc tên khách hàng.</param>
        /// <param name="trangThai">Trạng thái xử lý của phản hồi (ví dụ: "ChuaXuLy", "DangXuLy", "DaXuLy").</param>
        /// <param name="loai">Loại phản hồi (ví dụ: "GopY", "KhieuNai").</param>
        /// <returns>Danh sách các đối tượng <see cref="PhanHoiKhachHangDto"/>.</returns>
        public async Task<IEnumerable<PhanHoiKhachHangDto>> GetPhanHois(string? tuKhoa, string? trangThai, string? loai)
        {
            var queryBuilder = new StringBuilder(@"
                SELECT 
                    ph.Ma,
                    ph.ThoiGian_PhanHoi,
                    ph.Loai_PhanHoi,
                    ph.NoiDung,
                    ph.TrangThai_XuLy,
                    ISNULL(kh.HoTen, N'Khách vãng lai') AS TenKhachHang,
                    nv.HoTen AS TenNhanVienXuLy
                FROM PHANHOIKHACHHANG ph
                LEFT JOIN KHACHHANG kh ON ph.MaKhachHang = kh.Ma
                LEFT JOIN NHANVIEN nv ON ph.NhanVien_XuLy = nv.Ma
            ");

            var parameters = new DynamicParameters();
            var whereClauses = new List<string>();

            if (!string.IsNullOrWhiteSpace(tuKhoa))
            {
                whereClauses.Add("(ph.NoiDung LIKE @TuKhoa OR kh.HoTen LIKE @TuKhoa)");
                parameters.Add("TuKhoa", $"%{tuKhoa}%");
            }

            if (!string.IsNullOrWhiteSpace(trangThai) && trangThai != "Tất cả")
            {
                whereClauses.Add("ph.TrangThai_XuLy = @TrangThai");
                parameters.Add("TrangThai", trangThai);
            }

            if (!string.IsNullOrWhiteSpace(loai) && loai != "Tất cả")
            {
                whereClauses.Add("ph.Loai_PhanHoi = @Loai");
                parameters.Add("Loai", loai);
            }
            
            if (whereClauses.Count > 0)
            {
                queryBuilder.Append(" WHERE " + string.Join(" AND ", whereClauses));
            }

            queryBuilder.Append(" ORDER BY ph.ThoiGian_PhanHoi DESC");

            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<PhanHoiKhachHangDto>(queryBuilder.ToString(), parameters);
            }
        }

        /// <summary>
        /// Cập nhật trạng thái xử lý của một phản hồi.
        /// </summary>
        /// <param name="ma">Mã phản hồi cần cập nhật.</param>
        /// <param name="trangThai">Trạng thái mới.</param>
        /// <param name="maNhanVien">Mã nhân viên xử lý.</param>
        /// <returns>True nếu cập nhật thành công, False nếu không tìm thấy phản hồi.</returns>
        public async Task<bool> UpdatePhanHoiStatus(int ma, string trangThai, int maNhanVien)
        {
            var query = "UPDATE PHANHOIKHACHHANG SET TrangThai_XuLy = @TrangThai, NhanVien_XuLy = @MaNhanVien WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                return await connection.ExecuteAsync(query, new { TrangThai = trangThai, MaNhanVien = maNhanVien, Ma = ma }) > 0;
            }
        }
        #endregion
    }
}