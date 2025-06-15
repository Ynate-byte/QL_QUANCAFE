using DA_QLCafe.API.Models;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;


namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// API để quản lý Menu của quán cà phê, bao gồm Danh mục sản phẩm và Sản phẩm.
    /// Yêu cầu quyền 'QuanLy'.
    /// </summary>
    [Authorize(Roles = "QuanLy")]
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        #region Fields
        private readonly IMenuService _menuService;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="MenuController"/>.
        /// </summary>
        /// <param name="menuService">Dịch vụ Menu.</param>
        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }
        #endregion

        #region API Danh Mục Sản Phẩm
        /// <summary>
        /// Lấy danh sách tất cả các danh mục sản phẩm.
        /// </summary>
        [HttpGet("danhmuc")]
        public async Task<IActionResult> GetDanhSachDanhMuc()
        {
            var result = await _menuService.GetDanhSachDanhMuc();
            return Ok(result);
        }

        /// <summary>
        /// Thêm một danh mục sản phẩm mới.
        /// </summary>
        [HttpPost("danhmuc")]
        public async Task<IActionResult> ThemDanhMuc([FromBody] DanhMucSanPham danhMuc)
        {
            try
            {
                var result = await _menuService.ThemDanhMuc(danhMuc);
                return result ? Ok() : BadRequest("Thêm danh mục thất bại.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Sửa thông tin một danh mục sản phẩm hiện có.
        /// </summary>
        [HttpPut("danhmuc/{ma}")]
        public async Task<IActionResult> SuaDanhMuc(int ma, [FromBody] DanhMucSanPham danhMuc)
        {
            if (ma != danhMuc.Ma) return BadRequest("Mã danh mục không khớp.");
            var result = await _menuService.SuaDanhMuc(danhMuc);
            return result ? Ok() : NotFound("Không tìm thấy danh mục để sửa.");
        }

        /// <summary>
        /// Xóa một danh mục sản phẩm.
        /// </summary>
        [HttpDelete("danhmuc/{ma}")]
        public async Task<IActionResult> XoaDanhMuc(int ma)
        {
            var result = await _menuService.XoaDanhMuc(ma);
            return result ? Ok() : NotFound("Không tìm thấy danh mục để xóa.");
        }
        #endregion

        #region API Sản Phẩm
        /// <summary>
        /// Lấy danh sách tất cả các sản phẩm.
        /// </summary>
        [HttpGet("sanpham")]
        public async Task<IActionResult> GetDanhSachSanPham()
        {
            var result = await _menuService.GetDanhSachSanPham();
            return Ok(result);
        }

        /// <summary>
        /// Thêm một sản phẩm mới vào menu.
        /// </summary>
        [HttpPost("sanpham")]
        public async Task<IActionResult> ThemSanPham([FromBody] SanPham sanPham)
        {
            try
            {
                var result = await _menuService.ThemSanPham(sanPham);
                return result ? Ok() : BadRequest("Thêm sản phẩm thất bại.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Sửa thông tin một sản phẩm hiện có.
        /// </summary>
        [HttpPut("sanpham/{ma}")]
        public async Task<IActionResult> SuaSanPham(int ma, [FromBody] SanPham sanPham)
        {
            if (ma != sanPham.Ma) return BadRequest("Mã sản phẩm không khớp.");
            var result = await _menuService.SuaSanPham(sanPham);
            return result ? Ok() : NotFound("Không tìm thấy sản phẩm để sửa.");
        }

        /// <summary>
        /// Xóa một sản phẩm khỏi menu.
        /// </summary>
        [HttpDelete("sanpham/{ma}")]
        public async Task<IActionResult> XoaSanPham(int ma)
        {
            var result = await _menuService.XoaSanPham(ma);
            return result ? Ok() : NotFound("Không tìm thấy sản phẩm để xóa.");
        }
        #endregion
    }
}