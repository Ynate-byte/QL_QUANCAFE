using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ xử lý các nghiệp vụ liên quan đến bán hàng.
    /// </summary>
    public class BanHangService : IBanHangService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="BanHangService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public BanHangService(DbContext context)
        {
            _context = context;
        }
        #endregion

        #region Lấy Dữ Liệu Ban Đầu
        /// <summary>
        /// Lấy danh sách bàn được phân loại theo loại bàn.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="LoaiBanVoiBanDto"/>.</returns>
        public async Task<IEnumerable<LoaiBanVoiBanDto>> GetBanTheoLoai()
        {
            var queryLoaiBan = "SELECT Ma, TenLoaiBan FROM LOAIBAN ORDER BY TenLoaiBan";
            var queryBan = "SELECT Ma, TenBan, SucChua, TrangThai, LoaiBan, MaLoaiBan FROM BAN ORDER BY TenBan";

            using (var connection = _context.CreateConnection())
            {
                var loaiBans = await connection.QueryAsync<LoaiBan>(queryLoaiBan);
                var allBans = await connection.QueryAsync<Ban>(queryBan);

                var result = loaiBans.Select(lb => new LoaiBanVoiBanDto
                {
                    MaLoaiBan = lb.Ma,
                    TenLoaiBan = lb.TenLoaiBan,
                    DanhSachBan = allBans.Where(b => b.MaLoaiBan == lb.Ma).ToList()
                }).ToList();
                
                return result;
            }
        }
        
        /// <summary>
        /// Lấy danh sách sản phẩm được phân loại theo danh mục.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="DanhMucVoiSanPhamDto"/>.</returns>
        public async Task<IEnumerable<DanhMucVoiSanPhamDto>> GetSanPhamTheoDanhMuc()
        {
            var query = @"
                SELECT dm.MA AS MaDanhMuc, dm.TENDANHMUC AS TenDanhMuc FROM DANHMUCSANPHAM dm ORDER BY dm.MA;
                SELECT sp.MA, sp.TENSP, sp.MOTA, sp.GIA, sp.MADANHMUC, sp.HINHANHSP, sp.SoLuongTaoRa, sp.SoLuongTon,
                       CASE WHEN dbo.CheckStockAvailability(sp.MA, 1) = 1 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsAvailable
                FROM SANPHAM sp ORDER BY sp.MADANHMUC, sp.TENSP;";

            using (var connection = _context.CreateConnection())
            using (var multi = await connection.QueryMultipleAsync(query))
            {
                var danhMucList = (await multi.ReadAsync<DanhMucVoiSanPhamDto>()).ToList();
                var sanPhamList = (await multi.ReadAsync<SanPham>()).ToList();

                foreach (var dm in danhMucList)
                {
                    dm.DanhSachSanPham = sanPhamList.Where(sp => sp.MaDanhMuc == dm.MaDanhMuc).ToList();
                }
                return danhMucList;
            }
        }
        
        /// <summary>
        /// Lấy danh sách các chương trình khuyến mãi đang diễn ra.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="KhuyenMai"/>.</returns>
        public async Task<IEnumerable<KhuyenMai>> GetKhuyenMais()
        {
            var query = "SELECT * FROM KHUYENMAI WHERE TRANGTHAI = N'DangDienRa' AND GETDATE() BETWEEN NGAYBATDAU AND NGAYKETTHUC";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<KhuyenMai>(query);
            }
        }

        /// <summary>
        /// Lấy danh sách các phương thức thanh toán.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="PhuongThucThanhToan"/>.</returns>
        public async Task<IEnumerable<PhuongThucThanhToan>> GetPhuongThucThanhToans()
        {
            var query = "SELECT * FROM PHUONGTHUCTHANHTOAN";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<PhuongThucThanhToan>(query);
            }
        }

        /// <summary>
        /// Kiểm tra số lượng tồn kho của một sản phẩm.
        /// </summary>
        /// <param name="maSanPham">Mã sản phẩm.</param>
        /// <param name="soLuong">Số lượng cần kiểm tra.</param>
        /// <returns>True nếu có sẵn, ngược lại là False.</returns>
        public async Task<bool> CheckStock(int maSanPham, int soLuong)
        {
            var query = "SELECT dbo.CheckStockAvailability(@MaSanPham, @SoLuong)";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleAsync<bool>(query, new { MaSanPham = maSanPham, SoLuong = soLuong });
            }
        }
        #endregion
        
        #region Quản Lý Đơn Hàng
        /// <summary>
        /// Lấy chi tiết hóa đơn (bill) cho một đơn hàng cụ thể.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <returns>Đối tượng <see cref="BillDto"/> chứa chi tiết hóa đơn.</returns>
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
                    B.LoaiBan,
                    DH.DiemSuDung
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

                decimal giamGiaKhuyenMai = 0;
                if (billHeader.GiaTriGiamGia != null && billHeader.LoaiKhuyenMai != null)
                {
                    if (billHeader.LoaiKhuyenMai == "PhanTram")
                        giamGiaKhuyenMai = (bill.TongTienHang + bill.PhuPhi) * ((decimal)billHeader.GiaTriGiamGia / 100m);
                    else
                        giamGiaKhuyenMai = (decimal)billHeader.GiaTriGiamGia;
                }
                
                decimal giamGiaTuDiem = (billHeader.DiemSuDung ?? 0) * 100m; 
                
                bill.GiamGia = giamGiaKhuyenMai + giamGiaTuDiem;
                
                bill.TongCong = bill.TongTienHang + bill.PhuPhi - bill.GiamGia;
                if (bill.TongCong < 0) bill.TongCong = 0;

                return bill;
            }
        }

        /// <summary>
        /// Tạo một đơn hàng mới.
        /// </summary>
        /// <param name="donHangDto">Dữ liệu đơn hàng cần tạo.</param>
        /// <returns>ID của đơn hàng mới được tạo.</returns>
        public async Task<int> TaoDonHang(TaoDonHangDto donHangDto)
        {
            var procedureName = "AddOrderWithDetails";
            var jsonChiTiet = JsonSerializer.Serialize(donHangDto.ChiTietDonHang.Select(d => new { d.MaSanPham, d.SoLuong }));

            var parameters = new DynamicParameters();
            parameters.Add("MaNhanVien", donHangDto.MaNhanVien, DbType.Int32);
            parameters.Add("MaKhachHang", donHangDto.MaKhachHang, DbType.Int32);
            parameters.Add("LoaiDonHang", donHangDto.LoaiDonHang, DbType.String);
            parameters.Add("GhiChuDonHang", donHangDto.GhiChuDonHang, DbType.String);
            parameters.Add("MaPhuongThucThanhToan", donHangDto.MaPhuongThucThanhToan, DbType.Int32);
            parameters.Add("MaKhuyenMai", donHangDto.MaKhuyenMai, DbType.Int32);
            parameters.Add("MaBan", donHangDto.MaBan, DbType.Int32);
            parameters.Add("JsonOrderDetails", jsonChiTiet, DbType.String);

            using (var connection = _context.CreateConnection())
            {
                try
                {
                    var result = await connection.QuerySingleAsync<dynamic>(procedureName, parameters, commandType: CommandType.StoredProcedure);
                    return (int)result.NewOrderID;
                }
                catch (SqlException ex)
                {
                    // Ném ngoại lệ với thông báo lỗi rõ ràng nếu có vấn đề về tồn kho
                    throw new InvalidOperationException($"Sản phẩm '{ex.Message}' không đủ hàng trong kho.");
                }
            }
        }

        /// <summary>
        /// Lấy đơn hàng hiện tại đang được thực hiện của một bàn.
        /// </summary>
        /// <param name="maBan">Mã bàn.</param>
        /// <returns>Đơn hàng đang thực hiện, hoặc null nếu không có.</returns>
        public async Task<DonHang?> GetDonHangDangThucHienCuaBan(int maBan)
        {
            var query = "SELECT * FROM DONHANG WHERE MaBan = @MaBan AND TrangThai IN (N'MoiTao', N'DangPhaChe') ORDER BY ThoiGianDat DESC";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryFirstOrDefaultAsync<DonHang>(query, new { maBan });
            }
        }

        /// <summary>
        /// Lấy chi tiết của một đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <returns>Danh sách chi tiết đơn hàng.</returns>
        public async Task<IEnumerable<ChiTietDonHangDto>> GetChiTietDonHang(int maDonHang)
        {
            var query = "SELECT MaSanPham, SoLuong, GiaBan FROM CHITIETDONHANG WHERE MaDonHang = @MaDonHang";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<ChiTietDonHangDto>(query, new { maDonHang });
            }
        }

        /// <summary>
        /// Thêm nhiều sản phẩm vào một đơn hàng đã có.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="chiTietDtos">Danh sách các chi tiết đơn hàng cần thêm.</param>
        /// <returns>True nếu thành công, False nếu thất bại.</returns>
        public async Task<bool> ThemNhieuSanPhamVaoDonHang(int maDonHang, List<ChiTietDonHangDto> chiTietDtos)
        {
            var procedureName = "AddMultipleOrderDetails";
            var jsonChiTiet = JsonSerializer.Serialize(chiTietDtos.Select(d => new { d.MaSanPham, d.SoLuong }));

            var parameters = new DynamicParameters();
            parameters.Add("MaDonHang", maDonHang, DbType.Int32);
            parameters.Add("JsonOrderDetails", jsonChiTiet, DbType.String);

            using (var connection = _context.CreateConnection())
            {
                try
                {
                    await connection.ExecuteAsync(procedureName, parameters, commandType: CommandType.StoredProcedure);
                    return true;
                }
                catch (SqlException ex)
                {
                    // Ném lại ngoại lệ với thông báo rõ ràng hơn
                    throw new InvalidOperationException(ex.Message);
                }
            }
        }

        /// <summary>
        /// Cập nhật số lượng của một sản phẩm trong đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="maSanPham">Mã sản phẩm.</param>
        /// <param name="soLuongMoi">Số lượng mới.</param>
        /// <returns>True nếu thành công, False nếu thất bại.</returns>
        public async Task<bool> CapNhatSoLuongSanPham(int maDonHang, int maSanPham, int soLuongMoi)
        {
            var query = "UPDATE CHITIETDONHANG SET SoLuong = @SoLuongMoi WHERE MaDonHang = @MaDonHang AND MaSanPham = @MaSanPham";
            using (var connection = _context.CreateConnection())
            {
                return await connection.ExecuteAsync(query, new { SoLuongMoi = soLuongMoi, MaDonHang = maDonHang, MaSanPham = maSanPham }) > 0;
            }
        }

        /// <summary>
        /// Xóa một sản phẩm khỏi đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="maSanPham">Mã sản phẩm.</param>
        /// <returns>True nếu thành công, False nếu thất bại.</returns>
        public async Task<bool> XoaSanPhamKhoiDonHang(int maDonHang, int maSanPham)
        {
            var query = "DELETE FROM CHITIETDONHANG WHERE MaDonHang = @MaDonHang AND MaSanPham = @MaSanPham";
            using (var connection = _context.CreateConnection())
            {
                return await connection.ExecuteAsync(query, new { MaDonHang = maDonHang, MaSanPham = maSanPham }) > 0;
            }
        }
        
        /// <summary>
        /// Cập nhật trạng thái của đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="trangThaiMoi">Trạng thái mới.</param>
        /// <returns>True nếu thành công, False nếu thất bại.</returns>
        public async Task<bool> CapNhatTrangThaiDonHang(int maDonHang, string trangThaiMoi)
        {
            var query = "UPDATE DONHANG SET TrangThai = @TrangThaiMoi WHERE Ma = @MaDonHang";
            using (var connection = _context.CreateConnection())
            {
                return await connection.ExecuteAsync(query, new { maDonHang, trangThaiMoi }) > 0;
            }
        }
        
        /// <summary>
        /// Cập nhật khách hàng cho một đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="maKhachHang">Mã khách hàng mới (hoặc null).</param>
        /// <returns>True nếu thành công, False nếu thất bại.</returns>
        public async Task<bool> CapNhatKhachHangChoDon(int maDonHang, int? maKhachHang)
        {
            var query = "UPDATE DONHANG SET MaKhachHang = @MaKhachHang WHERE Ma = @MaDonHang";
            using (var connection = _context.CreateConnection())
            {
                return await connection.ExecuteAsync(query, new { MaDonHang = maDonHang, MaKhachHang = maKhachHang }) > 0;
            }
        }
        #endregion

        #region Gộp và Thanh Toán
        /// <summary>
        /// Gộp nhiều đơn hàng thành một đơn hàng mới.
        /// </summary>
        /// <param name="donHangIds">Danh sách các ID đơn hàng cần gộp.</param>
        /// <param name="maNhanVien">Mã nhân viên thực hiện gộp.</param>
        /// <returns>ID của đơn hàng mới sau khi gộp.</returns>
        public async Task<int> GopDonHang(List<int> donHangIds, int maNhanVien)
        {
            var procedureName = "GopDonHang";
            var jsonDonHangIDs = JsonSerializer.Serialize(donHangIds);
            var parameters = new { JsonDonHangIDs = jsonDonHangIDs, MaNhanVien = maNhanVien };

            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleAsync<int>(procedureName, parameters, commandType: CommandType.StoredProcedure);
            }
        }

        /// <summary>
        /// Hoàn tất quá trình thanh toán cho một đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="maPhuongThucThanhToan">Mã phương thức thanh toán.</param>
        /// <param name="maKhuyenMai">Mã khuyến mãi (nếu có).</param>
        /// <param name="diemSuDung">Số điểm thành viên đã sử dụng.</param>
        /// <returns>True nếu thanh toán thành công, False nếu thất bại.</returns>
        public async Task<bool> HoanThanhThanhToan(int maDonHang, int maPhuongThucThanhToan, int? maKhuyenMai, int? diemSuDung)
        {
            var procedureName = "FinalizePayment";
            var parameters = new DynamicParameters();
            parameters.Add("MaDonHang", maDonHang, DbType.Int32);
            parameters.Add("MaPhuongThucThanhToan", maPhuongThucThanhToan, DbType.Int32);
            parameters.Add("MaKhuyenMai", maKhuyenMai, DbType.Int32);
            parameters.Add("DiemSuDung", diemSuDung ?? 0, DbType.Int32); // Sử dụng 0 nếu null
            
            using (var connection = _context.CreateConnection())
            {
                var result = await connection.ExecuteAsync(procedureName, parameters, commandType: CommandType.StoredProcedure);
                return result > 0;
            }
        }

        /// <summary>
        /// Gộp nhiều đơn hàng và sau đó thanh toán đơn hàng cuối cùng.
        /// </summary>
        /// <param name="donHangIds">Danh sách các ID đơn hàng cần gộp.</param>
        /// <param name="maNhanVien">Mã nhân viên thực hiện.</param>
        /// <param name="maKhachHang">Mã khách hàng (nếu có).</param>
        /// <returns>ID của đơn hàng cuối cùng sau khi gộp.</returns>
        public async Task<int> GopVaThanhToanDonHang(List<int> donHangIds, int maNhanVien, int? maKhachHang)
        {
            var procedureName = "GopVaThanhToanDonHang"; // Stored Procedure này cần được cập nhật
            var jsonDonHangIDs = JsonSerializer.Serialize(donHangIds);
            
            var parameters = new DynamicParameters();
            parameters.Add("JsonDonHangIDs", jsonDonHangIDs, DbType.String);
            parameters.Add("MaNhanVien", maNhanVien, DbType.Int32);
            parameters.Add("MaKhachHang", maKhachHang, DbType.Int32);

            using (var connection = _context.CreateConnection())
            {
                // SP này giờ sẽ chỉ trả về mã của đơn hàng đã gộp
                return await connection.QuerySingleAsync<int>(procedureName, parameters, commandType: CommandType.StoredProcedure);
            }
        }
        #endregion
    }
}