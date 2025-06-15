using DA_QLCafe.API.Models;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System; // <-- Đã thêm

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// API để quản lý các chương trình khuyến mãi.
    /// </summary>
    [Authorize(Roles = "QuanLy")]
    [ApiController]
    [Route("api/[controller]")]
    public class KhuyenMaiController : ControllerBase
    {
        #region Fields
        private readonly IKhuyenMaiService _khuyenMaiService;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của <see cref="KhuyenMaiController"/>.
        /// </summary>
        /// <param name="khuyenMaiService">Dịch vụ khuyến mãi.</param>
        public KhuyenMaiController(IKhuyenMaiService khuyenMaiService) { _khuyenMaiService = khuyenMaiService; }
        #endregion

        #region API Endpoints
        /// <summary>
        /// Lấy tất cả các chương trình khuyến mãi.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetKhuyenMais() => Ok(await _khuyenMaiService.GetKhuyenMais());

        /// <summary>
        /// Thêm một chương trình khuyến mãi mới.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> AddKhuyenMai(KhuyenMai km)
        {
            try
            {
                var result = await _khuyenMaiService.AddKhuyenMai(km);
                return result ? Ok() : BadRequest("Thêm khuyến mãi thất bại.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật thông tin một chương trình khuyến mãi.
        /// </summary>
        [HttpPut("{ma}")]
        public async Task<IActionResult> UpdateKhuyenMai(int ma, KhuyenMai km)
        {
            if (ma != km.Ma) return BadRequest();
            return (await _khuyenMaiService.UpdateKhuyenMai(km)) ? Ok() : NotFound();
        }

        /// <summary>
        /// Xóa một chương trình khuyến mãi.
        /// </summary>
        [HttpDelete("{ma}")]
        public async Task<IActionResult> DeleteKhuyenMai(int ma) => (await _khuyenMaiService.DeleteKhuyenMai(ma)) ? Ok() : NotFound();
        #endregion
    }
}