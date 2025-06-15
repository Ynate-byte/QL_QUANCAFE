import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getCanhBaoTonKho, getDoanhThuHomNay, getSanPhamBanChay, getDoanhThu7Ngay, getTyLeDanhMuc, getSinhNhatHomNay } from '../../api/dashboardApi';
import type { NguyenLieuCanhBao, DoanhThuTrongNgay, SanPhamBanChay, DoanhThuTheoNgay as DoanhThu7Ngay, TyLeDanhMuc } from '../../interfaces/Dashboard';
import type { KhachHang } from '../../interfaces/KhachHang';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangDashboard.css';

// #region Widget: Cảnh báo Tồn kho
/**
 * @summary Widget hiển thị danh sách các nguyên liệu có tồn kho thấp.
 * Cho phép tạo phiếu nhập đề xuất từ danh sách cảnh báo.
 */
function CanhBaoTonKhoWidget() {
    // #region State
    const [alerts, setAlerts] = useState<NguyenLieuCanhBao[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // #endregion

    // #region Effects
    useEffect(() => {
        setLoading(true);
        getCanhBaoTonKho()
            .then(setAlerts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    // #endregion

    // #region Event Handlers
    const handleTaoPhieuNhapDeXuat = () => {
        const suggestedItems = alerts.map(item => ({
            maNguyenLieu: String(item.maNguyenLieu),
            soLuongNhap: 50, // Số lượng đề xuất mặc định
            donGiaNhap: 0
        }));
        navigate('/quan-ly-kho', { state: { suggestedItems } });
    };
    // #endregion

    // #region Render
    return (
        <div className="dashboard-card inventory-alert-card">
            <div className="card-header">
                <h2>Cảnh báo Tồn kho thấp</h2>
                {alerts.length > 0 &&
                    <button className="action-btn add-btn small-btn" onClick={handleTaoPhieuNhapDeXuat} disabled={loading}>
                        {loading ? 'Đang tải...' : 'Tạo Phiếu nhập đề xuất'}
                    </button>
                }
            </div>
            {loading ? (
                <p className="text-center text-secondary">Đang tải cảnh báo...</p>
            ) : alerts.length === 0 ? (
                <p className="text-center text-success">Tồn kho ổn định. Không có cảnh báo nào.</p>
            ) : (
                <ul className="inventory-alert-list">
                    {alerts.map(item => (
                        <li key={item.maNguyenLieu} className="inventory-alert-item">
                            <div className="item-name">{item.tenNguyenLieu}</div>
                            <div className="item-details">
                                Chỉ còn <strong>{item.soLuongTon} {item.donViTinh}</strong> - {item.chiTietCanhBao}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
    // #endregion
}
// #endregion

// #region Widget: Doanh thu Hôm nay
/**
 * @summary Widget hiển thị tổng doanh thu và số đơn hàng của ngày hôm nay.
 */
function DoanhThuWidget() {
    // #region State
    const [data, setData] = useState<DoanhThuTrongNgay | null>(null);
    const [loading, setLoading] = useState(true);
    // #endregion

    // #region Effects
    useEffect(() => {
        setLoading(true);
        getDoanhThuHomNay()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    // #endregion

    // #region Render
    return (
        <div className="dashboard-card stat-card revenue-card">
            <div className="card-header">
                <h2>Doanh thu Hôm nay</h2>
            </div>
            {loading ? (
                <p className="text-center text-secondary">Đang tải...</p>
            ) : data ? (
                <>
                    <div className="stat-value">{data.tongDoanhThu.toLocaleString('vi-VN')} đ</div>
                    <div className="stat-label">{data.soDonHang} đơn hàng</div>
                </>
            ) : (
                <p className="text-center text-secondary">Chưa có dữ liệu.</p>
            )}
        </div>
    );
    // #endregion
}
// #endregion

// #region Widget: Sản phẩm Bán chạy
/**
 * @summary Widget hiển thị danh sách 5 sản phẩm bán chạy nhất trong tuần.
 */
function SanPhamBanChayWidget() {
    // #region State
    const [data, setData] = useState<SanPhamBanChay[]>([]);
    const [loading, setLoading] = useState(true);
    // #endregion

    // #region Effects
    useEffect(() => {
        setLoading(true);
        getSanPhamBanChay(5) // Lấy top 5 sản phẩm
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    // #endregion

    // #region Render
    return (
        <div className="dashboard-card bestseller-card">
            <div className="card-header">
                <h2>Top 5 Sản phẩm Bán chạy (Tuần)</h2>
            </div>
            {loading ? (
                <p className="text-center text-secondary">Đang tải...</p>
            ) : data.length === 0 ? (
                <p className="text-center text-secondary">Không có dữ liệu sản phẩm bán chạy.</p>
            ) : (
                <ul className="bestseller-list">
                    {data.map(item => (
                        <li key={item.tenSP} className="bestseller-item">
                            <span className="name">{item.tenSP}</span>
                            <span className="count">{item.soLuongBan}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
    // #endregion
}
// #endregion

// #region Widget: Biểu đồ Doanh thu 7 ngày
/**
 * @summary Widget hiển thị biểu đồ cột doanh thu 7 ngày gần nhất.
 */
function DoanhThuChartWidget() {
    // #region State
    const [data, setData] = useState<DoanhThu7Ngay[]>([]);
    const [loading, setLoading] = useState(true);
    // #endregion

    // #region Effects
    useEffect(() => {
        setLoading(true);
        getDoanhThu7Ngay().then(chartData => {
            // Định dạng lại ngày để hiển thị trên trục X
            const formattedData = chartData.map(d => ({ ...d, ngay: new Date(d.ngay).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) }));
            setData(formattedData);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    // #endregion

    // #region Render
    return (
        <div className="dashboard-card full-width chart-card">
            <div className="card-header">
                <h2>Doanh thu 7 ngày gần nhất</h2>
            </div>
            {loading ? (
                <p className="text-center text-secondary">Đang tải biểu đồ...</p>
            ) : data.length === 0 ? (
                <p className="text-center text-secondary">Không có dữ liệu doanh thu cho biểu đồ.</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                        <XAxis dataKey="ngay" axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                        {/* Định dạng giá trị trên trục Y cho dễ đọc (ví dụ: 100000 -> 100k) */}
                        <YAxis width={80} tickFormatter={(value) => `${(value as number / 1000).toLocaleString('vi-VN')}k`} />
                        <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} formatter={(value) => [`${(value as number).toLocaleString('vi-VN')} đ`, 'Doanh thu']} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="tongDoanhThu" fill={getComputedStyle(document.documentElement).getPropertyValue('--primary-color')} name="Doanh thu" radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
    // #endregion
}
// #endregion

// #region Widget: Biểu đồ Tỷ lệ Danh mục
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6666', '#66B2FF']; // Thêm màu sắc cho biểu đồ Pie
/**
 * @summary Widget hiển thị biểu đồ tròn về tỷ lệ bán hàng theo danh mục trong tuần.
 */
function DanhMucChartWidget() {
    // #region State
    const [data, setData] = useState<TyLeDanhMuc[]>([]);
    const [loading, setLoading] = useState(true);
    // #endregion

    // #region Effects
    useEffect(() => {
        setLoading(true);
        getTyLeDanhMuc()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    // #endregion

    // #region Render
    return (
        <div className="dashboard-card full-width chart-card">
            <div className="card-header">
                <h2>Tỷ lệ bán theo Danh mục (Tuần)</h2>
            </div>
            {loading ? (
                <p className="text-center text-secondary">Đang tải biểu đồ...</p>
            ) : data.length === 0 ? (
                <p className="text-center text-secondary">Không có dữ liệu danh mục để tạo biểu đồ.</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="soLuongBan"
                            nameKey="tenDanhMuc"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} sản phẩm`, 'Số lượng bán']} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
    // #endregion
}
// #endregion

// #region Widget: Sinh nhật khách hàng
/**
 * @summary Widget hiển thị danh sách khách hàng có sinh nhật trong ngày hôm nay.
 */
function SinhNhatWidget() {
    // #region State
    const [khachHangs, setKhachHangs] = useState<KhachHang[]>([]);
    const [loading, setLoading] = useState(true);
    // #endregion

    // #region Effects
    useEffect(() => {
        setLoading(true);
        getSinhNhatHomNay()
            .then(setKhachHangs)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    // #endregion

    // #region Render
    return (
        <div className="dashboard-card birthday-card">
            <div className="card-header">
                <h2>Chúc mừng Sinh nhật!</h2>
            </div>
            {loading ? (
                <p className="text-center text-secondary">Đang tải danh sách sinh nhật...</p>
            ) : khachHangs.length === 0 ? (
                <p className="text-center text-secondary">Không có sinh nhật khách hàng nào hôm nay.</p>
            ) : (
                <ul className="bestseller-list"> {/* Tái sử dụng list style */}
                    {khachHangs.map(item => (
                        <li key={item.ma} className="bestseller-item">
                            <span className="name">🎂 {item.hoTen}</span>
                            <span className="count">{item.soDienThoai || 'N/A'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
    // #endregion
}
// #endregion

/**
 * @summary Component chính cho trang Dashboard (Bảng điều khiển).
 * Tổng hợp các widget khác nhau để cung cấp cái nhìn tổng quan về hoạt động kinh doanh.
 */
function TrangDashboard() {
    return (
        <div className="quanly-container">
            <h1>Bảng điều khiển</h1>
            <div className="dashboard-grid">
                <DoanhThuWidget />
                <SanPhamBanChayWidget />
                <SinhNhatWidget />
                <CanhBaoTonKhoWidget />
                <DoanhThuChartWidget />
                <DanhMucChartWidget />
            </div>
        </div>
    );
}

export default TrangDashboard;