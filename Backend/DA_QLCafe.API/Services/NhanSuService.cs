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
    /// Dịch vụ xử lý các nghiệp vụ liên quan đến quản lý nhân sự.
    /// </summary>
    public class NhanSuService : INhanSuService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="NhanSuService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public NhanSuService(DbContext context) { _context = context; }
        #endregion

        #region API Nhân Viên
        /// <summary>
        /// Lấy danh sách tất cả nhân viên.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="NhanVien"/>.</returns>
        public async Task<IEnumerable<NhanVien>> GetNhanViens()
        {
            var query = "SELECT Ma, HoTen, Email, SoDienThoai, VaiTro, NgayVaoLam, LuongTheoGio, TrangThaiTaiKhoan FROM NHANVIEN";
            using (var connection = _context.CreateConnection())
                return await connection.QueryAsync<NhanVien>(query);
        }

        /// <summary>
        /// Thêm một nhân viên mới vào hệ thống.
        /// </summary>
        /// <param name="nv">Đối tượng nhân viên cần thêm.</param>
        /// <returns>True nếu thêm thành công, False nếu thất bại. Ném <see cref="InvalidOperationException"/> nếu Email hoặc SĐT đã tồn tại.</returns>
        public async Task<bool> AddNhanVien(NhanVien nv)
        {
            // Mã hóa mật khẩu trước khi lưu
            if (!string.IsNullOrEmpty(nv.MatKhau))
            {
                nv.MatKhau = BCrypt.Net.BCrypt.HashPassword(nv.MatKhau);
            }

            var query = @"INSERT INTO NHANVIEN (HoTen, Email, SoDienThoai, VaiTro, NgayVaoLam, LuongTheoGio, MatKhau, TrangThaiTaiKhoan) 
                            VALUES (@HoTen, @Email, @SoDienThoai, @VaiTro, @NgayVaoLam, @LuongTheoGio, @MatKhau, @TrangThaiTaiKhoan)";
            
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    return await connection.ExecuteAsync(query, nv) > 0;
                }
                catch (SqlException ex) when (ex.Number == 2627) // Lỗi trùng khóa (ví dụ: Email, SĐT)
                {
                    throw new InvalidOperationException("Email hoặc Số điện thoại này đã được sử dụng.");
                }
            }
        }

        /// <summary>
        /// Cập nhật thông tin của một nhân viên hiện có.
        /// </summary>
        /// <param name="nv">Đối tượng nhân viên với thông tin cập nhật.</param>
        /// <returns>True nếu cập nhật thành công, False nếu không tìm thấy nhân viên. Ném <see cref="InvalidOperationException"/> nếu Email hoặc SĐT đã tồn tại.</returns>
        public async Task<UpdateNhanVienResult> UpdateNhanVien(NhanVien nv) // Thay đổi kiểu trả về
        {
            var sqlBuilder = new System.Text.StringBuilder(
                "UPDATE NHANVIEN SET HoTen=@HoTen, Email=@Email, SoDienThoai=@SoDienThoai, VaiTro=@VaiTro, NgayVaoLam=@NgayVaoLam, LuongTheoGio=@LuongTheoGio, TrangThaiTaiKhoan=@TrangThaiTaiKhoan ");

            if (!string.IsNullOrEmpty(nv.MatKhau))
            {
                nv.MatKhau = BCrypt.Net.BCrypt.HashPassword(nv.MatKhau);
                sqlBuilder.Append(", MatKhau=@MatKhau ");
            }

            sqlBuilder.Append("WHERE Ma=@Ma");

            using (var connection = _context.CreateConnection())
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Lấy trạng thái tài khoản cũ trước khi cập nhật
                        var oldNhanVien = await connection.QuerySingleOrDefaultAsync<NhanVien>(
                            "SELECT TrangThaiTaiKhoan FROM NHANVIEN WHERE Ma = @Ma", new { nv.Ma }, transaction);

                        var rowsAffected = await connection.ExecuteAsync(sqlBuilder.ToString(), nv, transaction);

                        var deletedShifts = new List<string>();

                        // Nếu trạng thái thay đổi thành 'DanNghiViec' từ trạng thái khác
                        if (rowsAffected > 0 && oldNhanVien?.TrangThaiTaiKhoan != "DanNghiViec" && nv.TrangThaiTaiKhoan == "DanNghiViec")
                        {
                            // Lấy thông tin các ca làm sẽ bị xóa
                            var shiftsToDelete = await connection.QueryAsync<dynamic>(
                                @"SELECT LL.NgayLamViec, CL.TenCa
                                  FROM LICHLAMVIEC LL
                                  JOIN CALAM CL ON LL.MaCa = CL.Ma
                                  WHERE LL.MaNhanVien = @MaNhanVien AND LL.NgayLamViec >= @NgayHienTai
                                  ORDER BY LL.NgayLamViec, CL.GIOBATDAU",
                                new { MaNhanVien = nv.Ma, NgayHienTai = DateTime.Today }, transaction);

                            // Xóa các ca làm việc
                            var deleteScheduleQuery = @"
                                DELETE FROM LICHLAMVIEC
                                WHERE MaNhanVien = @MaNhanVien AND NgayLamViec >= @NgayHienTai";

                            await connection.ExecuteAsync(deleteScheduleQuery, new { MaNhanVien = nv.Ma, NgayHienTai = DateTime.Today }, transaction);

                            // Thêm thông tin ca làm đã xóa vào danh sách
                            foreach (var shift in shiftsToDelete)
                            {
                                deletedShifts.Add($"{shift.TenCa} vào ngày {((DateTime)shift.NgayLamViec).ToString("dd/MM/yyyy")}");
                            }
                        }

                        transaction.Commit();
                        return new UpdateNhanVienResult { Success = rowsAffected > 0, Message = "Cập nhật nhân viên thành công!", DeletedShiftsInfo = deletedShifts };
                    }
                    catch (SqlException ex) when (ex.Number == 2627)
                    {
                        if (transaction != null) transaction.Rollback();
                        throw new InvalidOperationException("Email hoặc Số điện thoại này đã được sử dụng.");
                    }
                    catch (Exception ex)
                    {
                        if (transaction != null) transaction.Rollback();
                        throw new InvalidOperationException($"Lỗi khi cập nhật nhân viên hoặc xóa lịch làm việc: {ex.Message}");
                    }
                }
            }
        }

        /// <summary>
        /// Xóa một nhân viên khỏi hệ thống.
        /// </summary>
        /// <param name="ma">Mã nhân viên cần xóa.</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy nhân viên.</returns>
        public async Task<bool> DeleteNhanVien(int ma)
        {
            var query = "DELETE FROM NHANVIEN WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync(query, new { Ma = ma }) > 0;
        }
        #endregion

        #region API Ca Làm & Lịch Làm Việc
        /// <summary>
        /// Lấy danh sách tất cả các ca làm.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="CaLam"/>.</returns>
        public async Task<IEnumerable<CaLam>> GetCaLams()
        {
            var query = "SELECT * FROM CALAM";
            using (var connection = _context.CreateConnection())
                return await connection.QueryAsync<CaLam>(query);
        }

        /// <summary>
        /// Lấy lịch làm việc của nhân viên theo ngày cụ thể.
        /// </summary>
        /// <param name="ngay">Ngày cần lấy lịch làm việc.</param>
        /// <returns>Danh sách các đối tượng <see cref="LichLamViecDto"/>.</returns>
        public async Task<IEnumerable<LichLamViecDto>> GetLichLamViecTheoNgay(DateTime ngay)
        {
            var query = @"
                SELECT 
                    ll.Ma, ll.MaNhanVien, nv.HoTen, ll.MaCa, cl.TenCa, ll.NgayLamViec
                FROM LICHLAMVIEC ll
                JOIN NHANVIEN nv ON ll.MaNhanVien = nv.Ma
                JOIN CALAM cl ON ll.MaCa = cl.Ma
                WHERE CONVERT(date, ll.NgayLamViec) = CONVERT(date, @Ngay)";
            
            using (var connection = _context.CreateConnection())
                return await connection.QueryAsync<LichLamViecDto>(query, new { Ngay = ngay });
        }

        /// <summary>
        /// Thêm một lịch làm việc mới cho nhân viên.
        /// </summary>
        /// <param name="lich">Đối tượng lịch làm việc cần thêm.</param>
        /// <returns>True nếu thêm thành công, False nếu lịch làm việc đã tồn tại.</returns>
        public async Task<bool> AddLichLamViec(LichLamViec lich)
        {
            var checkQuery = "SELECT COUNT(1) FROM LICHLAMVIEC WHERE MaNhanVien = @MaNhanVien AND MaCa = @MaCa AND CONVERT(date, NgayLamViec) = CONVERT(date, @NgayLamViec)";
            var insertQuery = "INSERT INTO LICHLAMVIEC (MaNhanVien, MaCa, NgayLamViec) VALUES (@MaNhanVien, @MaCa, @NgayLamViec)";
            
            using (var connection = _context.CreateConnection())
            {
                var exists = await connection.ExecuteScalarAsync<int>(checkQuery, lich);
                if (exists > 0)
                {
                    return false; // Lịch làm việc đã tồn tại
                }
                return await connection.ExecuteAsync(insertQuery, lich) > 0;
            }
        }

        /// <summary>
        /// Xóa một lịch làm việc.
        /// </summary>
        /// <param name="ma">Mã lịch làm việc cần xóa.</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy lịch làm việc.</returns>
        public async Task<bool> DeleteLichLamViec(int ma)
        {
            var query = "DELETE FROM LICHLAMVIEC WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync(query, new { Ma = ma }) > 0;
        }
        #endregion
    }
}