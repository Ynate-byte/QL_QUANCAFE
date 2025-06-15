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
builder.Services.AddSingleton<DbContext>();
builder.Services.AddScoped<IBanHangService, BanHangService>();
builder.Services.AddScoped<IKhachHangService, IKhachHangService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IKhoService, KhoService>();
builder.Services.AddScoped<ICongThucService, CongThucService>();
builder.Services.AddScoped<IBaoCaoService, BaoCaoService>();
builder.Services.AddScoped<INhanSuService, NhanSuService>();
builder.Services.AddScoped<IKhuyenMaiService, IKhuyenMaiService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IPhanHoiService, PhanHoiService>();
builder.Services.AddScoped<IDatBanService, DatBanService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IQuanLyBanService, QuanLyBanService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!))
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
        // === ĐẢM BẢO HAI ĐỊA CHỈ NÀY CÓ MẶT TRONG PROGRAM.CS CỦA BẠN ===
        policy.WithOrigins(
            "http://localhost:5173", // Frontend cục bộ của bạn
            "https://aquamarine-sunshine-6f864f.netlify.app" // <--- ĐỊA CHỈ CỦA FRONTEND ĐÃ TRIỂN KHAI TRÊN NETLIFY
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
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
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Luôn sử dụng CORS Policy trước UseAuthentication và UseAuthorization
app.UseCors(DevCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
#endregion

#region Application Run
app.Run();
#endregion