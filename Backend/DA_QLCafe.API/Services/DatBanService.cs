using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ xử lý các nghiệp vụ liên quan đến đặt bàn.
    /// </summary>
    public class DatBanService : IDatBanService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="DatBanService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public DatBanService(DbContext context) { _context = context; }
        #endregion

        #region Public Methods
        /// <summary>
        /// Lấy danh sách các lượt đặt bàn theo ngày cụ thể.
        /// </summary>
        /// <param name="ngay">Ngày cần lấy danh sách đặt bàn.</param>
        /// <returns>Danh sách các đối tượng <see cref="DatBanDto"/>.</returns>
        public async Task<IEnumerable<DatBanDto>> GetDatBansTheoNgay(DateTime ngay)
        {
            var query = @"
                SELECT 
                    db.Ma, 
                    b.TenBan, 
                    ISNULL(kh.HoTen, N'Khách vãng lai') as TenKhachHang, 
                    db.GhiChu,
                    db.ThoiGian_BatDau, 
                    db.ThoiGian_KetThuc, 
                    db.So_Luong_Khach, 
                    db.TrangThai
                FROM DATBAN db
                JOIN BAN b ON db.MaBan = b.Ma
                LEFT JOIN KHACHHANG kh ON db.MaKhachHang = kh.Ma
                WHERE CONVERT(date, db.ThoiGian_BatDau) = CONVERT(date, @Ngay)
                ORDER BY db.ThoiGian_BatDau ASC";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<DatBanDto>(query, new { Ngay = ngay });
            }
        }

        /// <summary>
        /// Tạo một lượt đặt bàn mới.
        /// </summary>
        /// <param name="dto">Đối tượng DTO chứa thông tin đặt bàn.</param>
        /// <returns>True nếu đặt bàn thành công, False nếu có lỗi.</returns>
        public async Task<bool> TaoDatBan(TaoDatBanDto dto)
        {
            var procedureName = "BookTable";
            var parameters = new DynamicParameters();
            parameters.Add("MaBan", dto.MaBan, DbType.Int32);
            parameters.Add("MaKhachHang", dto.MaKhachHang, DbType.Int32);
            parameters.Add("ThoiGianBatDau", dto.ThoiGianBatDau, DbType.DateTime2);
            parameters.Add("ThoiGianKetThuc", dto.ThoiGianKetThuc, DbType.DateTime2);
            parameters.Add("SoLuongKhach", dto.SoLuongKhach, DbType.Int32);
            parameters.Add("GhiChu", dto.GhiChu, DbType.String);
            
            using (var connection = _context.CreateConnection())
            {
                var result = await connection.ExecuteAsync(procedureName, parameters, commandType: CommandType.StoredProcedure);
                return result > 0;
            }
        }

        /// <summary>
        /// Cập nhật trạng thái của một lượt đặt bàn.
        /// </summary>
        /// <param name="ma">Mã lượt đặt bàn.</param>
        /// <param name="trangThai">Trạng thái mới.</param>
        /// <returns>True nếu cập nhật thành công, False nếu không tìm thấy lượt đặt bàn.</returns>
        public async Task<bool> UpdateTrangThai(int ma, string trangThai)
        {
            var query = "UPDATE DATBAN SET TrangThai = @TrangThai WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                return await connection.ExecuteAsync(query, new { TrangThai = trangThai, Ma = ma }) > 0;
            }
        }

        /// <summary>
        /// Xác nhận khách hàng đã đến và tạo đơn hàng liên quan.
        /// </summary>
        /// <param name="maDatBan">Mã lượt đặt bàn.</param>
        /// <param name="maNhanVien">Mã nhân viên xác nhận.</param>
        /// <returns>Mã đơn hàng mới được tạo sau khi xác nhận.</returns>
        public async Task<int> ConfirmArrival(int maDatBan, int maNhanVien)
        {
            var procedureName = "ConfirmBookingArrival";
            var parameters = new { MaDatBan = maDatBan, MaNhanVien = maNhanVien };
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleAsync<int>(procedureName, parameters, commandType: CommandType.StoredProcedure);
            }
        }
        #endregion
    }
}