import { useState, useEffect, useCallback, useMemo } from 'react';
// SỬA LỖI: Đường dẫn đúng là đi lên 2 cấp để vào 'src'
import { getPhanHois, updatePhanHoiStatus } from '../../api/phanHoiApi';
import type { PhanHoiKhachHang } from '../../interfaces/PhanHoi';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangQuanLyPhanHoi.css'; 
import { useAuth } from '../../context/AuthContext';

interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

interface Filters {
    tuKhoa: string;
    trangThai: string;
    loai: string;
}

function TrangQuanLyPhanHoi() {
    const [danhSach, setDanhSach] = useState<PhanHoiKhachHang[]>([]);
    const [loading, setLoading] = useState(true);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);
    const { auth } = useAuth();

    const [filters, setFilters] = useState<Filters>({
        tuKhoa: '',
        trangThai: 'Tất cả',
        loai: 'Tất cả',
    });

    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => setUiMessage(null), 3500);
        return () => clearTimeout(timer);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPhanHois(filters);
            setDanhSach(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách phản hồi:", error);
            showMessage("Không thể tải danh sách phản hồi. Vui lòng kiểm tra kết nối.", 'error');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData();
        }, 500); 

        return () => clearTimeout(handler);
    }, [fetchData]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            tuKhoa: '',
            trangThai: 'Tất cả',
            loai: 'Tất cả',
        });
    };

    const handleUpdateStatus = async (ma: number, trangThai: string) => {
        const maNhanVienHienTai = auth?.maNhanVien ?? 0;
        if (maNhanVienHienTai === 0) {
            showMessage("Lỗi: Không tìm thấy thông tin nhân viên đăng nhập.", 'error');
            return;
        }

        if (!window.confirm(`Bạn có chắc muốn chuyển trạng thái phản hồi #${ma} thành "Đã xử lý" không?`)) return;

        setLoading(true);
        try {
            const res = await updatePhanHoiStatus(ma, trangThai, maNhanVienHienTai);
            if (res.ok) {
                showMessage("Cập nhật trạng thái thành công!", 'success');
                fetchData(); 
            } else {
                const errorText = await res.text();
                showMessage(`Cập nhật thất bại: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái phản hồi:", error);
            showMessage("Lỗi hệ thống khi cập nhật trạng thái.", 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const summary = useMemo(() => {
        return danhSach.reduce((acc, item) => {
            if (item.trangThai_XuLy === 'ChuaXuLy') {
                acc.chuaXuLy += 1;
            }
            acc.tongSo += 1;
            return acc;
        }, { chuaXuLy: 0, tongSo: 0 });
    }, [danhSach]);

    return (
        <div className="quanly-container">
            <h1>Quản lý Phản hồi Khách hàng</h1>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}

            <div className="manager-sections-grid-phanhoi">
                <div className="section filter-section">
                    <h2>Bộ lọc & Tìm kiếm</h2>
                    <div className="filter-group">
                        <label htmlFor="tuKhoa">Tìm theo nội dung/khách hàng</label>
                        <input
                            type="text"
                            id="tuKhoa"
                            name="tuKhoa"
                            placeholder="Nhập từ khóa..."
                            value={filters.tuKhoa}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="trangThai">Trạng thái xử lý</label>
                        <select
                            id="trangThai"
                            name="trangThai"
                            value={filters.trangThai}
                            onChange={handleFilterChange}
                        >
                            <option value="Tất cả">Tất cả</option>
                            <option value="ChuaXuLy">Chưa xử lý</option>
                            <option value="DaXuLy">Đã xử lý</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="loai">Loại phản hồi</label>
                        <select
                            id="loai"
                            name="loai"
                            value={filters.loai}
                            onChange={handleFilterChange}
                        >
                            <option value="Tất cả">Tất cả</option>
                            <option value="Góp ý">Góp ý</option>
                            <option value="Khiếu nại">Khiếu nại</option>
                            <option value="Khen ngợi">Khen ngợi</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                    <button className="action-btn" onClick={handleResetFilters}>Xóa bộ lọc</button>
                    
                    <div className="feedback-summary">
                        <h3>Tóm tắt</h3>
                        <p><strong>Tổng số phản hồi:</strong> {summary.tongSo}</p>
                        <p><strong>Chưa xử lý:</strong> <span className="pending-count">{summary.chuaXuLy}</span></p>
                    </div>
                </div>

                <div className="section">
                    <h2>Danh sách Phản hồi</h2>
                    <div className="item-list scrollable-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã PH</th>
                                    <th>Thời gian</th>
                                    <th>Khách hàng</th>
                                    <th>Loại</th>
                                    <th style={{ width: '35%' }}>Nội dung</th>
                                    <th>Trạng thái</th>
                                    <th>NV Xử lý</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={8} className="text-center">Đang tải dữ liệu...</td></tr>
                                ) : danhSach.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center">Không có phản hồi nào khớp với bộ lọc.</td></tr>
                                ) : (
                                    danhSach.map(item => (
                                        <tr key={item.ma}>
                                            <td>{item.ma}</td>
                                            <td>{new Date(item.thoiGian_PhanHoi).toLocaleString('vi-VN')}</td>
                                            <td>{item.tenKhachHang || 'Khách vãng lai'}</td>
                                            <td>{item.loai_PhanHoi}</td>
                                            <td className="feedback-content-cell">{item.noiDung}</td>
                                            <td className={`status-cell status-${item.trangThai_XuLy.toLowerCase().replace(' ', '-')}`}>
                                                {item.trangThai_XuLy}
                                            </td>
                                            <td>{item.tenNhanVienXuLy || 'Chưa có'}</td>
                                            <td className="actions">
                                                {item.trangThai_XuLy !== 'DaXuLy' && (
                                                    <button
                                                        className="action-btn save-btn"
                                                        onClick={() => handleUpdateStatus(item.ma, 'DaXuLy')}
                                                        disabled={loading}
                                                    >
                                                        Đã xử lý
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TrangQuanLyPhanHoi;
