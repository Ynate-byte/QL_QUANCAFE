using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using Microsoft.Data.SqlClient;
using System;
using System.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ xử lý logic liên quan đến quản lý danh mục sản phẩm và sản phẩm trong menu.
    /// </summary>
    public class MenuService : IMenuService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="MenuService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public MenuService(DbContext context)
        {
            _context = context;
        }
        #endregion

        #region API Danh Mục Sản Phẩm
        /// <summary>
        /// Lấy danh sách tất cả các danh mục sản phẩm.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="DanhMucSanPham"/>.</returns>
        public async Task<IEnumerable<DanhMucSanPham>> GetDanhSachDanhMuc()
        {
            var query = "SELECT * FROM DANHMUCSANPHAM";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<DanhMucSanPham>(query);
            }
        }

        /// <summary>
        /// Thêm một danh mục sản phẩm mới.
        /// </summary>
        /// <param name="danhMuc">Đối tượng danh mục sản phẩm cần thêm.</param>
        /// <returns>True nếu thêm thành công, False nếu thất bại. Ném <see cref="InvalidOperationException"/> nếu tên danh mục đã tồn tại.</returns>
        public async Task<bool> ThemDanhMuc(DanhMucSanPham danhMuc)
        {
            var query = "INSERT INTO DANHMUCSANPHAM (TenDanhMuc) VALUES (@TenDanhMuc)";
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    var result = await connection.ExecuteAsync(query, new { danhMuc.TenDanhMuc });
                    return result > 0;
                }
                catch (SqlException ex) when (ex.Number == 2627) // Lỗi trùng khóa UNIQUE KEY
                {
                    throw new InvalidOperationException("Tên danh mục này đã tồn tại.");
                }
            }
        }

        /// <summary>
        /// Sửa thông tin một danh mục sản phẩm hiện có.
        /// </summary>
        /// <param name="danhMuc">Đối tượng danh mục sản phẩm với thông tin cập nhật.</param>
        /// <returns>True nếu sửa thành công, False nếu không tìm thấy danh mục.</returns>
        public async Task<bool> SuaDanhMuc(DanhMucSanPham danhMuc)
        {
            var query = "UPDATE DANHMUCSANPHAM SET TenDanhMuc = @TenDanhMuc WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                var result = await connection.ExecuteAsync(query, danhMuc);
                return result > 0;
            }
        }

        /// <summary>
        /// Xóa một danh mục sản phẩm.
        /// </summary>
        /// <param name="maDanhMuc">Mã danh mục sản phẩm cần xóa.</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy danh mục.</returns>
        public async Task<bool> XoaDanhMuc(int maDanhMuc)
        {
            var query = "DELETE FROM DANHMUCSANPHAM WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                var result = await connection.ExecuteAsync(query, new { Ma = maDanhMuc });
                return result > 0;
            }
        }
        #endregion

        #region API Sản Phẩm
        /// <summary>
        /// Lấy danh sách tất cả các sản phẩm.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="SanPham"/>.</returns>
        public async Task<IEnumerable<SanPham>> GetDanhSachSanPham()
        {
            var query = "SELECT * FROM SANPHAM";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<SanPham>(query);
            }
        }

        /// <summary>
        /// Thêm một sản phẩm mới vào menu.
        /// </summary>
        /// <param name="sanPham">Đối tượng sản phẩm cần thêm.</param>
        /// <returns>True nếu thêm thành công, False nếu thất bại. Ném <see cref="InvalidOperationException"/> nếu tên sản phẩm đã tồn tại.</returns>
        public async Task<bool> ThemSanPham(SanPham sanPham)
        {
            var query = @"
                INSERT INTO SANPHAM (TenSP, MoTa, Gia, MaDanhMuc, HinhAnhSP, SoLuongTaoRa, SoLuongTon) 
                VALUES (@TenSP, @MoTa, @Gia, @MaDanhMuc, @HinhAnhSP, @SoLuongTaoRa, @SoLuongTon)";
            using (var connection = _context.CreateConnection())
            {
                try
                {
                    var result = await connection.ExecuteAsync(query, sanPham);
                    return result > 0;
                }
                catch (SqlException ex) when (ex.Number == 2627) // Lỗi trùng khóa UNIQUE KEY
                {
                    throw new InvalidOperationException("Tên sản phẩm này đã tồn tại.");
                }
            }
        }

        /// <summary>
        /// Sửa thông tin một sản phẩm hiện có.
        /// </summary>
        /// <param name="sanPham">Đối tượng sản phẩm với thông tin cập nhật.</param>
        /// <returns>True nếu sửa thành công, False nếu không tìm thấy sản phẩm.</returns>
        public async Task<bool> SuaSanPham(SanPham sanPham)
        {
            var query = @"
                UPDATE SANPHAM 
                SET TenSP = @TenSP, MoTa = @MoTa, Gia = @Gia, MaDanhMuc = @MaDanhMuc, HinhAnhSP = @HinhAnhSP, SoLuongTaoRa = @SoLuongTaoRa, SoLuongTon = @SoLuongTon
                WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                var result = await connection.ExecuteAsync(query, sanPham);
                return result > 0;
            }
        }

        /// <summary>
        /// Xóa một sản phẩm khỏi menu.
        /// </summary>
        /// <param name="maSanPham">Mã sản phẩm cần xóa.</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy sản phẩm.</returns>
        public async Task<bool> XoaSanPham(int maSanPham)
        {
            var query = "DELETE FROM SANPHAM WHERE Ma = @Ma";
            using (var connection = _context.CreateConnection())
            {
                var result = await connection.ExecuteAsync(query, new { Ma = maSanPham });
                return result > 0;
            }
        }
        #endregion
    }
}