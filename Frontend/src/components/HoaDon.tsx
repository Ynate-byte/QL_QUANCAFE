import { useEffect, useState, useRef } from 'react';
import type { ChiTietDonHangDayDu } from '../interfaces/BaoCao';
import { getChiTietDonHang } from '../api/baoCaoApi';
import { useReactToPrint } from 'react-to-print';
import '../styles/components/HoaDon.css';
import '../styles/global/components.css';

// #region Props Interface
/**
 * @summary Props cho component HoaDon.
 */
interface Props {
    maDonHang: number;
    onClose: () => void;
}
// #endregion

/**
 * @summary Component hiển thị chi tiết hóa đơn và cho phép in.
 * @param {Props} { maDonHang, onClose } Props của component.
 * @returns {JSX.Element} Component React hiển thị hóa đơn.
 */
function HoaDon({ maDonHang, onClose }: Props) {
    // #region State Management
    const [orderInfo, setOrderInfo] = useState<ChiTietDonHangDayDu[]>([]);
    const componentRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // #endregion

    // #region Effects
    /**
     * @summary useEffect để tải chi tiết hóa đơn khi maDonHang thay đổi.
     */
    useEffect(() => {
        if (maDonHang) {
            setLoading(true);
            setError(null);
            getChiTietDonHang(maDonHang)
                .then(data => {
                    if (data && data.length > 0) {
                        setOrderInfo(data);
                    } else {
                        setError("Không tìm thấy chi tiết hóa đơn hoặc hóa đơn trống.");
                        setOrderInfo([]);
                    }
                })
                .catch(err => {
                    console.error("Lỗi khi tải chi tiết hóa đơn:", err);
                    setError("Lỗi khi tải chi tiết hóa đơn. Vui lòng thử lại.");
                    setOrderInfo([]);
                })
                .finally(() => setLoading(false));
        }
    }, [maDonHang]);
    // #endregion

    // #region Print Handler
    /**
     * @summary Hàm xử lý in hóa đơn sử dụng thư viện react-to-print.
     */
    const handlePrint = useReactToPrint({
        // @ts-expect-error - Thuộc tính 'content' hợp lệ nhưng có thể bị lỗi type definition
        content: () => componentRef.current,
        documentTitle: `Hoa_Don_${maDonHang}`, // Tên file khi in ra
        pageStyle: `
            @page { size: 80mm auto; margin: 0; } /* Kích thước giấy in nhiệt */
            @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } /* Đảm bảo in đúng màu */
                .invoice-box { padding: 10mm; } /* Padding khi in */
                .modal-overlay, .print-actions { display: none !important; } /* Ẩn Modal overlay và nút khi in */
            }
        `
    });
    // #endregion

    // #region Render Loading / Error States
    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{ padding: '20px', textAlign: 'center' }}>
                    <p>Đang tải hóa đơn...</p>
                    <div className="print-actions">
                        <button onClick={onClose} className="action-btn cancel-btn">Đóng</button>
                    </div>
                </div>
            </div>
        );
    }

    if (error || orderInfo.length === 0) {
        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{ padding: '20px', textAlign: 'center' }}>
                    <p>{error || `Không tìm thấy thông tin hóa đơn cho mã #${maDonHang}.`}</p>
                    <div className="print-actions">
                        <button onClick={onClose} className="action-btn cancel-btn">Đóng</button>
                    </div>
                </div>
            </div>
        );
    }
    // #endregion

    // #region Calculations (assuming data is available)
    const firstItem = orderInfo[0];
    const tongTienTruocGiamVaPhuPhi = orderInfo.reduce((sum, item) => sum + item.thanhTienTungSP, 0);
    // #endregion

    // #region Main Render
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div ref={componentRef} className="invoice-box">
                    <h2 className="invoice-header-title">QL-Cafe</h2>
                    <p className="invoice-address">
                        Địa chỉ: 123 Đường ABC, Quận 1, TP. HCM<br />
                        SĐT: 0909.123.456
                    </p>
                    <hr />
                    <h3 className="invoice-main-title">HÓA ĐƠN BÁN HÀNG</h3>
                    <p className="invoice-details">
                        <strong>Mã ĐH:</strong> {firstItem.maDonHang}<br />
                        <strong>Thời gian:</strong> {new Date(firstItem.thoiGianDat).toLocaleString('vi-VN')}<br />
                        <strong>Thu ngân:</strong> {firstItem.tenNhanVien || 'N/A'}<br />
                        <strong>Khách hàng:</strong> {firstItem.tenKhachHang || 'Khách vãng lai'}<br />
                        <strong>Bàn:</strong> {firstItem.tenBan || 'Mang về'}
                    </p>
                    <hr />
                    <table className="invoice-items-table">
                        <thead>
                            <tr>
                                <th>Tên món</th>
                                <th>SL</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderInfo.map((item, index) => (
                                <tr key={`${item.tenSP}-${index}`}>
                                    <td>{item.tenSP}</td>
                                    <td>{item.soLuong}</td>
                                    <td>{item.giaBan.toLocaleString('vi-VN')}</td>
                                    <td>{item.thanhTienTungSP.toLocaleString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <hr />
                    <div className="invoice-totals">
                        <div className="total-row"><span>Tạm tính:</span> <span>{tongTienTruocGiamVaPhuPhi.toLocaleString('vi-VN')} đ</span></div>
                        {firstItem.phuPhi > 0 && <div className="total-row surcharge-row"><span>Phụ phí phòng VIP:</span> <span>+ {firstItem.phuPhi.toLocaleString('vi-VN')} đ</span></div>}
                        {firstItem.tenKhuyenMai && firstItem.tenKhuyenMai !== "Không áp dụng" && <div className="total-row discount-row"><span>Khuyến mãi:</span> <span>({firstItem.tenKhuyenMai})</span></div>}
                        <div className="total-row final-total-row"><span>Tổng cộng:</span> <span>{firstItem.tongTienDonHangFinal.toLocaleString('vi-VN')} đ</span></div>
                    </div>
                    <p className="invoice-thank-you">Cảm ơn quý khách và hẹn gặp lại!</p>
                </div>
                <div className="print-actions">
                    <button onClick={handlePrint} className="action-btn save-btn">In Hóa Đơn</button>
                    <button onClick={onClose} className="action-btn cancel-btn">Đóng</button>
                </div>
            </div>
        </div>
    );
    // #endregion
}

export default HoaDon;