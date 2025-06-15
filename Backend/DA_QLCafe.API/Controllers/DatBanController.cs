using DA_QLCafe.API.Models;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// API để quản lý việc đặt bàn.
    /// </summary>
    [Authorize(Roles = "QuanLy,ThuNgan")]
    [ApiController]
    [Route("api/[controller]")]
    public class DatBanController : ControllerBase
    {
        #region Fields
        private readonly IDatBanService _datBanService;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của <see cref="DatBanController"/>.
        /// </summary>
        /// <param name="datBanService">Dịch vụ đặt bàn.</param>
        public DatBanController(IDatBanService datBanService)
        {
            _datBanService = datBanService;
        }
        #endregion

        #region API Endpoints
        /// <summary>
        /// Lấy danh sách các lượt đặt bàn theo ngày.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetDatBans([FromQuery] DateTime ngay)
            => Ok(await _datBanService.GetDatBansTheoNgay(ngay));

        /// <summary>
        /// Tạo một lượt đặt bàn mới.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> TaoDatBan([FromBody] TaoDatBanDto dto)
        {
            try
            {
                var result = await _datBanService.TaoDatBan(dto);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật trạng thái của một lượt đặt bàn.
        /// </summary>
        [HttpPut("{ma}/trangthai")]
        public async Task<IActionResult> UpdateTrangThai(int ma, [FromBody] DatBanUpdateTrangThaiRequest request) // Đã đổi để dùng mô hình mới
        {
            var result = await _datBanService.UpdateTrangThai(ma, request.TrangThai);
            return result ? Ok() : NotFound();
        }

        /// <summary>
        /// Xác nhận khách hàng đã đến và tạo đơn hàng.
        /// </summary>
        [HttpPost("{maDatBan}/confirm-arrival")]
        public async Task<IActionResult> ConfirmArrival(int maDatBan)
        {
            try
            {
                var maNhanVienClaim = User.FindFirst("MaNhanVien");
                if (maNhanVienClaim == null || !int.TryParse(maNhanVienClaim.Value, out var maNhanVien))
                {
                    return Unauthorized("Không thể xác định thông tin nhân viên.");
                }

                var newOrderId = await _datBanService.ConfirmArrival(maDatBan, maNhanVien);
                return Ok(new { NewOrderID = newOrderId });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        #endregion
    }
}