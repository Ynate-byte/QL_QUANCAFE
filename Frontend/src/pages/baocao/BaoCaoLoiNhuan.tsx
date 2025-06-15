import { useState, useEffect, useCallback } from 'react';
import { getLoiNhuanSanPham } from '../../api/baoCaoApi';
import type { LoiNhuanSanPham } from '../../interfaces/BaoCao';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangBaoCao.css';

// Interface cho cấu trúc thông báo UI
interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

function BaoCaoLoiNhuan() {
    const [data, setData] = useState<LoiNhuanSanPham[]>([]);
    const [loading, setLoading] = useState(true);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);

    // Hàm hiển thị thông báo
    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => {
            setUiMessage(null);
        }, 3500);
        return () => clearTimeout(timer);
    };

    // Hàm tải dữ liệu
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getLoiNhuanSanPham();
            setData(result);
        } catch (error) {
            console.error("Lỗi khi tải báo cáo lợi nhuận sản phẩm:", error);
            showMessage("Không thể tải báo cáo lợi nhuận sản phẩm.", 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Helper để format tiền tệ
    const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' đ';

    return (
        <div className="quanly-container">
            <h1>Phân tích Lợi nhuận Gộp trên từng Sản phẩm</h1>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
            
            <div className="report-section full-width">
                <h2>Chi tiết Lợi nhuận Ước tính</h2>
                <p className="section-description">
                    Báo cáo này phân tích lợi nhuận gộp ước tính cho mỗi sản phẩm dựa trên giá bán hiện tại và chi phí nguyên liệu đã nhập gần nhất.
                </p>
                <div className="item-list scrollable-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã SP</th>
                                <th>Tên Sản Phẩm</th>
                                <th className="text-right">Giá Bán Hiện tại</th>
                                <th className="text-right">Chi Phí Nguyên Liệu / Đơn vị</th>
                                <th className="text-right">Lợi Nhuận Gộp / Đơn vị</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center">Đang tải báo cáo...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={5} className="text-center text-secondary">Không có dữ liệu để phân tích.</td></tr>
                            ) : (
                                data.map(item => (
                                    <tr key={item.maSanPham}>
                                        <td>{item.maSanPham}</td>
                                        <td>{item.tenSP}</td>
                                        <td className="text-right">{formatCurrency(item.giaBanHienTai)}</td>
                                        <td className="text-right">{formatCurrency(item.chiPhiNguyenLieuUocTinh)}</td>
                                        <td className={`text-right ${item.loiNhuanGopUocTinhPerUnit >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {formatCurrency(item.loiNhuanGopUocTinhPerUnit)}
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

export default BaoCaoLoiNhuan;
