import { useState, useEffect, useCallback, useMemo } from 'react';
import { getLichSuDonHang, getDoanhThuLoiNhuan, getBillDetailsForReportApi } from '../../api/baoCaoApi';
import type { ChiTietDonHangDayDu, DoanhThuLoiNhuan } from '../../interfaces/BaoCao';
import type { BillDto } from '../../interfaces/Bill';

import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangBaoCao.css';
import BillModal from '../../components/BillModal';
import BaoCaoHieuQuaKinhDoanh from './BaoCaoHieuQuaKinhDoanh';

const formatDateToYMD = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const getPeriodDates = (period: 'week' | 'month') => {
    const now = new Date();
    let startDate: Date;
    if (period === 'week') {
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startDate = firstDayOfWeek;
    } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return { start: formatDateToYMD(startDate), end: formatDateToYMD(new Date()) };
};

interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

function TrangBaoCao() {
    const [fromDate, setFromDate] = useState(formatDateToYMD(new Date()));
    const [toDate, setToDate] = useState(formatDateToYMD(new Date()));
    const [lichSuData, setLichSuData] = useState<ChiTietDonHangDayDu[]>([]);
    const [thongKeData, setThongKeData] = useState<DoanhThuLoiNhuan | null>(null);

    const [loading, setLoading] = useState(true);
    const [isComponentLoading, setIsComponentLoading] = useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [billData, setBillData] = useState<BillDto | null>(null);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);

    const showMessage = useCallback((text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => setUiMessage(null), 3500);
        return () => clearTimeout(timer);
    }, []);

    const groupedData = useMemo(() => lichSuData.reduce((acc, item) => {
        (acc[item.maDonHang] = acc[item.maDonHang] || []).push(item);
        return acc;
    }, {} as Record<number, ChiTietDonHangDayDu[]>), [lichSuData]);

    const fetchAllReports = useCallback(async (start: string, end: string) => {
        setLoading(true);
        showMessage('', 'info');
        try {
            const [lichSuResult, thongKeResult] = await Promise.all([
                getLichSuDonHang(start, end),
                getDoanhThuLoiNhuan(start, end)
            ]);
            setLichSuData(lichSuResult);
            setThongKeData(thongKeResult);
            if (lichSuResult.length === 0) {
                showMessage('Không có dữ liệu báo cáo cho khoảng thời gian này.', 'info');
            }
        } catch (err) {
            showMessage('Tải báo cáo thất bại. Vui lòng kiểm tra lại kết nối server.', 'error');
            console.error(err);
            setLichSuData([]);
            setThongKeData(null);
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    useEffect(() => {
        const today = formatDateToYMD(new Date());
        fetchAllReports(today, today);
    }, [fetchAllReports]);

    const handleFilterClick = (period: 'week' | 'month' | 'custom') => {
        if (loading || isComponentLoading) return;
        if (period === 'custom') {
            fetchAllReports(fromDate, toDate);
        } else {
            const { start, end } = getPeriodDates(period);
            setFromDate(start);
            setToDate(end);
            fetchAllReports(start, end);
        }
    };

    const handlePrintBill = async (maDonHang: number) => {
        setLoading(true);
        try {
            const data = await getBillDetailsForReportApi(maDonHang);
            setBillData(data);
            setIsBillModalOpen(true);
        } catch (error) {
            console.error("Lỗi tải thông tin hóa đơn:", error);
            showMessage("Không thể tải thông tin hóa đơn.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    return (
        <div className="quanly-container">
            <h1>Báo cáo Doanh thu & Lợi nhuận</h1>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}

            <div className="section filter-section">
                <div className="filter-controls">
                    <div className="date-pickers">
                        <div className="form-group"> {/* Added form-group for better layout */}
                            <label htmlFor="fromDate">Từ ngày:</label>
                            <input
                                id="fromDate"
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                disabled={loading || isComponentLoading}
                                className="input-field" // Added for consistent input styling
                            />
                        </div>
                        <span style={{ margin: '0 5px', color: 'var(--text-color-light)' }}>đến</span> {/* Style for "đến" text */}
                        <div className="form-group"> {/* Added form-group for better layout */}
                            <label htmlFor="toDate">Đến ngày:</label>
                            <input
                                id="toDate"
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                disabled={loading || isComponentLoading}
                                className="input-field" // Added for consistent input styling
                            />
                        </div>
                    </div>
                    <div className="action-buttons">
                        <button
                            onClick={() => handleFilterClick('week')}
                            disabled={loading || isComponentLoading}
                            className="action-btn secondary-btn" // Changed to secondary-btn
                        >
                            Tuần này
                        </button>
                        <button
                            onClick={() => handleFilterClick('month')}
                            disabled={loading || isComponentLoading}
                            className="action-btn secondary-btn" // Changed to secondary-btn
                        >
                            Tháng này
                        </button>
                        <button
                            onClick={() => handleFilterClick('custom')}
                            disabled={loading || isComponentLoading}
                            className="action-btn primary-btn" // Changed to primary-btn for emphasis
                            style={{ minWidth: '150px' }} // Added inline style for consistent button width
                        >
                            {(loading || isComponentLoading) ? 'Đang tải...' : 'Xem Báo cáo'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card revenue-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)' }}> {/* Inline style for icon background */}
                        <i className="fas fa-money-bill-wave" style={{ color: '#28a745' }}></i> {/* Icon for Revenue */}
                    </div>
                    <div>
                        <h4>Tổng Doanh Thu</h4>
                        <p style={{ color: '#28a745' }}>{formatCurrency(thongKeData?.totalRevenue ?? 0)}</p>
                    </div>
                </div>
                <div className="stat-card cogs-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}> {/* Inline style for icon background */}
                        <i className="fas fa-boxes" style={{ color: '#ffc107' }}></i> {/* Icon for COGS */}
                    </div>
                    <div>
                        <h4>Giá Vốn (Nguyên Liệu)</h4>
                        <p style={{ color: '#ffc107' }}>{formatCurrency(thongKeData?.totalCOGS ?? 0)}</p>
                    </div>
                </div>
                <div className="stat-card salary-card">
                    <div className="stat-icon" style={{ backgroundColor: 'rgba(253, 126, 20, 0.1)' }}> {/* Inline style for icon background */}
                        <i className="fas fa-users" style={{ color: '#fd7e14' }}></i> {/* Icon for Salaries */}
                    </div>
                    <div>
                        <h4>Chi Phí Lương</h4>
                        <p style={{ color: '#fd7e14' }}>{formatCurrency(thongKeData?.totalSalaries ?? 0)}</p>
                    </div>
                </div>
                <div className={`stat-card profit-card ${thongKeData?.totalProfit ?? 0 >= 0 ? 'positive' : 'negative'}`}>
                    <div className="stat-icon" style={{ backgroundColor: thongKeData?.totalProfit ?? 0 >= 0 ? 'rgba(0, 123, 255, 0.1)' : 'rgba(220, 53, 69, 0.1)' }}> {/* Dynamic icon background */}
                        <i className={`fas ${thongKeData?.totalProfit ?? 0 >= 0 ? 'fa-chart-line' : 'fa-chart-simple'}`} style={{ color: thongKeData?.totalProfit ?? 0 >= 0 ? '#007bff' : '#dc3545' }}></i> {/* Dynamic icon color */}
                    </div>
                    <div>
                        <h4>Lợi Nhuận Gộp</h4>
                        <p style={{ color: thongKeData?.totalProfit ?? 0 >= 0 ? '#007bff' : '#dc3545' }}>{formatCurrency(thongKeData?.totalProfit ?? 0)}</p>
                    </div>
                </div>
            </div>

            <BaoCaoHieuQuaKinhDoanh
                fromDate={fromDate}
                toDate={toDate}
                setParentLoading={setIsComponentLoading}
            />

            <div className="section full-width">
                <h2>Lịch sử Đơn hàng chi tiết</h2>
                <div className="item-list scrollable-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '8%' }}>Mã ĐH</th>
                                <th style={{ width: '15%' }}>Thời gian</th>
                                <th style={{ width: '15%' }}>Khách hàng</th>
                                <th style={{ width: '20%' }}>Sản phẩm</th>
                                <th className="text-center" style={{ width: '5%' }}>SL</th>
                                <th className="text-right" style={{ width: '12%' }}>Đơn giá</th>
                                <th className="text-right" style={{ width: '12%' }}>Thành tiền</th>
                                <th className="text-right" style={{ width: '8%' }}>Tổng ĐH</th>
                                <th style={{ width: '5%' }}>In Bill</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(loading || isComponentLoading) && (
                                <tr><td colSpan={9} className="text-center">Đang tải dữ liệu...</td></tr>
                            )}
                            {!(loading || isComponentLoading) && Object.keys(groupedData).length === 0 && (
                                <tr className="no-data-row"><td colSpan={9} className="text-center text-secondary">Không có đơn hàng nào đã thanh toán trong khoảng thời gian này.</td></tr>
                            )}
                            {Object.values(groupedData).map((orderGroup) => (
                                orderGroup.map((item, itemIndex) => (
                                    <tr key={`${item.maDonHang}-${itemIndex}`}>
                                        {itemIndex === 0 && <td rowSpan={orderGroup.length} className="cell-group-start" style={{ verticalAlign: 'middle' }}>{item.maDonHang}</td>}
                                        {itemIndex === 0 && <td rowSpan={orderGroup.length} className="cell-group-start" style={{ verticalAlign: 'middle' }}>{new Date(item.thoiGianDat).toLocaleString('vi-VN')}</td>}
                                        {itemIndex === 0 && <td rowSpan={orderGroup.length} className="cell-group-start" style={{ verticalAlign: 'middle' }}>{item.tenKhachHang || 'Khách vãng lai'}</td>}
                                        <td>{item.tenSP}</td>
                                        <td className="text-center">{item.soLuong}</td>
                                        <td className="text-right">{formatCurrency(item.giaBan)}</td>
                                        <td className="text-right">{formatCurrency(item.thanhTienTungSP)}</td>
                                        {itemIndex === 0 && <td rowSpan={orderGroup.length} className="cell-group-start text-danger" style={{ fontWeight: 'bold', verticalAlign: 'middle' }}>{formatCurrency(item.tongTienDonHangFinal)}</td>}
                                        {itemIndex === 0 && <td rowSpan={orderGroup.length} className="cell-group-start" style={{ verticalAlign: 'middle' }}><button className="action-btn info-btn" onClick={() => handlePrintBill(item.maDonHang)}>In Bill</button></td>}
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isBillModalOpen && <BillModal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} billData={billData} />}
        </div>
    );
}

export default TrangBaoCao;