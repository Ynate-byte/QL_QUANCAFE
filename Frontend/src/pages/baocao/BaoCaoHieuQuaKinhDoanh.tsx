import { useState, useEffect, useCallback } from 'react';
import { getProductPerformance } from '../../api/baoCaoApi';
import type { ProductPerformance } from '../../interfaces/BaoCao';
import '../../styles/global/components.css';
import '../../styles/pages/TrangBaoCao.css';

interface Props {
    fromDate: string;
    toDate: string;
    setParentLoading: (isLoading: boolean) => void;
}

// Helper function để format tiền tệ
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' đ';

function BaoCaoHieuQuaKinhDoanh({ fromDate, toDate, setParentLoading }: Props) {
    const [data, setData] = useState<ProductPerformance[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setParentLoading(true);
        try {
            const result = await getProductPerformance(fromDate, toDate);
            setData(result);
        } catch (error) {
            console.error("Lỗi tải báo cáo hiệu quả kinh doanh:", error);
            // Thông báo lỗi có thể được xử lý bởi component cha
        } finally {
            setLoading(false);
            setParentLoading(false);
        }
    }, [fromDate, toDate, setParentLoading]);

    useEffect(() => {
        if (fromDate && toDate) {
            fetchData();
        }
    }, [fetchData, fromDate, toDate]);

    return (
        <div className="report-section full-width">
            <h2>Hiệu quả Kinh doanh theo Sản phẩm</h2>
            <div className="item-list scrollable-table">
                <table>
                    <thead>
                        <tr>
                            <th>Tên Sản Phẩm</th>
                            <th className="text-center">Số Lượng Bán</th>
                            <th className="text-right">Tổng Doanh Thu</th>
                            <th className="text-right">Tổng Chi Phí (Ước tính)</th>
                            <th className="text-right">Lợi Nhuận Gộp (Ước tính)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center">Đang tải báo cáo...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={5} className="text-center text-secondary">Không có dữ liệu cho khoảng thời gian này.</td></tr>
                        ) : (
                            data.map(item => (
                                <tr key={item.maSanPham}>
                                    <td>{item.tenSanPham}</td>
                                    <td className="text-center">{item.soLuongBan}</td>
                                    <td className="text-right">{formatCurrency(item.tongDoanhThu)}</td>
                                    <td className="text-right">{formatCurrency(item.tongChiPhi)}</td>
                                    <td className={`text-right ${item.tongLoiNhuan >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {formatCurrency(item.tongLoiNhuan)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default BaoCaoHieuQuaKinhDoanh;
