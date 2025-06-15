using DA_QLCafe.API.Data;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

#region Builder Initialization
var builder = WebApplication.CreateBuilder(args);
#endregion

#region Constants
const string DevCorsPolicy = "DevCorsPolicy";
#endregion

#region Service Registrations
/// <summary>
/// Đăng ký các dịch vụ vào container dependency injection.
/// </summary>
builder.Services.AddSingleton<DbContext>(); // Đăng ký DbContext là singleton
builder.Services.AddScoped<IBanHangService, BanHangService>();
builder.Services.AddScoped<IKhachHangService, KhachHangService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IKhoService, KhoService>();
builder.Services.AddScoped<ICongThucService, CongThucService>();
builder.Services.AddScoped<IBaoCaoService, BaoCaoService>();
builder.Services.AddScoped<INhanSuService, NhanSuService>();
builder.Services.AddScoped<IKhuyenMaiService, KhuyenMaiService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IPhanHoiService, PhanHoiService>();
builder.Services.AddScoped<IDatBanService, DatBanService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IQuanLyBanService, QuanLyBanService>();

builder.Services.AddControllers(); // Thêm dịch vụ controllers
builder.Services.AddEndpointsApiExplorer(); // Khám phá API cho Swagger/OpenAPI
builder.Services.AddSwaggerGen(); // Thêm dịch vụ Swagger/OpenAPI Generator
#endregion

#region Authentication Configuration
/// <summary>
/// Cấu hình xác thực JWT Bearer.
/// </summary>
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, // Xác thực Issuer của token
        ValidateAudience = true, // Xác thực Audience của token
        ValidateLifetime = true, // Xác thực thời gian sống của token
        ValidateIssuerSigningKey = true, // Xác thực khóa ký của token
        ValidIssuer = builder.Configuration["Jwt:Issuer"], // Issuer hợp lệ từ cấu hình
        ValidAudience = builder.Configuration["Jwt:Audience"], // Audience hợp lệ từ cấu hình
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!)) // Khóa ký bí mật
    };
});
#endregion

#region CORS Policy Configuration
/// <summary>
/// Cấu hình chính sách CORS để cho phép các yêu cầu từ nguồn gốc cụ thể.
/// </summary>
builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy =>
    {
        // Cho phép yêu cầu từ địa chỉ của server frontend Vite
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyMethod() // Cho phép tất cả các phương thức HTTP (GET, POST, PUT, DELETE, v.v.)
              .AllowAnyHeader(); // Cho phép tất cả các header
    });
});
#endregion

#region Application Building & Middleware Configuration
var app = builder.Build();

/// <summary>
/// Cấu hình pipeline HTTP request.
/// </summary>
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // Sử dụng Swagger trong môi trường phát triển
    app.UseSwaggerUI(); // Sử dụng Swagger UI trong môi trường phát triển
}

// Luôn sử dụng CORS Policy trước UseAuthentication và UseAuthorization
app.UseCors(DevCorsPolicy);

app.UseAuthentication(); // Bật xác thực
app.UseAuthorization(); // Bật ủy quyền

app.MapControllers(); // Ánh xạ các controller API
#endregion

#region Application Run
app.Run(); // Chạy ứng dụng
#endregion