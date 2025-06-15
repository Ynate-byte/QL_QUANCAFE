import type { BillDto } from '../interfaces/Bill';
import '../styles/components/QrPaymentModal.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    qrImageUrl: string | null;
    billData: BillDto | null;
    loading: boolean;
}

// SVG Icon cho MB Bank (ví dụ)
const MBBankIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#0066CC"/>
        <path d="M12 5l-4 4h3v6h2v-6h3l-4-4z" fill="#0066CC"/>
    </svg>
);


function QrPaymentModal({ isOpen, onClose, onConfirm, qrImageUrl, billData, loading }: Props) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
                <div className="qr-modal-container">
                    {/* Cột trái: Hiển thị QR và thông tin thanh toán */}
                    <div className="qr-payment-section">
                        <div className="qr-header">
                            <h3>Thanh toán với VietQR</h3>
                            <p>Sử dụng App Ngân hàng hoặc Ví điện tử để quét mã</p>
                        </div>
                        <div className="qr-code-wrapper">
                            {loading && (
                                <div className="qr-loading-overlay">
                                    <div className="spinner"></div>
                                    <span>Đang tạo mã...</span>
                                </div>
                            )}
                            {qrImageUrl && <img src={qrImageUrl} alt="Mã QR Thanh toán" />}
                        </div>
                        <div className="payment-details">
                            <div className="bank-info">
                                <MBBankIcon />
                                <div>
                                    <p className="bank-name">Ngân hàng TMCP Quân Đội (MB Bank)</p>
                                    <p className="account-number">STK: 0367931215 - HO HOANG ANH VU</p>
                                </div>
                            </div>
                            <div className="amount-info">
                                <span className="label">Số tiền cần thanh toán</span>
                                <span className="amount">{billData?.tongCong.toLocaleString('vi-VN')} đ</span>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Chi tiết hóa đơn */}
                    <div className="bill-preview-section">
                        <h4>Chi tiết hóa đơn</h4>
                        {billData ? (
                            <>
                                <div className="bill-items">
                                    {billData.chiTiet.map((item, index) => (
                                        <div className="bill-item" key={index}>
                                            <span className="item-name">{item.tenSP} <span className="item-qty">x{item.soLuong}</span></span>
                                            <span className="item-price">{item.thanhTien.toLocaleString('vi-VN')} đ</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bill-summary">
                                    <div className="summary-row"><span>Tạm tính</span><span>{billData.tongTienHang.toLocaleString('vi-VN')} đ</span></div>
                                    {billData.phuPhi > 0 && <div className="summary-row"><span>Phụ phí</span><span>+ {billData.phuPhi.toLocaleString('vi-VN')} đ</span></div>}
                                    {billData.giamGia > 0 && <div className="summary-row discount"><span>Giảm giá</span><span>- {billData.giamGia.toLocaleString('vi-VN')} đ</span></div>}
                                    <div className="summary-row total"><span>Tổng cộng</span><span>{billData.tongCong.toLocaleString('vi-VN')} đ</span></div>
                                </div>
                            </>
                        ) : (
                            <p>Đang tải chi tiết...</p>
                        )}
                        <div className="payment-footer">
                             <p>Nội dung chuyển khoản: <strong className="text-highlight">TT DH {billData?.maDonHang}</strong></p>
                             <button onClick={onConfirm} className="action-btn save-btn full-width" disabled={loading || !qrImageUrl}>
                                 {loading ? 'Đang xử lý...' : 'Xác nhận Đã thanh toán'}
                             </button>
                             <button onClick={onClose} className="action-btn cancel-btn-text full-width">Hủy bỏ</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QrPaymentModal;
