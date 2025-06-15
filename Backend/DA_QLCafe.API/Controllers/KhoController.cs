using DA_QLCafe.API.Models;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// API để quản lý kho hàng, bao gồm nhà cung cấp, nguyên liệu và phiếu nhập.
    /// </summary>
    [Authorize(Roles = "QuanLy,Kho")]
    [ApiController]
    [Route("api/[controller]")]
    public class KhoController : ControllerBase
    {
        #region Fields
        private readonly IKhoService _khoService;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của <see cref="KhoController"/>.
        /// </summary>
        /// <param name="khoService">Dịch vụ kho hàng.</param>
        public KhoController(IKhoService khoService) { _khoService = khoService; }
        #endregion

        #region API Nhà Cung Cấp
        /// <summary>
        /// Lấy tất cả nhà cung cấp.
        /// </summary>
        [HttpGet("nhacungcap")]
        public async Task<IActionResult> GetNhaCungCaps() => Ok(await _khoService.GetNhaCungCaps());

        /// <summary>
        /// Thêm nhà cung cấp mới.
        /// </summary>
        [HttpPost("nhacungcap")]
        public async Task<IActionResult> AddNhaCungCap(NhaCungCap ncc)
        {
            try
            {
                var result = await _khoService.AddNhaCungCap(ncc);
                return result ? Ok() : BadRequest();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật thông tin nhà cung cấp.
        /// </summary>
        [HttpPut("nhacungcap/{ma}")]
        public async Task<IActionResult> UpdateNhaCungCap(int ma, NhaCungCap ncc)
        {
            if (ma != ncc.Ma) return BadRequest();
            try
            {
                var result = await _khoService.UpdateNhaCungCap(ncc);
                return result ? Ok() : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Xóa nhà cung cấp.
        /// </summary>
        [HttpDelete("nhacungcap/{ma}")]
        public async Task<IActionResult> DeleteNhaCungCap(int ma) => (await _khoService.DeleteNhaCungCap(ma)) ? Ok() : NotFound();
        #endregion

        #region API Nguyên Liệu
        /// <summary>
        /// Lấy tất cả nguyên liệu.
        /// </summary>
        [HttpGet("nguyenlieu")]
        public async Task<IActionResult> GetNguyenLieus() => Ok(await _khoService.GetNguyenLieus());

        /// <summary>
        /// Thêm nguyên liệu mới.
        /// </summary>
        [HttpPost("nguyenlieu")]
        public async Task<IActionResult> AddNguyenLieu(NguyenLieu nl)
        {
            try
            {
                var result = await _khoService.AddNguyenLieu(nl);
                return result ? Ok() : BadRequest();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật thông tin nguyên liệu.
        /// </summary>
        [HttpPut("nguyenlieu/{ma}")]
        public async Task<IActionResult> UpdateNguyenLieu(int ma, NguyenLieu nl)
        {
            if (ma != nl.Ma) return BadRequest();
            try
            {
                var result = await _khoService.UpdateNguyenLieu(nl);
                return result ? Ok() : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Xóa nguyên liệu. Trả về lỗi nếu nguyên liệu đang được sử dụng.
        /// </summary>
        [HttpDelete("nguyenlieu/{ma}")]
        public async Task<IActionResult> DeleteNguyenLieu(int ma)
        {
            try
            {
                var result = await _khoService.DeleteNguyenLieu(ma);
                return result ? Ok() : NotFound("Không tìm thấy nguyên liệu để xóa.");
            }
            catch (InvalidOperationException)
            {
                var conflictingRecipes = await _khoService.GetCongThucSuDungNguyenLieu(ma);
                return Conflict(new
                {
                    Message = "Không thể xóa nguyên liệu vì đang được sử dụng trong các công thức sau:",
                    ConflictingRecipes = conflictingRecipes
                });
            }
            catch (Exception)
            {
                return StatusCode(500, "Đã xảy ra lỗi hệ thống khi xóa nguyên liệu.");
            }
        }
        #endregion

        #region API Phiếu Nhập
        /// <summary>
        /// Lấy lịch sử các phiếu nhập.
        /// </summary>
        [HttpGet("phieunhap")]
        public async Task<IActionResult> GetLichSuPhieuNhap() => Ok(await _khoService.GetLichSuPhieuNhap());

        /// <summary>
        /// Tạo phiếu nhập mới.
        /// </summary>
        [HttpPost("phieunhap")]
        public async Task<IActionResult> TaoPhieuNhap([FromBody] TaoPhieuNhapDto phieuNhapDto)
        {
            if (phieuNhapDto.ChiTietPhieuNhap == null || !phieuNhapDto.ChiTietPhieuNhap.Any())
            {
                return BadRequest("Chi tiết phiếu nhập không được để trống.");
            }
            try
            {
                var newId = await _khoService.TaoPhieuNhap(phieuNhapDto);
                return Ok(new { MaPhieuNhap = newId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy chi tiết của một phiếu nhập.
        /// </summary>
        [HttpGet("phieunhap/{maPhieuNhap}/chitiet")]
        public async Task<IActionResult> GetChiTietPhieuNhap(int maPhieuNhap)
        {
            var chiTiet = await _khoService.GetChiTietPhieuNhap(maPhieuNhap);
            if (chiTiet == null || !chiTiet.Any())
            {
                return NotFound($"Không tìm thấy chi tiết cho phiếu nhập có mã {maPhieuNhap}.");
            }
            return Ok(chiTiet);
        }
        #endregion
    }
}