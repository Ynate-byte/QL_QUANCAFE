using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ xử lý các nghiệp vụ liên quan đến quản lý khuyến mãi.
    /// </summary>
    public class KhuyenMaiService : IKhuyenMaiService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="KhuyenMaiService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public KhuyenMaiService(DbContext context) { _context = context; }
        #endregion

        #region Public Methods
        /// <summary>
        /// Lấy tất cả các chương trình khuyến mãi từ cơ sở dữ liệu.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="KhuyenMai"/>.</returns>
        public async Task<IEnumerable<KhuyenMai>> GetKhuyenMais()
        {
            var query = "SELECT * FROM KHUYENMAI ORDER BY NgayKetThuc DESC";
            using (var connection = _context.CreateConnection())
                return await connection.QueryAsync<KhuyenMai>(query);
        }

        /// <summary>
        /// Thêm một chương trình khuyến mãi mới vào cơ sở dữ liệu.
        /// </summary>
        /// <param name="km">Đối tượng khuyến mãi cần thêm.</param>
        /// <returns>True nếu thêm thành công, False nếu thất bại. Ném <see cref="InvalidOperationException"/> nếu tên khuyến mãi đã tồn tại.</returns>
        public async Task<bool> AddKhuyenMai(KhuyenMai km)
        {
            var query = @"INSERT INTO KHUYENMAI (TenKhuyenMai, MoTa, NgayBatDau, NgayKetThuc, GiaTriGiamGia, LoaiKhuyenMai, TrangThai) 
                            VALUES (@TenKhuyenMai, @MoTa, @NgayBatDau, @NgayKetThuc, @GiaTriGiamGia, @LoaiKhuyenMai, @TrangThai)";
            
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    return await connection.ExecuteAsync(query, km) > 0;
                }
                catch (SqlException ex) when (ex.Number == 2627) // Mã lỗi 2627 cho ràng buộc UNIQUE KEY
                {
                    throw new InvalidOperationException("Tên khuyến mãi này đã tồn tại. Vui lòng chọn một tên khác.");
                }
            }
        }

        /// <summary>
        /// Cập nhật thông tin của một chương trình khuyến mãi hiện có.
        /// </summary>
        /// <param name="km">Đối tượng khuyến mãi với thông tin cập nhật.</param>
        /// <returns>True nếu cập nhật thành công, False nếu không tìm thấy.</returns>
        public async Task<bool> UpdateKhuyenMai(KhuyenMai km)
        {
            var query = @"UPDATE KHUYENMAI SET TenKhuyenMai=@TenKhuyenMai, MoTa=@MoTa, NgayBatDau=@NgayBatDau, NgayKetThuc=@NgayKetThuc, 
                            GiaTriGiamGia=@GiaTriGiamGia, LoaiKhuyenMai=@LoaiKhuyenMai, TrangThai=@TrangThai 
                            WHERE Ma=@Ma";
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync(query, km) > 0;
        }

        /// <summary>
        /// Xóa một chương trình khuyến mãi khỏi cơ sở dữ liệu.
        /// </summary>
        /// <param name="ma">Mã khuyến mãi cần xóa.</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy.</returns>
        public async Task<bool> DeleteKhuyenMai(int ma)
        {
            var query = "DELETE FROM KHUYENMAI WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync(query, new { Ma = ma }) > 0;
        }
        #endregion
    }
}