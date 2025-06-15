using DA_QLCafe.API.Models;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// API để quản lý phản hồi và góp ý từ khách hàng.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PhanHoiController : ControllerBase
    {
        #region Fields
        private readonly IPhanHoiService _phanHoiService;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của <see cref="PhanHoiController"/>.
        /// </summary>
        /// <param name="phanHoiService">Dịch vụ phản hồi.</param>
        public PhanHoiController(IPhanHoiService phanHoiService) { _phanHoiService = phanHoiService; }
        #endregion

        #region Public DTOs
        /// <summary>
        /// DTO dùng để cập nhật trạng thái phản hồi.
        /// </summary>
        public class UpdateStatusRequest
        {
            public string TrangThai { get; set; } = string.Empty;
            public int MaNhanVien { get; set; }
        }
        #endregion

        #region API Gửi Phản Hồi (Allow Anonymous)
        /// <summary>
        /// Gửi phản hồi mới từ khách hàng (không yêu cầu đăng nhập).
        /// </summary>
        [AllowAnonymous]
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitFeedback([FromBody] PhanHoiRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NoiDung) || string.IsNullOrWhiteSpace(dto.LoaiPhanHoi))
            {
                return BadRequest("Loại phản hồi và nội dung không được để trống.");
            }
            
            try
            {
                var result = await _phanHoiService.AddNewFeedback(dto);
                if (result)
                {
                    return Ok(new { message = "Cảm ơn bạn đã gửi phản hồi!" });
                }
                return StatusCode(500, "Không thể lưu phản hồi vào cơ sở dữ liệu.");
            }
            catch(Exception ex)
            {
                return StatusCode(500, $"Lỗi server nội bộ: {ex.Message}");
            }
        }
        #endregion

        #region API Quản Lý Phản Hồi (Yêu Cầu Quyền Quản Lý)
        /// <summary>
        /// Lấy danh sách phản hồi (có thể lọc theo từ khóa, trạng thái, loại).
        /// </summary>
        [Authorize(Roles = "QuanLy")]
        [HttpGet]
        public async Task<IActionResult> GetPhanHois(
            [FromQuery] string? tuKhoa, 
            [FromQuery] string? trangThai, 
            [FromQuery] string? loai)
        {
            try
            {
                var phanHois = await _phanHoiService.GetPhanHois(tuKhoa, trangThai, loai);
                return Ok(phanHois);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        /// <summary>
        /// Cập nhật trạng thái của một phản hồi.
        /// </summary>
        [Authorize(Roles = "QuanLy")]
        [HttpPut("{ma}")]
        public async Task<IActionResult> UpdateStatus(int ma, [FromBody] UpdateStatusRequest request)
        {
            var result = await _phanHoiService.UpdatePhanHoiStatus(ma, request.TrangThai, request.MaNhanVien);
            return result ? Ok() : NotFound();
        }
        #endregion
    }
}