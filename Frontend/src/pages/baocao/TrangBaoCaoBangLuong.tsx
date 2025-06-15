import { useState } from 'react';
import { getBangLuong } from '../../api/baoCaoApi';
import type { BangLuong } from '../../interfaces/BaoCao';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangBaoCao.css';

// #region Interfaces
/**
 * @summary Giao diện cho cấu trúc thông báo UI.
 */
interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}
// #endregion

/**
 * @summary Component hiển thị trang Báo cáo Lương nhân viên.
 * Cho phép xem bảng lương theo tháng và năm.
 */
function TrangBaoCaoBangLuong() {
    // #region State Management
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [data, setData] = useState<BangLuong[]>([]);
    const [loading, setLoading] = useState(false);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);
    // #endregion

    // #region Helper Functions
    /**
     * @summary Hiển thị thông báo UI và tự động ẩn sau 3.5 giây.
     * @param {string} text Nội dung thông báo.
     * @param {UIMessage['type']} type Loại thông báo ('success', 'error', 'info').
     */
    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => {
            setUiMessage(null);
        }, 3500);
        return () => clearTimeout(timer); // Trả về hàm cleanup cho useEffect/useCallback
    };
    // #endregion

    // #region Event Handlers
    /**
     * @summary Xử lý sự kiện khi người dùng nhấn nút "Xem Bảng lương".
     * Gọi API để lấy dữ liệu bảng lương và cập nhật trạng thái UI.
     */
    const handleXemBaoCao = async () => {
        setLoading(true);
        showMessage('', 'info'); // Xóa thông báo cũ
        try {
            const result = await getBangLuong(month, year);
            setData(result);
            showMessage('Đã tải báo cáo lương thành công!', 'success');
        } catch (error) {
            console.error("Lỗi tải báo cáo lương:", error);
            showMessage('Tải báo cáo lương thất bại. Vui lòng kiểm tra lại kết nối server.', 'error');
        } finally {
            setLoading(false);
        }
    };
    // #endregion

    // #region Render Component
    return (
        <div className="quanly-container">
            <h1>Báo cáo Lương nhân viên</h1>
            {/* Hiển thị thông báo UI */}
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}

            {/* Phần điều khiển lọc theo tháng/năm */}
            <div className="section filter-section" style={{ marginBottom: '20px' }}>
                <div className="filter-controls">
                    <div className="date-pickers">
                        <div className="form-group">
                            <label htmlFor="monthInput">Tháng:</label>
                            <input
                                id="monthInput"
                                type="number"
                                min="1"
                                max="12"
                                value={month}
                                onChange={e => setMonth(Number(e.target.value))}
                                disabled={loading}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="yearInput">Năm:</label>
                            <input
                                id="yearInput"
                                type="number"
                                min="2020"
                                max="2030"
                                value={year}
                                onChange={e => setYear(Number(e.target.value))}
                                disabled={loading}
                                className="input-field"
                            />
                        </div>
                    </div>
                    <div className="action-buttons">
                        <button
                            onClick={handleXemBaoCao}
                            disabled={loading}
                            className="action-btn primary-btn"
                            style={{ minWidth: '150px' }}
                        >
                            {loading ? 'Đang tính...' : 'Xem Bảng lương'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Phần hiển thị bảng lương */}
            <div className="section full-width">
                <div className="item-list scrollable-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>Mã NV</th>
                                <th style={{ width: '30%' }}>Họ và Tên</th>
                                <th className="text-right" style={{ width: '20%' }}>Lương/giờ</th>
                                <th className="text-center" style={{ width: '20%' }}>Tổng Số Giờ Làm</th>
                                <th className="text-right" style={{ width: '20%' }}>Lương Thực nhận (ước tính)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center">Đang tải bảng lương...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={5} className="text-center text-secondary">Chọn tháng/năm và nhấn xem để có dữ liệu.</td></tr>
                            ) : (
                                data.map(item => (
                                    <tr key={item.maNhanVien}>
                                        <td>{item.maNhanVien}</td>
                                        <td>{item.hoTen}</td>
                                        <td className="text-right">{(item.luongTheoGio ?? 0).toLocaleString('vi-VN')} đ</td>
                                        <td className="text-center">{item.tongSoGioLam}</td>
                                        <td className="text-right text-success">
                                            {item.luongThucNhan.toLocaleString('vi-VN')} đ
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
    // #endregion
}

export default TrangBaoCaoBangLuong;