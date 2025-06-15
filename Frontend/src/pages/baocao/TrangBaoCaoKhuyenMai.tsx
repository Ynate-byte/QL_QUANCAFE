import { useState, useEffect } from 'react';
import { getHieuQuaKhuyenMai } from '../../api/baoCaoApi';
import type { KhuyenMaiHieuQua } from '../../interfaces/BaoCao';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangBaoCao.css';

// Interface cho cấu trúc thông báo UI
interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

function TrangBaoCaoKhuyenMai() {
    const [data, setData] = useState<KhuyenMaiHieuQua[]>([]);
    const [loading, setLoading] = useState(true);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);

    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => {
            setUiMessage(null);
        }, 3500);
        return () => clearTimeout(timer);
    };

    useEffect(() => {
        setLoading(true);
        getHieuQuaKhuyenMai()
            .then(setData)
            .catch(error => {
                console.error("Lỗi tải báo cáo hiệu quả khuyến mãi:", error);
                showMessage("Không thể tải báo cáo hiệu quả khuyến mãi.", 'error');
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="quanly-container">
            <h1>Báo cáo Hiệu quả Khuyến mãi</h1>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
            <div className="section full-width">
                <div className="item-list scrollable-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '15%' }}>Mã KM</th> {/* Adjusted width */}
                                <th style={{ width: '40%' }}>Tên Chương trình Khuyến mãi</th> {/* Adjusted width */}
                                <th className="text-center" style={{ width: '20%' }}>Số đơn hàng đã áp dụng</th> {/* Adjusted width */}
                                <th className="text-right" style={{ width: '25%' }}>Tổng Doanh thu mang lại</th> {/* Adjusted width */}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="text-center">Đang tải báo cáo khuyến mãi...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={4} className="text-center text-secondary">Không có dữ liệu hiệu quả khuyến mãi.</td></tr>
                            ) : (
                                data.map(item => (
                                    <tr key={item.maKhuyenMai}>
                                        <td>{item.maKhuyenMai}</td>
                                        <td>{item.tenKhuyenMai}</td>
                                        <td className="text-center">{item.soDonHangApDung}</td>
                                        <td className="text-right text-success">
                                            {item.tongDoanhThu.toLocaleString('vi-VN')} đ
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
}

export default TrangBaoCaoKhuyenMai;