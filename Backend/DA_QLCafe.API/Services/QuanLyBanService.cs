using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ quản lý các hoạt động liên quan đến bàn và loại bàn.
    /// </summary>
    public class QuanLyBanService : IQuanLyBanService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="QuanLyBanService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public QuanLyBanService(DbContext context) { _context = context; }
        #endregion

        #region Quản Lý Loại Bàn
        /// <summary>
        /// Lấy tất cả các loại bàn hiện có.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="LoaiBan"/>.</returns>
        public async Task<IEnumerable<LoaiBan>> GetLoaiBans()
        {
            using (var connection = _context.CreateConnection())
                return await connection.QueryAsync<LoaiBan>("SELECT * FROM LOAIBAN ORDER BY TenLoaiBan");
        }

        /// <summary>
        /// Thêm một loại bàn mới.
        /// </summary>
        /// <param name="loaiBan">Đối tượng loại bàn cần thêm.</param>
        /// <returns>True nếu thêm thành công, False nếu thất bại.</returns>
        public async Task<bool> AddLoaiBan(LoaiBan loaiBan)
        {
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync("INSERT INTO LOAIBAN (TENLOAIBAN) VALUES (@TenLoaiBan)", loaiBan) > 0;
        }

        /// <summary>
        /// Cập nhật thông tin một loại bàn hiện có.
        /// </summary>
        /// <param name="loaiBan">Đối tượng loại bàn với thông tin cập nhật.</param>
        /// <returns>True nếu cập nhật thành công, False nếu không tìm thấy.</returns>
        public async Task<bool> UpdateLoaiBan(LoaiBan loaiBan)
        {
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync("UPDATE LOAIBAN SET TENLOAIBAN = @TenLoaiBan WHERE MA = @Ma", loaiBan) > 0;
        }

        /// <summary>
        /// Xóa một loại bàn.
        /// </summary>
        /// <param name="ma">Mã loại bàn cần xóa.</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy.</returns>
        public async Task<bool> DeleteLoaiBan(int ma)
        {
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync("DELETE FROM LOAIBAN WHERE MA = @Ma", new { Ma = ma }) > 0;
        }
        #endregion

        #region Quản Lý Bàn
        /// <summary>
        /// Lấy tất cả các bàn hiện có.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="Ban"/>.</returns>
        public async Task<IEnumerable<Ban>> GetBans()
        {
            using (var connection = _context.CreateConnection())
                return await connection.QueryAsync<Ban>("SELECT * FROM BAN ORDER BY TenBan");
        }

        /// <summary>
        /// Thêm một bàn mới.
        /// </summary>
        /// <param name="ban">Đối tượng bàn cần thêm.</param>
        /// <returns>True nếu thêm thành công, False nếu thất bại.</returns>
        public async Task<bool> AddBan(Ban ban)
        {
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync("INSERT INTO BAN (TenBan, SucChua, MaLoaiBan, LoaiBan, TrangThai) VALUES (@TenBan, @SucChua, @MaLoaiBan, @LoaiBan, N'Trong')", ban) > 0;
        }

        /// <summary>
        /// Cập nhật thông tin một bàn hiện có.
        /// </summary>
        /// <param name="ban">Đối tượng bàn với thông tin cập nhật.</param>
        /// <returns>True nếu cập nhật thành công, False nếu không tìm thấy.</returns>
        public async Task<bool> UpdateBan(Ban ban)
        {
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync("UPDATE BAN SET TenBan = @TenBan, SucChua = @SucChua, MaLoaiBan = @MaLoaiBan, LoaiBan = @LoaiBan WHERE MA = @Ma", ban) > 0;
        }

        /// <summary>
        /// Xóa một bàn.
        /// </summary>
        /// <param name="ma">Mã bàn cần xóa.</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy.</returns>
        public async Task<bool> DeleteBan(int ma)
        {
            using (var connection = _context.CreateConnection())
                return await connection.ExecuteAsync("DELETE FROM BAN WHERE MA = @Ma", new { Ma = ma }) > 0;
        }
        #endregion
    }
}