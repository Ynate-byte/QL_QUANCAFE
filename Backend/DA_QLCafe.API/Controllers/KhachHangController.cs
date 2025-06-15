using DA_QLCafe.API.Models;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// API để quản lý thông tin khách hàng.
    /// </summary>
    [Authorize(Roles = "QuanLy,ThuNgan")]
    [ApiController]
    [Route("api/[controller]")]
    public class KhachHangController : ControllerBase
    {
        #region Fields
        private readonly IKhachHangService _khachHangService;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của <see cref="KhachHangController"/>.
        /// </summary>
        /// <param name="khachHangService">Dịch vụ khách hàng.</param>
        public KhachHangController(IKhachHangService khachHangService)
        {
            _khachHangService = khachHangService;
        }
        #endregion

        #region API Quản Lý Khách Hàng
        /// <summary>
        /// Lấy tất cả khách hàng.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetKhachHangs() => Ok(await _khachHangService.GetKhachHangs());

        /// <summary>
        /// Thêm khách hàng mới.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> AddKhachHang([FromBody] KhachHang kh)
        {
            try
            {
                var result = await _khachHangService.AddKhachHang(kh);
                return result ? Ok() : BadRequest();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật thông tin khách hàng.
        /// </summary>
        [HttpPut("{ma}")]
        public async Task<IActionResult> UpdateKhachHang(int ma, [FromBody] KhachHang kh)
        {
            if (ma != kh.Ma) return BadRequest();
            try
            {
                var result = await _khachHangService.UpdateKhachHang(kh);
                return result ? Ok() : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Xóa khách hàng.
        /// </summary>
        [HttpDelete("{ma}")]
        public async Task<IActionResult> DeleteKhachHang(int ma)
            => (await _khachHangService.DeleteKhachHang(ma)) ? Ok() : NotFound();

        /// <summary>
        /// Tìm kiếm khách hàng theo từ khóa (tên hoặc số điện thoại).
        /// </summary>
        [HttpGet("timkiem")]
        public async Task<IActionResult> TimKiemKhachHang([FromQuery] string tuKhoa)
        {
            if (string.IsNullOrWhiteSpace(tuKhoa))
            {
                return Ok(new List<object>());
            }
            try
            {
                var ketQua = await _khachHangService.TimKiemKhachHang(tuKhoa);
                return Ok(ketQua);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi nội bộ server: {ex.Message}");
            }
        }
        #endregion

        #region API Tra Cứu (Không Yêu Cầu Đăng Nhập)
        /// <summary>
        /// Tra cứu điểm thành viên bằng số điện thoại.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("tracuu")]
        public async Task<IActionResult> TraCuuDiem([FromQuery] string sdt)
        {
            var result = await _khachHangService.TraCuuKhachHang(sdt);
            if (result == null)
            {
                return NotFound("Không tìm thấy khách hàng với số điện thoại này.");
            }
            return Ok(result);
        }
        #endregion
    }
}