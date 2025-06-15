using DA_QLCafe.API.Models.Auth;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// Bộ điều khiển xử lý các yêu cầu liên quan đến xác thực, chẳng hạn như đăng nhập người dùng.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        #region Trường Riêng (Private Fields)
        private readonly IAuthService _authService;
        #endregion

        #region Hàm Khởi Tạo (Constructors)
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="AuthController"/>.
        /// </summary>
        /// <param name="authService">Dịch vụ xác thực được tiêm vào.</param>
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        #endregion

        #region Phương Thức Công Khai (Public Methods)

        /// <summary>
        /// Xác thực người dùng dựa trên email và mật khẩu của họ.
        /// </summary>
        /// <param name="request">Yêu cầu đăng nhập chứa email và mật khẩu.</param>
        /// <returns>
        /// Một <see cref="IActionResult"/> đại diện cho kết quả của việc đăng nhập.
        /// Trả về 200 OK với chi tiết thành công nếu đăng nhập thành công,
        /// ngược lại trả về 401 Unauthorized với chi tiết lỗi.
        /// </returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            if (!result.Success)
            {
                return Unauthorized(result);
            }
            return Ok(result);
        }

        #endregion
    }
}