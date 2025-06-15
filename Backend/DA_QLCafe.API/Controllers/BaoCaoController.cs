using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// Controller để quản lý các báo cáo kinh doanh.
    /// </summary>
    [Authorize(Roles = "QuanLy")]
    [ApiController]
    [Route("api/[controller]")]
    public class BaoCaoController : ControllerBase
    {
        #region Fields
        private readonly IBaoCaoService _baoCaoService;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của <see cref="BaoCaoController"/>.
        /// </summary>
        /// <param name="baoCaoService">Dịch vụ báo cáo.</param>
        public BaoCaoController(IBaoCaoService baoCaoService)
        {
            _baoCaoService = baoCaoService;
        }
        #endregion

        #region Báo Cáo Doanh Thu & Đơn Hàng
        /// <summary>
        /// Lấy lịch sử đơn hàng trong một khoảng thời gian.
        /// </summary>
        [HttpGet("lichsudonhang")]
        public async Task<IActionResult> GetLichSuDonHang([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            try
            {
                var result = await _baoCaoService.GetLichSuDonHang(fromDate, toDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        /// <summary>
        /// Lấy doanh thu và lợi nhuận trong một khoảng thời gian.
        /// </summary>
        [HttpGet("doanhthu-loinhuan")]
        public async Task<IActionResult> GetDoanhThuLoiNhuan([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            var result = await _baoCaoService.GetDoanhThuLoiNhuan(fromDate, toDate);
            return Ok(result);
        }

        /// <summary>
        /// Lấy đơn hàng của ngày hôm nay.
        /// </summary>
        [HttpGet("don-hang-hom-nay")]
        public async Task<IActionResult> GetDonHangHomNay()
        {
            return Ok(await _baoCaoService.GetDonHangHomNay());
        }

        /// <summary>
        /// Lấy chi tiết của một đơn hàng cụ thể.
        /// </summary>
        [HttpGet("lichsudonhang/{maDonHang}")]
        public async Task<IActionResult> GetChiTietDonHang(int maDonHang)
        {
            var result = await _baoCaoService.GetChiTietDonHang(maDonHang);
            if (result == null || !result.Any())
            {
                return NotFound("Không tìm thấy đơn hàng.");
            }
            return Ok(result);
        }

        /// <summary>
        /// Lấy thông tin hóa đơn (bill) cho một đơn hàng cụ thể.
        /// </summary>
        [HttpGet("donhang/{maDonHang}/bill")]
        public async Task<IActionResult> GetBillForReport(int maDonHang)
        {
            try
            {
                var bill = await _baoCaoService.GetBillDetails(maDonHang);
                if (bill == null)
                {
                    return NotFound($"Không tìm thấy thông tin hóa đơn cho đơn hàng #{maDonHang}.");
                }
                return Ok(bill);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server khi lấy thông tin hóa đơn: {ex.Message}");
            }
        }
        #endregion

        #region Báo Cáo Sản Phẩm & Khuyến Mãi
        /// <summary>
        /// Lấy lợi nhuận theo từng sản phẩm.
        /// </summary>
        [HttpGet("loinhuansanpham")]
        public async Task<IActionResult> GetLoiNhuanSanPham()
        {
            return Ok(await _baoCaoService.GetLoiNhuanSanPham());
        }

        /// <summary>
        /// Lấy hiệu quả của các chương trình khuyến mãi.
        /// </summary>
        [HttpGet("hieuquakhuyenmai")]
        public async Task<IActionResult> GetHieuQuaKhuyenMai()
        {
            return Ok(await _baoCaoService.GetHieuQuaKhuyenMai());
        }
        
        /// <summary>
        /// Lấy hiệu suất sản phẩm (số lượng bán, doanh thu) trong một khoảng thời gian.
        /// </summary>
        [HttpGet("product-performance")]
        public async Task<IActionResult> GetProductPerformance([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            return Ok(await _baoCaoService.GetProductPerformance(fromDate, toDate));
        }
        #endregion

        #region Báo Cáo Lương
        /// <summary>
        /// Lấy bảng lương theo tháng và năm.
        /// </summary>
        [HttpGet("bangluong")]
        public async Task<IActionResult> GetBangLuong([FromQuery] int month, [FromQuery] int year)
        {
            return Ok(await _baoCaoService.GetBangLuong(month, year));
        }
        #endregion
    }
}