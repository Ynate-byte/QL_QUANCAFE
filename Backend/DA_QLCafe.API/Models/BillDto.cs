using System;
using System.Collections.Generic;

namespace DA_QLCafe.API.Models
{
    /// <summary>
    /// DTO đại diện cho một món hàng trong hóa đơn.
    /// </summary>
    public class BillItemDto
    {
        /// <summary>
        /// Tên của sản phẩm.
        /// </summary>
        public string TenSP { get; set; } = string.Empty;
        /// <summary>
        /// Số lượng sản phẩm đã mua.
        /// </summary>
        public int SoLuong { get; set; }
        /// <summary>
        /// Đơn giá của sản phẩm.
        /// </summary>
        public decimal DonGia { get; set; }
        /// <summary>
        /// Thành tiền của món hàng này (Số lượng * Đơn giá).
        /// </summary>
        public decimal ThanhTien { get; set; }
    }

    /// <summary>
    /// DTO đại diện cho toàn bộ thông tin của một hóa đơn.
    /// </summary>
    public class BillDto
    {
        // Thông tin cửa hàng (có thể lấy từ file config hoặc hardcode)
        /// <summary>
        /// Tên của cửa hàng.
        /// </summary>
        public string TenCuaHang { get; set; } = "The Coffee House";
        /// <summary>
        /// Địa chỉ của cửa hàng.
        /// </summary>
        public string DiaChiCuaHang { get; set; } = "123 Đường ABC, Quận 1, TP.HCM";
        /// <summary>
        /// Số điện thoại liên hệ của cửa hàng.
        /// </summary>
        public string SoDienThoaiCuaHang { get; set; } = "1900 1234";
        /// <summary>
        /// Lời cảm ơn in trên hóa đơn.
        /// </summary>
        public string LoiCamOn { get; set; } = "Xin cảm ơn và hẹn gặp lại quý khách!";

        // Thông tin hóa đơn
        /// <summary>
        /// Mã của đơn hàng.
        /// </summary>
        public int MaDonHang { get; set; }
        /// <summary>
        /// Thời gian thanh toán hóa đơn.
        /// </summary>
        public DateTime ThoiGianThanhToan { get; set; }
        /// <summary>
        /// Tên của nhân viên thực hiện đơn hàng.
        /// </summary>
        public string TenNhanVien { get; set; } = string.Empty;
        /// <summary>
        /// Tên của khách hàng (nếu có).
        /// </summary>
        public string? TenKhachHang { get; set; }
        /// <summary>
        /// Tên của bàn (nếu áp dụng cho đơn hàng tại chỗ).
        /// </summary>
        public string? TenBan { get; set; }
        /// <summary>
        /// Loại đơn hàng (ví dụ: 'Tại bàn', 'Mang đi').
        /// </summary>
        public string LoaiDonHang { get; set; } = string.Empty;
        /// <summary>
        /// Phương thức thanh toán được sử dụng.
        /// </summary>
        public string PhuongThucThanhToan { get; set; } = string.Empty;

        // Chi tiết hóa đơn
        /// <summary>
        /// Danh sách các món hàng trong hóa đơn.
        /// </summary>
        public List<BillItemDto> ChiTiet { get; set; } = new List<BillItemDto>();

        // Tổng kết
        /// <summary>
        /// Tổng tiền hàng trước khi áp dụng phụ phí, giảm giá.
        /// </summary>
        public decimal TongTienHang { get; set; } 
        /// <summary>
        /// Các khoản phụ phí (nếu có).
        /// </summary>
        public decimal PhuPhi { get; set; } 
        /// <summary>
        /// Số tiền được giảm giá.
        /// </summary>
        public decimal GiamGia { get; set; }
        /// <summary>
        /// Tên của chương trình khuyến mãi đã áp dụng (nếu có).
        /// </summary>
        public string? TenKhuyenMai { get; set; }
        /// <summary>
        /// Tổng số tiền cuối cùng khách hàng phải trả.
        /// </summary>
        public decimal TongCong { get; set; }
    }
}