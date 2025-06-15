using DA_QLCafe.API.Models.Auth;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
    }
}