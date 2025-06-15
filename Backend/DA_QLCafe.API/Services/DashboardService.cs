using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using DA_QLCafe.API.Models.Dashboard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ cung cấp dữ liệu cho Dashboard, bao gồm các chỉ số tổng quan và cảnh báo.
    /// </summary>
    public class DashboardService : IDashboardService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="DashboardService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public DashboardService(DbContext context) 
        {
            _context = context; 
        }
        #endregion

        #region API Doanh Thu & Hiệu Suất
        /// <summary>
        /// Lấy tổng doanh thu và số đơn hàng trong ngày hiện tại.
        /// </summary>
        /// <returns>Đối tượng <see cref="DoanhThuTrongNgayDto"/>.</returns>
        public async Task<DoanhThuTrongNgayDto> GetDoanhThuTrongNgay()
        {
            var query = @"
                SELECT 
                    ISNULL(SUM(dbo.CalculateOrderTotal(Ma)), 0) AS TongDoanhThu,
                    COUNT(Ma) AS SoDonHang
                FROM DONHANG
                WHERE CONVERT(date, ThoiGianDat) = CONVERT(date, GETDATE())
                  AND TrangThai NOT IN (N'DaHuy', N'MoiTao', N'DaGop')";

            using (var connection = _context.CreateConnection())
            {
                var result = await connection.QuerySingleOrDefaultAsync<DoanhThuTrongNgayDto>(query);
                return result ?? new DoanhThuTrongNgayDto();
            }
        }

        /// <summary>
        /// Lấy doanh thu theo từng ngày trong 7 ngày gần nhất.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="DoanhThuTheoNgayDto"/>.</returns>
        public async Task<IEnumerable<DoanhThuTheoNgayDto>> GetDoanhThu7NgayQua()
        {
            var query = @"
                SELECT 
                    CONVERT(date, ThoiGianDat) AS Ngay,
                    SUM(dbo.CalculateOrderTotal(Ma)) AS TongDoanhThu
                FROM DONHANG
                WHERE ThoiGianDat >= DATEADD(day, -7, GETDATE())
                  AND TrangThai NOT IN (N'DaHuy', N'MoiTao', N'DaGop')
                GROUP BY CONVERT(date, ThoiGianDat)
                ORDER BY Ngay ASC";

            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<DoanhThuTheoNgayDto>(query);
            }
        }

        /// <summary>
        /// Lấy danh sách các sản phẩm bán chạy nhất trong 7 ngày qua.
        /// </summary>
        /// <param name="topN">Số lượng sản phẩm bán chạy hàng đầu muốn lấy.</param>
        /// <returns>Danh sách các đối tượng <see cref="SanPhamBanChayDto"/>.</returns>
        public async Task<IEnumerable<SanPhamBanChayDto>> GetSanPhamBanChay(int topN)
        {
            var query = @"
                SELECT TOP (@TopN)
                    sp.TenSP,
                    SUM(ct.SoLuong) AS SoLuongBan
                FROM CHITIETDONHANG ct
                JOIN DONHANG dh ON ct.MaDonHang = dh.Ma
                JOIN SANPHAM sp ON ct.MaSanPham = sp.Ma
                WHERE dh.ThoiGianDat >= DATEADD(day, -7, GETDATE())
                  AND dh.TrangThai NOT IN (N'DaHuy', N'MoiTao', N'DaGop')
                GROUP BY sp.TenSP
                ORDER BY SoLuongBan DESC";
            
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<SanPhamBanChayDto>(query, new { TopN = topN });
            }
        }

        /// <summary>
        /// Lấy tỷ lệ bán hàng theo danh mục trong 7 ngày qua.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="TyLeDanhMucDto"/>.</returns>
        public async Task<IEnumerable<TyLeDanhMucDto>> GetTyLeBanTheoDanhMuc7NgayQua()
        {
            var query = @"
                SELECT 
                    dm.TenDanhMuc,
                    SUM(ct.SoLuong) AS SoLuongBan
                FROM CHITIETDONHANG ct
                JOIN DONHANG dh ON ct.MaDonHang = dh.Ma
                JOIN SANPHAM sp ON ct.MaSanPham = sp.Ma
                JOIN DANHMUCSANPHAM dm ON sp.MaDanhMuc = dm.Ma
                WHERE dh.ThoiGianDat >= DATEADD(day, -7, GETDATE())
                  AND dh.TrangThai NOT IN (N'DaHuy', N'MoiTao', N'DaGop')
                GROUP BY dm.TenDanhMuc
                HAVING SUM(ct.SoLuong) > 0
                ORDER BY SoLuongBan DESC";
            
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<TyLeDanhMucDto>(query);
            }
        }
        #endregion

        #region API Cảnh Báo & Thông Báo
        /// <summary>
        /// Lấy danh sách nguyên liệu cần cảnh báo tồn kho (dưới mức tối thiểu).
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="NguyenLieuCanhBao"/>.</returns>
        public async Task<IEnumerable<NguyenLieuCanhBao>> GetCanhBaoTonKho()
        {
            var query = "SELECT * FROM V_NguyenLieuCanhBao";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<NguyenLieuCanhBao>(query);
            }
        }

        /// <summary>
        /// Lấy danh sách khách hàng có sinh nhật trong ngày hôm nay.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="KhachHang"/>.</returns>
        public async Task<IEnumerable<KhachHang>> GetKhachHangSinhNhatHomNay()
        {
            var query = @"
                SELECT * FROM KHACHHANG 
                WHERE NgaySinh IS NOT NULL 
                  AND MONTH(NgaySinh) = MONTH(GETDATE()) 
                  AND DAY(NgaySinh) = DAY(GETDATE())";
            
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<KhachHang>(query);
            }
        }
        #endregion
    }
}