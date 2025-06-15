using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using DA_QLCafe.API.Models.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ xử lý logic xác thực người dùng.
    /// </summary>
    public class AuthService : IAuthService
    {
        #region Fields
        private readonly DbContext _context;
        private readonly IConfiguration _configuration;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="AuthService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        /// <param name="configuration">Đối tượng cấu hình ứng dụng.</param>
        public AuthService(DbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        #endregion

        #region Public Methods
        /// <summary>
        /// Thực hiện xác thực đăng nhập người dùng.
        /// </summary>
        /// <param name="request">Yêu cầu đăng nhập bao gồm Email và Mật khẩu.</param>
        /// <returns>Đối tượng <see cref="LoginResponse"/> chứa kết quả đăng nhập.</returns>
        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var query = "SELECT * FROM NHANVIEN WHERE Email = @Email";
            using (var connection = _context.CreateConnection())
            {
                var user = await connection.QuerySingleOrDefaultAsync<NhanVien>(query, new { request.Email });

                // 1. Kiểm tra Email và Mật khẩu
                if (user == null || string.IsNullOrEmpty(user.MatKhau) || !BCrypt.Net.BCrypt.Verify(request.MatKhau, user.MatKhau))
                {
                    return new LoginResponse { Success = false, Message = "Email hoặc mật khẩu không chính xác." };
                }

                // 2. Kiểm tra trạng thái tài khoản
                if (user.TrangThaiTaiKhoan != "HoatDong")
                {
                    return new LoginResponse { Success = false, Message = "Tài khoản này đã bị vô hiệu hóa." };
                }

                // 3. Nếu mọi thứ hợp lệ, tạo token
                var token = GenerateJwtToken(user);

                return new LoginResponse
                {
                    Success = true,
                    Message = "Đăng nhập thành công!",
                    Token = token,
                    MaNhanVien = user.Ma,
                    HoTen = user.HoTen,
                    VaiTro = user.VaiTro
                };
            }
        }
        #endregion

        #region Private Methods
        /// <summary>
        /// Tạo chuỗi JWT (JSON Web Token) cho người dùng đã xác thực.
        /// </summary>
        /// <param name="user">Đối tượng <see cref="NhanVien"/> của người dùng.</param>
        /// <returns>Chuỗi JWT đã được tạo.</returns>
        private string GenerateJwtToken(NhanVien user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
            var credentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Ma.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Name, user.HoTen),
                new Claim(ClaimTypes.Role, user.VaiTro),
                new Claim("MaNhanVien", user.Ma.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8), // Token hết hạn sau 8 giờ
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        #endregion
    }
}