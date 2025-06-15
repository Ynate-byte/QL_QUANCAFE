using DA_QLCafe.API.Models; // Đảm bảo import Models để nhận diện UpdateNhanVienResult
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// API để quản lý nhân sự, bao gồm thông tin nhân viên, ca làm và lịch làm việc.
    /// </summary>
    [Authorize(Roles = "QuanLy")]
    [ApiController]
    [Route("api/[controller]")]
    public class NhanSuController : ControllerBase
    {
        #region Fields
        private readonly INhanSuService _nhanSuService;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của <see cref="NhanSuController"/>.
        /// </summary>
        /// <param name="nhanSuService">Dịch vụ nhân sự.</param>
        public NhanSuController(INhanSuService nhanSuService) { _nhanSuService = nhanSuService; }
        #endregion

        #region API Nhân Viên
        /// <summary>
        /// Lấy tất cả nhân viên.
        /// </summary>
        /// <returns>Danh sách các đối tượng <see cref="NhanVien"/>.</returns>
        [HttpGet("nhanvien")]
        public async Task<IActionResult> GetNhanViens() => Ok(await _nhanSuService.GetNhanViens());

        /// <summary>
        /// Thêm nhân viên mới.
        /// </summary>
        /// <param name="nv">Đối tượng nhân viên cần thêm.</param>
        [HttpPost("nhanvien")]
        public async Task<IActionResult> AddNhanVien(NhanVien nv)
        {
            try
            {
                // Giữ nguyên logic cũ, service trả về bool
                bool success = await _nhanSuService.AddNhanVien(nv); 
                return success ? Ok(new { Message = "Thêm nhân viên thành công!" }) : BadRequest(new { Message = "Thêm nhân viên thất bại." });
            }
            catch(InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { Message = $"Lỗi server: {ex.Message}" });
            }
        }

        /// <summary>
        /// Cập nhật thông tin nhân viên.
        /// </summary>
        /// <param name="ma">Mã nhân viên.</param>
        /// <param name="nv">Đối tượng nhân viên với thông tin cập nhật.</param>
        /// <returns>Kết quả cập nhật nhân viên.</returns>
        [HttpPut("nhanvien/{ma}")]
        public async Task<IActionResult> UpdateNhanVien(int ma, NhanVien nv)
        {
            if (ma != nv.Ma) return BadRequest(new { Message = "Mã nhân viên không khớp." });
            try
            {
                // Gọi service và nhận về đối tượng UpdateNhanVienResult
                var result = await _nhanSuService.UpdateNhanVien(nv);

                // Kiểm tra thuộc tính Success của kết quả
                if (result.Success)
                {
                    // Trả về Ok với message và danh sách ca làm đã xóa (nếu có)
                    return Ok(new { Message = result.Message, DeletedShifts = result.DeletedShiftsInfo });
                }
                else
                {
                    // Nếu không thành công, trả về BadRequest với message từ service
                    return BadRequest(new { Message = result.Message });
                }
            }
            catch(InvalidOperationException ex)
            {
                // Bắt các ngoại lệ nghiệp vụ cụ thể từ service (ví dụ: email/sdt trùng)
                return BadRequest(new { Message = ex.Message });
            }
            catch(Exception ex)
            {
                // Bắt các ngoại lệ hệ thống không mong muốn
                return StatusCode(500, new { Message = $"Lỗi server: {ex.Message}" });
            }
        }

        /// <summary>
        /// Xóa nhân viên.
        /// </summary>
        /// <param name="ma">Mã nhân viên cần xóa.</param>
        [HttpDelete("nhanvien/{ma}")]
        public async Task<IActionResult> DeleteNhanVien(int ma)
        {
            try
            {
                bool success = await _nhanSuService.DeleteNhanVien(ma);
                return success ? Ok(new { Message = "Xóa nhân viên thành công!" }) : NotFound(new { Message = "Không tìm thấy nhân viên để xóa." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Lỗi server: {ex.Message}" });
            }
        }
        #endregion

        #region API Ca Làm & Lịch Làm Việc
        /// <summary>
        /// Lấy tất cả ca làm.
        /// </summary>
        [HttpGet("calam")]
        public async Task<IActionResult> GetCaLams() => Ok(await _nhanSuService.GetCaLams());
        
        /// <summary>
        /// Lấy lịch làm việc theo ngày.
        /// </summary>
        [HttpGet("lichlamviec")]
        public async Task<IActionResult> GetLichLamViec([FromQuery] DateTime ngay)
        {
            return Ok(await _nhanSuService.GetLichLamViecTheoNgay(ngay));
        }

        /// <summary>
        /// Thêm lịch làm việc mới.
        /// </summary>
        [HttpPost("lichlamviec")]
        public async Task<IActionResult> AddLichLamViec([FromBody] LichLamViec lich)
        {
            try
            {
                var success = await _nhanSuService.AddLichLamViec(lich);
                if (success)
                {
                    return Ok(new { Message = "Phân công thành công!" });
                }
                return Conflict(new { Message = "Phân công này đã tồn tại." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Lỗi server: {ex.Message}" });
            }
        }

        /// <summary>
        /// Xóa lịch làm việc.
        /// </summary>
        [HttpDelete("lichlamviec/{ma}")]
        public async Task<IActionResult> DeleteLichLamViec(int ma)
        {
            try
            {
                var success = await _nhanSuService.DeleteLichLamViec(ma);
                if (success)
                {
                    return Ok(new { Message = "Xóa lịch làm việc thành công!" });
                }
                return NotFound(new { Message = "Không tìm thấy lịch làm việc để xóa." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Lỗi server: {ex.Message}" });
            }
        }
        #endregion
    }
}