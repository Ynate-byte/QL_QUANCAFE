using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using DA_QLCafe.API.Models.BaoCao;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ cung cấp các chức năng liên quan đến báo cáo.
    /// </summary>
    public class BaoCaoService : IBaoCaoService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="BaoCaoService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public BaoCaoService(DbContext context) { _context = context; }
        #endregion

        #region Báo Cáo Doanh Thu & Lợi Nhuận
        /// <summary>
        /// Lấy báo cáo doanh thu và lợi nhuận trong một khoảng thời gian cụ thể.
        /// </summary>
        /// <param name="fromDate">Ngày bắt đầu.</param>
        /// <param name="toDate">Ngày kết thúc.</param>
        /// <returns>Đối tượng <see cref="DoanhThuLoiNhuanDto"/> chứa thông tin doanh thu và lợi nhuận.</returns>
        public async Task<DoanhThuLoiNhuanDto> GetDoanhThuLoiNhuan(DateTime fromDate, DateTime toDate)
        {
            var procedureName = "GetRevenueAndProfit";
            var parameters = new { StartDate = fromDate, EndDate = toDate.AddDays(1) };

            using (var connection = _context.CreateConnection())
            {
                var result = await connection.QuerySingleOrDefaultAsync<DoanhThuLoiNhuanDto>(
                    procedureName,
                    parameters,
                    commandType: CommandType.StoredProcedure);

                return result ?? new DoanhThuLoiNhuanDto();
            }
        }
        #endregion

        #region Báo Cáo Đơn Hàng
        /// <summary>
        /// Lấy lịch sử các đơn hàng đã thanh toán trong một khoảng thời gian.
        /// </summary>
        /// <param name="fromDate">Ngày bắt đầu.</param>
        /// <param name="toDate">Ngày kết thúc.</param>
        /// <returns>Danh sách các đối tượng <see cref="ChiTietDonHangDayDu"/>.</returns>
        public async Task<IEnumerable<ChiTietDonHangDayDu>> GetLichSuDonHang(DateTime fromDate, DateTime toDate)
        {
            var toDateInclusive = toDate.AddDays(1);
            var query = @"SELECT * FROM V_FullOrderDetails 
                            WHERE TrangThaiDonHang IN (N'DaThanhToan', N'HoanThanh', N'DaGop') 
                            AND ThoiGianDat >= @FromDate AND ThoiGianDat < @ToDateInclusive
                            ORDER BY MaDonHang DESC, TenSP ASC";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<ChiTietDonHangDayDu>(query, new { FromDate = fromDate, ToDateInclusive = toDateInclusive });
            }
        }

        /// <summary>
        /// Lấy chi tiết đầy đủ của một đơn hàng cụ thể.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <returns>Danh sách các đối tượng <see cref="ChiTietDonHangDayDu"/>.</returns>
        public async Task<IEnumerable<ChiTietDonHangDayDu>> GetChiTietDonHang(int maDonHang)
        {
            var query = "SELECT * FROM V_FullOrderDetails WHERE MaDonHang = @MaDonHang";
            using (var connection = _context.CreateConnection())
            {
                var result = await connection.QueryAsync<ChiTietDonHangDayDu>(query, new { MaDonHang = maDonHang });
                return result ?? new List<ChiTietDonHangDayDu>();
            }
        }

        /// <summary>
        /// Lấy danh sách các đơn hàng đã hoàn thành của ngày hôm nay.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="ChiTietDonHangDayDu"/>.</returns>
        public async Task<IEnumerable<ChiTietDonHangDayDu>> GetDonHangHomNay()
        {
            var query = @"SELECT * FROM V_FullOrderDetails 
                            WHERE TrangThaiDonHang NOT IN (N'DaHuy', N'MoiTao', N'DaGop', 'DangPhaChe')
                            AND CONVERT(date, ThoiGianDat) = CONVERT(date, SYSDATETIME())
                            ORDER BY MaDonHang DESC, TenSP ASC";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<ChiTietDonHangDayDu>(query);
            }
        }

        /// <summary>
        /// Lấy thông tin hóa đơn chi tiết cho một đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <returns>Đối tượng <see cref="BillDto"/> chứa thông tin hóa đơn.</returns>
        public async Task<BillDto?> GetBillDetails(int maDonHang)
        {
            var query = @"
                SELECT 
                    DH.Ma AS MaDonHang,
                    DH.ThoiGianDat AS ThoiGianThanhToan,
                    NV.HoTen AS TenNhanVien,
                    KH.HoTen AS TenKhachHang,
                    B.TenBan,
                    DH.LoaiDonHang,
                    PTTT.TenPhuongThuc AS PhuongThucThanhToan,
                    KM.TenKhuyenMai,
                    KM.GiaTriGiamGia,
                    KM.LoaiKhuyenMai,
                    B.LoaiBan
                FROM DONHANG DH
                LEFT JOIN NHANVIEN NV ON DH.MANHANVIEN = NV.MA
                LEFT JOIN KHACHHANG KH ON DH.MAKHACHHANG = KH.MA
                LEFT JOIN BAN B ON DH.MABAN = B.MA
                LEFT JOIN PHUONGTHUCTHANHTOAN PTTT ON DH.MAPHUONGTHUCTHANHTOAN = PTTT.MA
                LEFT JOIN KHUYENMAI KM ON DH.MAKHUYENMAI = KM.MA
                WHERE DH.MA = @MaDonHang;

                SELECT 
                    SP.TENSP,
                    CTDH.SOLUONG,
                    CTDH.GIABAN AS DonGia,
                    (CTDH.SOLUONG * CTDH.GIABAN) AS ThanhTien
                FROM CHITIETDONHANG CTDH
                JOIN SANPHAM SP ON CTDH.MASANPHAM = SP.MA
                WHERE CTDH.MADONHANG = @MaDonHang;
            ";

            using (var connection = _context.CreateConnection())
            using (var multi = await connection.QueryMultipleAsync(query, new { MaDonHang = maDonHang }))
            {
                var billHeader = await multi.ReadSingleOrDefaultAsync<dynamic>();
                if (billHeader == null) return null;

                var billItems = (await multi.ReadAsync<BillItemDto>()).ToList();
                var bill = new BillDto
                {
                    MaDonHang = billHeader.MaDonHang,
                    ThoiGianThanhToan = billHeader.ThoiGianThanhToan,
                    TenNhanVien = billHeader.TenNhanVien ?? "N/A",
                    TenKhachHang = billHeader.TenKhachHang,
                    TenBan = billHeader.TenBan,
                    LoaiDonHang = billHeader.LoaiDonHang,
                    PhuongThucThanhToan = billHeader.PhuongThucThanhToan ?? "N/A",
                    TenKhuyenMai = billHeader.TenKhuyenMai,
                    ChiTiet = billItems
                };
                
                bill.TongTienHang = billItems.Sum(item => item.ThanhTien);
                bill.PhuPhi = (billHeader.LoaiBan == "PhongVIP") ? (bill.TongTienHang * 0.1m) : 0;

                decimal giamGia = 0;
                if (billHeader.GiaTriGiamGia != null && billHeader.LoaiKhuyenMai != null)
                {
                    if (billHeader.LoaiKhuyenMai == "PhanTram")
                        giamGia = (bill.TongTienHang + bill.PhuPhi) * ((decimal)billHeader.GiaTriGiamGia / 100m);
                    else
                        giamGia = (decimal)billHeader.GiaTriGiamGia;
                }
                bill.GiamGia = giamGia;
                
                bill.TongCong = bill.TongTienHang + bill.PhuPhi - bill.GiamGia;
                if (bill.TongCong < 0) bill.TongCong = 0;

                return bill;
            }
        }
        #endregion

        #region Báo Cáo Sản Phẩm & Khuyến Mãi
        /// <summary>
        /// Lấy báo cáo lợi nhuận ước tính trên mỗi sản phẩm.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="LoiNhuanSanPhamDto"/>.</returns>
        public async Task<IEnumerable<LoiNhuanSanPhamDto>> GetLoiNhuanSanPham()
        {
            var query = "SELECT * FROM V_ProductProfitability ORDER BY LoiNhuanGopUocTinhPerUnit DESC";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<LoiNhuanSanPhamDto>(query);
            }
        }

        /// <summary>
        /// Lấy báo cáo hiệu quả của các chương trình khuyến mãi.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="KhuyenMaiHieuQuaDto"/>.</returns>
        public async Task<IEnumerable<KhuyenMaiHieuQuaDto>> GetHieuQuaKhuyenMai()
        {
            var query = @"
                SELECT 
                    km.Ma AS MaKhuyenMai,
                    km.TenKhuyenMai,
                    COUNT(dh.Ma) AS SoDonHangApDung,
                    ISNULL(SUM(dbo.CalculateOrderTotal(dh.Ma)), 0) AS TongDoanhThu
                FROM KHUYENMAI km
                LEFT JOIN DONHANG dh ON km.Ma = dh.MaKhuyenMai
                WHERE dh.Ma IS NOT NULL AND dh.TrangThai NOT IN (N'DaHuy', N'MoiTao', N'DaGop')
                GROUP BY km.Ma, km.TenKhuyenMai
                ORDER BY TongDoanhThu DESC";
            
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<KhuyenMaiHieuQuaDto>(query);
            }
        }

        /// <summary>
        /// Lấy báo cáo hiệu suất sản phẩm (số lượng bán và doanh thu) trong một khoảng thời gian.
        /// </summary>
        /// <param name="fromDate">Ngày bắt đầu.</param>
        /// <param name="toDate">Ngày kết thúc.</param>
        /// <returns>Danh sách các đối tượng <see cref="ProductPerformanceDto"/>.</returns>
        public async Task<IEnumerable<ProductPerformanceDto>> GetProductPerformance(DateTime fromDate, DateTime toDate)
        {
            var procedureName = "GetProductPerformance";
            var parameters = new { FromDate = fromDate, ToDate = toDate.AddDays(1) };
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<ProductPerformanceDto>(procedureName, parameters, commandType: CommandType.StoredProcedure);
            }
        }
        #endregion

        #region Báo Cáo Lương
        /// <summary>
        /// Lấy bảng lương của nhân viên cho một tháng và năm cụ thể.
        /// </summary>
        /// <param name="month">Tháng.</param>
        /// <param name="year">Năm.</param>
        /// <returns>Danh sách các đối tượng <see cref="BangLuongDto"/>.</returns>
        public async Task<IEnumerable<BangLuongDto>> GetBangLuong(int month, int year)
        {
            var procedureName = "GetBangLuong";
            var parameters = new { month, year };

            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<BangLuongDto>(
                    procedureName, 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
            }
        }
        #endregion
    }
}