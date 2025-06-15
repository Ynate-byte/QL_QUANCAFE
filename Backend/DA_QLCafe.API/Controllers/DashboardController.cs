using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; 
using System.Threading.Tasks;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// Bộ điều khiển cung cấp các API cho Dashboard, bao gồm các thông tin tổng quan và cảnh báo.
    /// Yêu cầu quyền 'QuanLy', 'ThuNgan', 'PhaChe' hoặc 'Kho'.
    /// </summary>
    [Authorize(Roles = "QuanLy,ThuNgan,PhaChe,Kho")]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        #region Fields
        private readonly IDashboardService _dashboardService;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="DashboardController"/>.
        /// </summary>
        /// <param name="dashboardService">Dịch vụ Dashboard được tiêm vào.</param>
        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }
        #endregion

        #region API Doanh Thu & Hiệu Suất
        /// <summary>
        /// Lấy tổng doanh thu trong ngày hôm nay.
        /// </summary>
        /// <returns>Tổng doanh thu của ngày hiện tại.</returns>
        [HttpGet("doanhthuhomnay")]
        public async Task<IActionResult> GetDoanhThuHomNay()
        {
            return Ok(await _dashboardService.GetDoanhThuTrongNgay());
        }

        /// <summary>
        /// Lấy doanh thu trong 7 ngày gần nhất.
        /// </summary>
        /// <returns>Doanh thu theo từng ngày trong 7 ngày qua.</returns>
        [HttpGet("doanhthu7ngay")]
        public async Task<IActionResult> GetDoanhThu7Ngay()
        {
            return Ok(await _dashboardService.GetDoanhThu7NgayQua());
        }

        /// <summary>
        /// Lấy danh sách các sản phẩm bán chạy nhất.
        /// </summary>
        /// <param name="top">Số lượng sản phẩm bán chạy hàng đầu cần lấy (mặc định là 5).</param>
        /// <returns>Danh sách sản phẩm bán chạy.</returns>
        [HttpGet("sanphambanchay")]
        public async Task<IActionResult> GetSanPhamBanChay([FromQuery] int top = 5)
        {
            return Ok(await _dashboardService.GetSanPhamBanChay(top));
        }

        /// <summary>
        /// Lấy tỷ lệ bán hàng theo danh mục trong 7 ngày qua.
        /// </summary>
        /// <returns>Dữ liệu tỷ lệ bán hàng theo danh mục.</returns>
        [HttpGet("tyledanhmuc")]
        public async Task<IActionResult> GetTyLeDanhMuc()
        {
            return Ok(await _dashboardService.GetTyLeBanTheoDanhMuc7NgayQua());
        }
        #endregion

        #region API Cảnh Báo & Thông Báo
        /// <summary>
        /// Lấy danh sách các sản phẩm cần cảnh báo tồn kho (dưới mức tối thiểu).
        /// </summary>
        /// <returns>Danh sách các sản phẩm có tồn kho thấp.</returns>
        [HttpGet("canhbaotonkho")]
        public async Task<IActionResult> GetCanhBaoTonKho()
        {
            var result = await _dashboardService.GetCanhBaoTonKho();
            return Ok(result);
        }

        /// <summary>
        /// Lấy danh sách khách hàng có sinh nhật trong ngày hôm nay.
        /// </summary>
        /// <returns>Danh sách khách hàng có sinh nhật hôm nay.</returns>
        [HttpGet("sinhnhat-homnay")]
        public async Task<IActionResult> GetSinhNhatHomNay()
        {
            return Ok(await _dashboardService.GetKhachHangSinhNhatHomNay());
        }
        #endregion
    }
}