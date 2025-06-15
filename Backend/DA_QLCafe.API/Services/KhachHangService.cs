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
    /// Dịch vụ xử lý các nghiệp vụ liên quan đến khách hàng.
    /// </summary>
    public class KhachHangService : IKhachHangService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="KhachHangService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public KhachHangService(DbContext context)
        {
            _context = context;
        }
        #endregion

        #region Quản Lý Khách Hàng
        /// <summary>
        /// Lấy danh sách tất cả khách hàng cùng thông tin khách hàng thân thiết.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="KhachHangLoyaltyDto"/>.</returns>
        public async Task<IEnumerable<KhachHangLoyaltyDto>> GetKhachHangs()
        {
            var query = "SELECT * FROM V_KhachHangLoyalty";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<KhachHangLoyaltyDto>(query);
            }
        }

        /// <summary>
        /// Thêm một khách hàng mới vào hệ thống.
        /// </summary>
        /// <param name="kh">Đối tượng khách hàng cần thêm.</param>
        /// <returns>True nếu thêm thành công, False nếu thất bại. Ném ngoại lệ nếu trùng SĐT/Email.</returns>
        public async Task<bool> AddKhachHang(KhachHang kh)
        {
            var query = "INSERT INTO KHACHHANG (HoTen, SoDienThoai, Email, NgaySinh, DiemTichLuy) VALUES (@HoTen, @SoDienThoai, @Email, @NgaySinh, 0)";
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    return await connection.ExecuteAsync(query, kh) > 0;
                }
                catch (SqlException ex) when (ex.Number == 2627) // Lỗi trùng khóa (ví dụ: SĐT, Email)
                {
                    throw new InvalidOperationException("Số điện thoại hoặc Email này đã tồn tại trong hệ thống.");
                }
            }
        }

        /// <summary>
        /// Cập nhật thông tin của một khách hàng hiện có.
        /// </summary>
        /// <param name="kh">Đối tượng khách hàng với thông tin cập nhật.</param>
        /// <returns>True nếu cập nhật thành công, False nếu không tìm thấy khách hàng. Ném ngoại lệ nếu trùng SĐT/Email.</returns>
        public async Task<bool> UpdateKhachHang(KhachHang kh)
        {
            var query = "UPDATE KHACHHANG SET HoTen = @HoTen, SoDienThoai = @SoDienThoai, Email = @Email, NgaySinh = @NgaySinh WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    return await connection.ExecuteAsync(query, kh) > 0;
                }
                catch (SqlException ex) when (ex.Number == 2627) // Lỗi trùng khóa
                {
                    throw new InvalidOperationException("Số điện thoại hoặc Email này đã tồn tại trong hệ thống.");
                }
            }
        }

        /// <summary>
        /// Xóa một khách hàng khỏi hệ thống.
        /// </summary>
        /// <param name="ma">Mã khách hàng cần xóa.</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy khách hàng.</returns>
        public async Task<bool> DeleteKhachHang(int ma)
        {
            var query = "DELETE FROM KHACHHANG WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                return await connection.ExecuteAsync(query, new { Ma = ma }) > 0;
            }
        }

        /// <summary>
        /// Tìm kiếm khách hàng dựa trên từ khóa (Họ tên hoặc Số điện thoại).
        /// </summary>
        /// <param name="tuKhoa">Từ khóa tìm kiếm.</param>
        /// <returns>Danh sách khách hàng phù hợp với từ khóa.</returns>
        public async Task<IEnumerable<KhachHang>> TimKiemKhachHang(string tuKhoa)
        {
            var query = @"
                SELECT * FROM KHACHHANG 
                WHERE HoTen LIKE @TuKhoaPattern 
                    OR SoDienThoai LIKE @TuKhoaPattern";

            using (var connection = _context.CreateConnection())
            {
                var tuKhoaPattern = $"%{tuKhoa}%";
                return await connection.QueryAsync<KhachHang>(query, new { TuKhoaPattern = tuKhoaPattern });
            }
        }
        #endregion

        #region Tra Cứu Khách Hàng (Loyalty)
        /// <summary>
        /// Tra cứu thông tin khách hàng thân thiết bằng số điện thoại.
        /// </summary>
        /// <param name="sdt">Số điện thoại khách hàng.</param>
        /// <returns>Thông tin khách hàng thân thiết nếu tìm thấy, ngược lại là null.</returns>
        public async Task<KhachHangLoyaltyDto?> TraCuuKhachHang(string sdt)
        {
            var query = "SELECT * FROM V_KhachHangLoyalty WHERE SoDienThoai = @SoDienThoai";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleOrDefaultAsync<KhachHangLoyaltyDto>(query, new { SoDienThoai = sdt });
            }
        }
        #endregion
    }
}