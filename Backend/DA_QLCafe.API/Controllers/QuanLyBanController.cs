using DA_QLCafe.API.Models;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// API để quản lý thông tin bàn và loại bàn trong quán cà phê.
    /// </summary>
    [Authorize(Roles = "QuanLy")]
    [ApiController]
    [Route("api/quanlyban")]
    public class QuanLyBanController : ControllerBase
    {
        #region Fields
        private readonly IQuanLyBanService _service;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của <see cref="QuanLyBanController"/>.
        /// </summary>
        /// <param name="service">Dịch vụ quản lý bàn.</param>
        public QuanLyBanController(IQuanLyBanService service) { _service = service; }
        #endregion

        #region API Loại Bàn
        /// <summary>
        /// Lấy tất cả loại bàn.
        /// </summary>
        [HttpGet("loaiban")]
        public async Task<IActionResult> GetLoaiBans() => Ok(await _service.GetLoaiBans());

        /// <summary>
        /// Thêm loại bàn mới.
        /// </summary>
        [HttpPost("loaiban")]
        public async Task<IActionResult> AddLoaiBan(LoaiBan lb) => (await _service.AddLoaiBan(lb)) ? Ok() : BadRequest();
        
        /// <summary>
        /// Cập nhật thông tin loại bàn.
        /// </summary>
        [HttpPut("loaiban/{ma}")]
        public async Task<IActionResult> UpdateLoaiBan(int ma, LoaiBan lb)
        {
            if (ma != lb.Ma) return BadRequest();
            return (await _service.UpdateLoaiBan(lb)) ? Ok() : NotFound();
        }

        /// <summary>
        /// Xóa loại bàn.
        /// </summary>
        [HttpDelete("loaiban/{ma}")]
        public async Task<IActionResult> DeleteLoaiBan(int ma) => (await _service.DeleteLoaiBan(ma)) ? Ok() : NotFound();
        #endregion

        #region API Bàn
        /// <summary>
        /// Lấy tất cả các bàn.
        /// </summary>
        [HttpGet("ban")]
        public async Task<IActionResult> GetBans() => Ok(await _service.GetBans());

        /// <summary>
        /// Thêm bàn mới.
        /// </summary>
        [HttpPost("ban")]
        public async Task<IActionResult> AddBan(Ban b) => (await _service.AddBan(b)) ? Ok() : BadRequest();

        /// <summary>
        /// Cập nhật thông tin bàn.
        /// </summary>
        [HttpPut("ban/{ma}")]
        public async Task<IActionResult> UpdateBan(int ma, Ban b)
        {
            if (ma != b.Ma) return BadRequest();
            return (await _service.UpdateBan(b)) ? Ok() : NotFound();
        }

        /// <summary>
        /// Xóa bàn.
        /// </summary>
        [HttpDelete("ban/{ma}")]
        public async Task<IActionResult> DeleteBan(int ma) => (await _service.DeleteBan(ma)) ? Ok() : NotFound();
        #endregion
    }
}