using DA_QLCafe.API.Models;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// Bộ điều khiển xử lý các yêu cầu liên quan đến quản lý công thức sản phẩm.
    /// Yêu cầu quyền 'QuanLy' hoặc 'PhaChe'.
    /// </summary>
    [Authorize(Roles = "QuanLy,PhaChe")]
    [ApiController]
    [Route("api/[controller]")]
    public class CongThucController : ControllerBase
    {
        #region Fields
        private readonly ICongThucService _congThucService;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="CongThucController"/>.
        /// </summary>
        /// <param name="congThucService">Dịch vụ công thức được tiêm vào.</param>
        public CongThucController(ICongThucService congThucService)
        {
            _congThucService = congThucService;
        }
        #endregion

        #region API Endpoints
        /// <summary>
        /// Lấy công thức của một sản phẩm cụ thể.
        /// </summary>
        /// <param name="maSanPham">Mã sản phẩm.</param>
        /// <returns>Thông tin công thức nếu tìm thấy, ngược lại là 404 Not Found.</returns>
        [HttpGet("{maSanPham}")]
        public async Task<IActionResult> GetCongThuc(int maSanPham)
        {
            var result = await _congThucService.GetCongThucBySanPham(maSanPham);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Lưu (tạo mới hoặc cập nhật) một công thức.
        /// </summary>
        /// <param name="dto">Dữ liệu công thức cần lưu.</param>
        /// <returns>Mã công thức mới được tạo hoặc lỗi nếu có.</returns>
        [HttpPost]
        public async Task<IActionResult> LuuCongThuc([FromBody] TaoCongThucDto dto)
        {
            try
            {
                var newId = await _congThucService.LuuCongThuc(dto);
                return Ok(new { MaCongThuc = newId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion
    }
}