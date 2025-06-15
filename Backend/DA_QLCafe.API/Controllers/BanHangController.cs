using DA_QLCafe.API.Models;
using DA_QLCafe.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Controllers
{
    /// <summary>
    /// Bộ điều khiển xử lý các tác vụ liên quan đến bán hàng, bao gồm quản lý đơn hàng,
    /// thanh toán và gộp đơn. Yêu cầu quyền 'QuanLy', 'ThuNgan' hoặc 'PhaChe'.
    /// </summary>
    [Authorize(Roles = "QuanLy,ThuNgan,PhaChe")]
    [ApiController]
    [Route("api/[controller]")]
    public class BanHangController : ControllerBase
    {
        #region Trường Riêng (Private Fields)
        private readonly IBanHangService _banHangService;
        #endregion

        #region Hàm Khởi Tạo (Constructors)
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="BanHangController"/>.
        /// </summary>
        /// <param name="banHangService">Dịch vụ bán hàng được tiêm vào.</param>
        public BanHangController(IBanHangService banHangService)
        {
            _banHangService = banHangService;
        }
        #endregion

        #region Các lớp Request Body (DTOs nội bộ)
        /// <summary>
        /// Đại diện cho yêu cầu thêm nhiều sản phẩm vào đơn hàng.
        /// </summary>
        public class ThemNhieuSanPhamRequest { public List<ChiTietDonHangDto> ChiTietDonHang { get; set; } = new List<ChiTietDonHangDto>(); }
        /// <summary>
        /// Đại diện cho yêu cầu thanh toán gộp nhiều đơn hàng.
        /// </summary>
        public class ThanhToanGopRequest { public List<int> DonHangIds { get; set; } = new List<int>(); public int MaPhuongThucThanhToan { get; set; } public int? MaKhuyenMai { get; set; } public int? MaKhachHang { get; set; } public int? DiemSuDung { get; set; } }
        /// <summary>
        /// Đại diện cho yêu cầu thanh toán một đơn hàng.
        /// </summary>
        public class ThanhToanRequest { public int MaPhuongThucThanhToan { get; set; } public int? MaKhuyenMai { get; set; } public int? DiemSuDung { get; set; } }
        /// <summary>
        /// Đại diện cho yêu cầu cập nhật số lượng sản phẩm trong chi tiết đơn hàng.
        /// </summary>
        public class CapNhatSoLuongRequest { public int MaSanPham { get; set; } public int SoLuongMoi { get; set; } }
        /// <summary>
        /// Đại diện cho yêu cầu cập nhật trạng thái của đơn hàng.
        /// </summary>
        public class UpdateTrangThaiRequest { public string TrangThai { get; set; } = string.Empty; }
        /// <summary>
        /// Đại diện cho yêu cầu cập nhật khách hàng cho một đơn hàng.
        /// </summary>
        public class UpdateKhachHangRequest { public int? MaKhachHang { get; set; } }
        #endregion

        #region API Lấy Dữ Liệu Ban Đầu (GET)

        /// <summary>
        /// Lấy danh sách các bàn theo loại.
        /// </summary>
        /// <returns>Danh sách các bàn đã được phân loại.</returns>
        [HttpGet("ban-theo-loai")]
        public async Task<IActionResult> GetBanTheoLoai()
        {
            var result = await _banHangService.GetBanTheoLoai();
            return Ok(result);
        }

        /// <summary>
        /// Lấy danh sách sản phẩm được nhóm theo danh mục.
        /// </summary>
        /// <returns>Danh sách sản phẩm được phân loại theo danh mục.</returns>
        [HttpGet("sanpham-theo-danhmuc")]
        public async Task<IActionResult> GetSanPhamTheoDanhMuc()
        {
            var result = await _banHangService.GetSanPhamTheoDanhMuc();
            return Ok(result);
        }

        /// <summary>
        /// Lấy danh sách các chương trình khuyến mãi hiện có.
        /// </summary>
        /// <returns>Danh sách các chương trình khuyến mãi.</returns>
        [HttpGet("khuyenmai")]
        public async Task<IActionResult> GetKhuyenMai()
        {
            var result = await _banHangService.GetKhuyenMais();
            return Ok(result);
        }

        /// <summary>
        /// Lấy danh sách các phương thức thanh toán.
        /// </summary>
        /// <returns>Danh sách các phương thức thanh toán.</returns>
        [HttpGet("phuongthucthanhtoan")]
        public async Task<IActionResult> GetPhuongThucThanhToan()
        {
            var result = await _banHangService.GetPhuongThucThanhToans();
            return Ok(result);
        }

        /// <summary>
        /// Kiểm tra số lượng tồn kho của một sản phẩm.
        /// </summary>
        /// <param name="maSanPham">Mã sản phẩm cần kiểm tra.</param>
        /// <param name="soLuong">Số lượng muốn kiểm tra.</param>
        /// <returns>Đối tượng JSON chứa thuộc tính 'isAvailable' (true nếu đủ, false nếu không).</returns>
        [HttpGet("check-stock")]
        public async Task<IActionResult> CheckStock([FromQuery] int maSanPham, [FromQuery] int soLuong)
        {
            var isAvailable = await _banHangService.CheckStock(maSanPham, soLuong);
            return Ok(new { isAvailable });
        }
        #endregion

        #region API Quản Lý Đơn Hàng

        /// <summary>
        /// Lấy đơn hàng đang được thực hiện cho một bàn cụ thể.
        /// </summary>
        /// <param name="maBan">Mã bàn.</param>
        /// <returns>Thông tin đơn hàng nếu tìm thấy, ngược lại là 404 Not Found.</returns>
        [HttpGet("ban/{maBan}/donhang-hien-tai")]
        public async Task<IActionResult> GetDonHangHienTai(int maBan)
        {
            var donHang = await _banHangService.GetDonHangDangThucHienCuaBan(maBan);
            if (donHang == null)
                return NotFound($"Không tìm thấy đơn hàng đang hoạt động cho bàn #{maBan}.");
            return Ok(donHang);
        }

        /// <summary>
        /// Lấy chi tiết của một đơn hàng cụ thể.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <returns>Danh sách chi tiết đơn hàng.</returns>
        [HttpGet("donhang/{maDonHang}/chitiet")]
        public async Task<IActionResult> GetChiTietDonHang(int maDonHang)
        {
            var result = await _banHangService.GetChiTietDonHang(maDonHang);
            return Ok(result);
        }

        /// <summary>
        /// Tạo một đơn hàng mới.
        /// </summary>
        /// <param name="donHangDto">Dữ liệu đơn hàng để tạo.</param>
        /// <returns>ID của đơn hàng mới được tạo và thông báo thành công.</returns>
        [HttpPost("donhang")]
        public async Task<IActionResult> TaoDonHang([FromBody] TaoDonHangDto donHangDto)
        {
            try
            {
                var newOrderId = await _banHangService.TaoDonHang(donHangDto);
                return Ok(new { newOrderID = newOrderId, Message = "Tạo đơn hàng thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi khi tạo đơn hàng: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Thêm nhiều sản phẩm vào một đơn hàng đã có.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="request">Yêu cầu chứa danh sách các chi tiết đơn hàng (sản phẩm) cần thêm.</param>
        /// <returns>Kết quả thành công hoặc thất bại.</returns>
        [HttpPost("donhang/{maDonHang}/themsanpham-nhieu")]
        public async Task<IActionResult> ThemNhieuSanPham(int maDonHang, [FromBody] ThemNhieuSanPhamRequest request)
        {
            if (request.ChiTietDonHang == null || !request.ChiTietDonHang.Any())
            {
                return BadRequest("Danh sách sản phẩm không được để trống.");
            }
            try
            {
                var result = await _banHangService.ThemNhieuSanPhamVaoDonHang(maDonHang, request.ChiTietDonHang);
                return result ? Ok(new { message = "Thêm các món vào đơn hàng thành công!" }) : BadRequest("Thêm sản phẩm thất bại.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật trạng thái của một đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="request">Yêu cầu chứa trạng thái mới.</param>
        /// <returns>Kết quả thành công hoặc thất bại.</returns>
        [HttpPut("donhang/{maDonHang}/trangthai")]
        public async Task<IActionResult> CapNhatTrangThai(int maDonHang, [FromBody] BanHangUpdateTrangThaiRequest request) // Đã đổi để dùng mô hình mới
        {
            var result = await _banHangService.CapNhatTrangThaiDonHang(maDonHang, request.TrangThai);
            return result ? Ok() : BadRequest("Cập nhật trạng thái thất bại.");
        }

        /// <summary>
        /// Cập nhật số lượng của một sản phẩm trong đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="request">Yêu cầu chứa mã sản phẩm và số lượng mới.</param>
        /// <returns>Kết quả thành công hoặc thất bại.</returns>
        [HttpPut("donhang/{maDonHang}/sua-so-luong")]
        public async Task<IActionResult> SuaSoLuong(int maDonHang, [FromBody] CapNhatSoLuongRequest request)
        {
            var result = await _banHangService.CapNhatSoLuongSanPham(maDonHang, request.MaSanPham, request.SoLuongMoi);
            return result ? Ok() : BadRequest("Cập nhật số lượng thất bại.");
        }

        /// <summary>
        /// Xóa một sản phẩm khỏi đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="maSanPham">Mã sản phẩm cần xóa.</param>
        /// <returns>Kết quả thành công hoặc thất bại.</returns>
        [HttpDelete("donhang/{maDonHang}/xoa-san-pham/{maSanPham}")]
        public async Task<IActionResult> XoaSanPham(int maDonHang, int maSanPham)
        {
            var result = await _banHangService.XoaSanPhamKhoiDonHang(maDonHang, maSanPham);
            return result ? Ok() : BadRequest("Xóa sản phẩm thất bại.");
        }

        /// <summary>
        /// Cập nhật thông tin khách hàng cho một đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng.</param>
        /// <param name="request">Yêu cầu chứa mã khách hàng mới (hoặc null để bỏ gán).</param>
        /// <returns>Kết quả thành công hoặc thất bại.</returns>
        [HttpPut("donhang/{maDonHang}/khachhang")]
        public async Task<IActionResult> CapNhatKhachHang(int maDonHang, [FromBody] UpdateKhachHangRequest request)
        {
            var result = await _banHangService.CapNhatKhachHangChoDon(maDonHang, request.MaKhachHang);
            return result ? Ok() : BadRequest("Cập nhật khách hàng cho đơn thất bại.");
        }

        #endregion
        
        #region API Gộp và Thanh Toán Đơn Hàng

        /// <summary>
        /// Gộp nhiều đơn hàng thành một đơn hàng mới.
        /// </summary>
        /// <param name="donHangIds">Danh sách các ID đơn hàng cần gộp.</param>
        /// <returns>ID của đơn hàng mới sau khi gộp và thông báo thành công.</returns>
        [HttpPost("gop-don-hang")]
        public async Task<IActionResult> GopDonHang([FromBody] List<int> donHangIds)
        {
            if (donHangIds == null || !donHangIds.Any() || donHangIds.Count < 2)
                return BadRequest("Cần ít nhất 2 đơn hàng để gộp.");
            
            var maNhanVienClaim = User.FindFirst("MaNhanVien");
            if (maNhanVienClaim == null || !int.TryParse(maNhanVienClaim.Value, out var maNhanVien))
                return Unauthorized("Không thể xác định thông tin nhân viên.");
            
            try
            {
                var newOrderId = await _banHangService.GopDonHang(donHangIds, maNhanVien);
                return Ok(new { NewOrderID = newOrderId, Message = "Gộp đơn hàng thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server khi gộp đơn: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy chi tiết hóa đơn (bill) cho một đơn hàng cụ thể.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng cần lấy hóa đơn.</param>
        /// <returns>Thông tin chi tiết hóa đơn nếu tìm thấy, ngược lại là 404 Not Found hoặc lỗi 500.</returns>
        [HttpGet("donhang/{maDonHang}/bill")]
        public async Task<IActionResult> GetBill(int maDonHang)
        {
            try
            {
                var bill = await _banHangService.GetBillDetails(maDonHang);
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

        /// <summary>
        /// Thực hiện thanh toán gộp cho nhiều đơn hàng.
        /// </summary>
        /// <param name="request">Yêu cầu thanh toán gộp, bao gồm danh sách ID đơn hàng, phương thức thanh toán, khuyến mãi và điểm sử dụng.</param>
        /// <returns>Thông báo thành công và ID của đơn hàng cuối cùng sau khi gộp và thanh toán.</returns>
        [HttpPost("thanh-toan-gop")]
        public async Task<IActionResult> ThanhToanGop([FromBody] ThanhToanGopRequest request)
        {
            if (request.DonHangIds == null || !request.DonHangIds.Any() || request.DonHangIds.Count < 2)
                return BadRequest("Cần ít nhất 2 đơn hàng để thanh toán gộp.");
            
            var maNhanVienClaim = User.FindFirst("MaNhanVien");
            if (maNhanVienClaim == null || !int.TryParse(maNhanVienClaim.Value, out var maNhanVien))
                return Unauthorized("Không thể xác định thông tin nhân viên.");
            
            try
            {
                var finalOrderId = await _banHangService.GopVaThanhToanDonHang(request.DonHangIds, maNhanVien, request.MaKhachHang);
                await _banHangService.HoanThanhThanhToan(finalOrderId, request.MaPhuongThucThanhToan, request.MaKhuyenMai, request.DiemSuDung);
                return Ok(new { Message = $"Thanh toán gộp thành công! Đơn hàng cuối cùng là #{finalOrderId}", FinalOrderID = finalOrderId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server khi thanh toán gộp: {ex.Message}");
            }
        }

        /// <summary>
        /// Hoàn tất thanh toán cho một đơn hàng.
        /// </summary>
        /// <param name="maDonHang">Mã đơn hàng cần thanh toán.</param>
        /// <param name="request">Yêu cầu thanh toán, bao gồm phương thức thanh toán, khuyến mãi và điểm sử dụng.</param>
        /// <returns>Thông báo thành công và ID đơn hàng nếu thanh toán thành công, ngược lại là 400 Bad Request.</returns>
        [HttpPut("donhang/{maDonHang}/thanhtoan")]
        public async Task<IActionResult> ThanhToan(int maDonHang, [FromBody] ThanhToanRequest request)
        {
            try
            {
                var result = await _banHangService.HoanThanhThanhToan(maDonHang, request.MaPhuongThucThanhToan, request.MaKhuyenMai, request.DiemSuDung);
                return result ? Ok(new { Message = "Thanh toán thành công!", OrderID = maDonHang }) 
                              : BadRequest("Thanh toán thất bại.");
            }
            catch(Exception ex)
            {
                return BadRequest($"Lỗi khi thanh toán: {ex.Message}");
            }
        }
        
        #endregion
    }
}