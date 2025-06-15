import { useEffect, useState } from 'react';
import type { GioHangItem } from '../interfaces/GioHangItem';
import type { KhuyenMai } from '../interfaces/KhuyenMai';
import type { PhuongThucThanhToan } from '../interfaces/PhuongThucThanhToan';
import type { Ban } from '../interfaces/Ban';
import type { KhachHang } from '../interfaces/KhachHang';
import '../styles/components/ModalThanhToan.css';

// #region Props Interface
/**
 * @summary Props cho component ModalThanhToan.
 */
interface Props {
    isOpen: boolean; // Trạng thái mở/đóng modal
    onClose: () => void; // Hàm đóng modal
    gioHang: GioHangItem[]; // Danh sách sản phẩm trong giỏ hàng
    danhSachKhuyenMai: KhuyenMai[]; // Danh sách các khuyến mãi khả dụng
    danhSachPTTT: PhuongThucThanhToan[]; // Danh sách các phương thức thanh toán
    onConfirm: (data: { maKhuyenMai?: number | null, maPhuongThucThanhToan: number, diemSuDung?: number }) => void; // Hàm xác nhận thanh toán
    loaiBan?: Ban['loaiBan']; // Loại bàn để tính phụ phí (nếu có)
    khachHang?: KhachHang | null; // Thông tin khách hàng để tính điểm tích lũy
}
// #endregion

// #region Constants
const POINT_TO_VND_RATE = 100; // Tỷ lệ quy đổi: 1 điểm = 100đ
// #endregion

/**
 * @summary Component Modal hiển thị giao diện xác nhận thanh toán, áp dụng khuyến mãi và điểm tích lũy.
 * @param {Props} props Các thuộc tính truyền vào component.
 * @returns {JSX.Element | null} Component React hoặc null nếu modal không mở.
 */
function ModalThanhToan({ isOpen, onClose, gioHang, danhSachKhuyenMai, danhSachPTTT, onConfirm, loaiBan, khachHang }: Props) {
    // #region State Management
    const [maPTTT, setMaPTTT] = useState<number>(1); // Mã phương thức thanh toán đã chọn
    const [maKM, setMaKM] = useState<number | undefined>(undefined); // Mã khuyến mãi đã chọn
    const [diemSuDung, setDiemSuDung] = useState(0); // Số điểm tích lũy muốn sử dụng
    const [ghiChu, setGhiChu] = useState(''); // Ghi chú cho đơn hàng
    // #endregion

    // #region Effects
    /**
     * @summary `useEffect` để khởi tạo hoặc reset trạng thái khi modal mở.
     */
    useEffect(() => {
        if (isOpen) {
            // Đặt phương thức thanh toán mặc định là PTTT đầu tiên nếu có
            if (danhSachPTTT.length > 0) {
                setMaPTTT(danhSachPTTT[0].ma);
            }
            // Reset các giá trị khác về mặc định khi modal mở
            setMaKM(undefined);
            setDiemSuDung(0);
            setGhiChu('');
        }
    }, [isOpen, danhSachPTTT]); // Chạy khi `isOpen` hoặc `danhSachPTTT` thay đổi
    // #endregion

    // #region Calculations
    const subTotal = gioHang.reduce((sum, item) => sum + item.thanhTien, 0); // Tổng tiền hàng chưa bao gồm phụ phí và giảm giá
    const phuPhi = loaiBan === 'PhongVIP' ? subTotal * 0.10 : 0; // Phụ phí cho phòng VIP (10%)
    const totalBeforeDiscount = subTotal + phuPhi; // Tổng tiền trước khi áp dụng giảm giá

    const khuyenMaiDaChon = danhSachKhuyenMai.find(km => km.ma === maKM); // Lấy đối tượng khuyến mãi đã chọn
    let giamGiaKM = 0; // Giá trị giảm giá từ khuyến mãi
    if (khuyenMaiDaChon) {
        giamGiaKM = khuyenMaiDaChon.loaiKhuyenMai === 'PhanTram' 
            ? totalBeforeDiscount * (khuyenMaiDaChon.giaTriGiamGia / 100) // Tính giảm giá theo phần trăm
            : khuyenMaiDaChon.giaTriGiamGia; // Giảm giá theo giá trị cố định
    }
    
    const totalAfterKM = totalBeforeDiscount - giamGiaKM; // Tổng tiền sau khi áp dụng khuyến mãi
    // Số điểm tối đa có thể sử dụng (không vượt quá điểm khách hàng có và không giảm quá tổng tiền sau KM)
    const maxPointsToUse = khachHang ? Math.min(khachHang.diemTichLuy, Math.floor(totalAfterKM / POINT_TO_VND_RATE)) : 0;
    const giamGiaTuDiem = diemSuDung * POINT_TO_VND_RATE; // Giá trị giảm giá từ điểm tích lũy
    // Tổng tiền cuối cùng (không âm)
    const finalTotal = totalAfterKM - giamGiaTuDiem > 0 ? totalAfterKM - giamGiaTuDiem : 0;
    // #endregion

    // #region Event Handlers
    /**
     * @summary Xử lý thay đổi giá trị của input điểm sử dụng.
     * Đảm bảo giá trị nằm trong khoảng hợp lệ.
     * @param {React.ChangeEvent<HTMLInputElement>} e Sự kiện thay đổi của input.
     */
    const handleDiemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 0) value = 0; // Đảm bảo là số không âm
        if (value > maxPointsToUse) value = maxPointsToUse; // Không vượt quá điểm tối đa có thể dùng
        setDiemSuDung(value);
    };

    /**
     * @summary Xử lý khi người dùng xác nhận thanh toán.
     * Gọi hàm `onConfirm` từ props với các dữ liệu đã chọn.
     */
    const handleConfirm = () => {
        onConfirm({
            maKhuyenMai: maKM,
            maPhuongThucThanhToan: maPTTT,
            diemSuDung: diemSuDung > 0 ? diemSuDung : undefined // Chỉ gửi điểm nếu > 0
        });
    }
    // #endregion

    // Nếu modal không mở, không hiển thị gì
    if (!isOpen) return null;

    // #region Render Component
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Xác nhận Thanh toán</h3>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {/* Phần chọn Phương thức thanh toán */}
                    <div className="form-group">
                        <label htmlFor="phuongThucThanhToan">Phương thức thanh toán</label>
                        <select id="phuongThucThanhToan" value={maPTTT} onChange={(e) => setMaPTTT(Number(e.target.value))}>
                            {danhSachPTTT.map(pt => (
                                <option key={pt.ma} value={pt.ma}>{pt.tenPhuongThuc}</option>
                            ))}
                        </select>
                    </div>
                    {/* Phần chọn Khuyến mãi */}
                    <div className="form-group">
                        <label htmlFor="khuyenMai">Áp dụng khuyến mãi</label>
                        <select id="khuyenMai" value={maKM ?? ''} onChange={(e) => setMaKM(e.target.value ? Number(e.target.value) : undefined)}>
                            <option value="">Không áp dụng</option>
                            {danhSachKhuyenMai.map(km => (
                                <option key={km.ma} value={km.ma}>{km.tenKhuyenMai}</option>
                            ))}
                        </select>
                    </div>
                    {/* Phần sử dụng điểm tích lũy (chỉ hiện nếu có khách hàng và điểm) */}
                    {khachHang && khachHang.diemTichLuy > 0 && (
                        <div className="form-group points-section">
                            <label htmlFor="diemSuDung">Dùng điểm tích lũy (Hiện có: {khachHang.diemTichLuy})</label>
                            <div className="points-input-group">
                                {/* Thanh trượt để chọn điểm */}
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPointsToUse}
                                    value={diemSuDung}
                                    onChange={handleDiemChange}
                                    className="points-slider"
                                />
                                {/* Input số để nhập điểm chính xác */}
                                <input
                                    type="number"
                                    value={diemSuDung}
                                    onChange={handleDiemChange}
                                    className="points-input"
                                />
                            </div>
                            <small>Bạn có thể dùng tối đa {maxPointsToUse} điểm, tương đương giảm {formatCurrency(maxPointsToUse * POINT_TO_VND_RATE)}.</small>
                        </div>
                    )}
                    {/* Phần ghi chú đơn hàng */}
                    <div className="form-group">
                        <label htmlFor="ghiChu">Ghi chú đơn hàng</label>
                        <textarea id="ghiChu" rows={3} value={ghiChu} onChange={(e) => setGhiChu(e.target.value)}></textarea>
                    </div>
                </div>
                {/* Phần footer modal hiển thị tổng tiền và nút xác nhận */}
                <div className="modal-footer">
                    <div className="tinh-tien-section">
                        <div><span>Tạm tính:</span> <span>{formatCurrency(subTotal)}</span></div>
                        {phuPhi > 0 && <div className="surcharge"><span>Phụ phí phòng VIP (10%):</span> <span>+ {formatCurrency(phuPhi)}</span></div>}
                        {giamGiaKM > 0 && <div className="discount"><span>Khuyến mãi:</span> <span>- {formatCurrency(giamGiaKM)}</span></div>}
                        {giamGiaTuDiem > 0 && <div className="discount"><span>Giảm giá từ điểm:</span> <span>- {formatCurrency(giamGiaTuDiem)}</span></div>}
                        <hr className="summary-hr"/>
                        <div className="final-total"><span>Tổng cộng:</span> <span>{formatCurrency(finalTotal)}</span></div>
                    </div>
                    <button className="xac-nhan-btn" onClick={handleConfirm}>Xác nhận Thanh toán</button>
                </div>
            </div>
        </div>
    );
    // #endregion
}

// #region Helper Functions
/**
 * @summary Hàm trợ giúp để định dạng giá trị số thành tiền tệ Việt Nam Đồng (VND).
 * @param {number} value Giá trị số cần định dạng.
 * @returns {string} Chuỗi định dạng tiền tệ.
 */
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
// #endregion

export default ModalThanhToan;