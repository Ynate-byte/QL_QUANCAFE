import { useState, useEffect, type FormEvent, type ChangeEvent, useCallback } from 'react';
import { getKhuyenMais, addKhuyenMai, updateKhuyenMai, deleteKhuyenMai } from '../../api/khuyenMaiApi';
import type { KhuyenMai } from '../../interfaces/KhuyenMai';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangQuanLyKhuyenMai.css';

// #region --- Interfaces and Initial States ---
interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

const initialFormState: Omit<KhuyenMai, 'ma' | 'trangThai'> = {
    tenKhuyenMai: '',
    moTa: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    giaTriGiamGia: 0,
    loaiKhuyenMai: 'PhanTram',
};
// #endregion

// #region --- Main Component ---
function TrangQuanLyKhuyenMai() {
    // #region --- States ---
    const [danhSach, setDanhSach] = useState<KhuyenMai[]>([]);
    const [editingItem, setEditingItem] = useState<KhuyenMai | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);
    // #endregion

    // #region --- Functions ---
    /** Hiển thị thông báo tạm thời trên giao diện */
    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => setUiMessage(null), 3500);
        return () => clearTimeout(timer);
    };

    /** Tải danh sách khuyến mãi từ API */
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            setDanhSach(await getKhuyenMais());
        } catch (error) {
            console.error("Lỗi tải danh sách khuyến mãi:", error);
            showMessage("Không thể tải danh sách khuyến mãi. Vui lòng kiểm tra kết nối.", 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    /** Chuẩn bị form để chỉnh sửa một khuyến mãi đã có */
    const handleEdit = (item: KhuyenMai) => {
        setEditingItem(item);
        const formatDateTime = (date: string) => date ? new Date(date).toISOString().substring(0, 16) : '';
        setFormData({
            ...item,
            ngayBatDau: formatDateTime(item.ngayBatDau),
            ngayKetThuc: formatDateTime(item.ngayKetThuc),
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /** Hủy bỏ thao tác chỉnh sửa và reset form */
    const handleCancel = () => {
        setEditingItem(null);
        setFormData(initialFormState);
    };

    /** Xử lý thay đổi trên các trường của form */
    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /** Gửi dữ liệu form để thêm mới hoặc cập nhật */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // --- Logic xác thực dữ liệu ---
        if (!formData.tenKhuyenMai.trim() || !formData.ngayBatDau || !formData.ngayKetThuc || formData.giaTriGiamGia === undefined) {
            showMessage('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error'); return;
        }
        const startDate = new Date(formData.ngayBatDau);
        const endDate = new Date(formData.ngayKetThuc);
        if (endDate <= startDate) {
            showMessage("Ngày kết thúc phải sau ngày bắt đầu.", 'error'); return;
        }
        if (Number(formData.giaTriGiamGia) <= 0 || (formData.loaiKhuyenMai === 'PhanTram' && Number(formData.giaTriGiamGia) > 100)) {
            showMessage("Giá trị giảm giá không hợp lệ.", 'error'); return;
        }

        setLoading(true);
        
        // SỬA LỖI: Bổ sung logic tính toán trạng thái
        const now = new Date();
        let calculatedStatus: KhuyenMai['trangThai'];
        if (now < startDate) {
            calculatedStatus = 'SapDienRa';
        } else if (now >= startDate && now <= endDate) {
            calculatedStatus = 'DangDienRa';
        } else {
            calculatedStatus = 'DaKetThuc';
        }

        const dataToSend = {
            ...formData,
            giaTriGiamGia: Number(formData.giaTriGiamGia),
            trangThai: calculatedStatus, // Thêm trạng thái đã tính toán vào dữ liệu gửi đi
        };

        try {
            const res = editingItem ? await updateKhuyenMai({ ...editingItem, ...dataToSend }) : await addKhuyenMai(dataToSend);
            if (res.ok) {
                showMessage('Thao tác thành công!', 'success');
                handleCancel();
                fetchData();
            } else {
                showMessage(`Thao tác thất bại: ${await res.text()}`, 'error');
            }
        } catch (error) {
            console.error(error);
            showMessage('Lỗi hệ thống khi thực hiện thao tác.', 'error');
        } finally {
            setLoading(false);
        }
    };

    /** Xóa một khuyến mãi */
    const handleDelete = async (ma: number) => {
        if (!window.confirm('Xóa khuyến mãi này? Thao tác này không thể hoàn tác.')) return;
        setLoading(true);
        try {
            const res = await deleteKhuyenMai(ma);
            if (res.ok) {
                showMessage('Xóa khuyến mãi thành công!', 'success');
                fetchData();
            } else {
                showMessage(`Xóa thất bại: ${await res.text()}`, 'error');
            }
        } catch (error) {
            console.error(error);
            showMessage('Lỗi hệ thống khi xóa khuyến mãi.', 'error');
        } finally {
            setLoading(false);
        }
    };
    // #endregion

    // #region --- Effects ---
    useEffect(() => { fetchData(); }, [fetchData]);
    // #endregion

    return (
        <div className="quanly-container">
            <h1>Quản lý Khuyến mãi</h1>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
            <div className="manager-grid-khuyenmai">
                <div className="section">
                    <h3>{editingItem ? `Chỉnh sửa: ${editingItem.tenKhuyenMai}` : 'Thêm Khuyến mãi mới'}</h3>
                    <form onSubmit={handleSubmit} className="crud-form khuyen-mai-form">
                        <div className="form-group"><label htmlFor="tenKhuyenMai">Tên chương trình</label><input id="tenKhuyenMai" name="tenKhuyenMai" value={formData.tenKhuyenMai} onChange={handleFormChange} required disabled={loading} /></div>
                        <div className="form-group full-width"><label htmlFor="moTa">Mô tả</label><textarea id="moTa" name="moTa" value={formData.moTa || ''} onChange={handleFormChange} disabled={loading} rows={4} /></div>
                        
                        <div className="form-row date-fields-row">
                            <div className="form-group"><label htmlFor="ngayBatDau">Ngày bắt đầu</label><input id="ngayBatDau" name="ngayBatDau" type="datetime-local" value={formData.ngayBatDau} onChange={handleFormChange} required disabled={loading} /></div>
                            <div className="form-group"><label htmlFor="ngayKetThuc">Ngày kết thúc</label><input id="ngayKetThuc" name="ngayKetThuc" type="datetime-local" value={formData.ngayKetThuc} onChange={handleFormChange} required disabled={loading} /></div>
                        </div>

                        <div className="form-row">
                            <div className="form-group"><label htmlFor="giaTriGiamGia">Giá trị giảm</label><input id="giaTriGiamGia" name="giaTriGiamGia" type="number" min="0" value={formData.giaTriGiamGia} onChange={handleFormChange} required disabled={loading} /></div>
                            <div className="form-group"><label htmlFor="loaiKhuyenMai">Loại khuyến mãi</label><select id="loaiKhuyenMai" name="loaiKhuyenMai" value={formData.loaiKhuyenMai} onChange={handleFormChange} disabled={loading}><option value="PhanTram">Phần trăm (%)</option><option value="SoTien">Số tiền (VND)</option></select></div>
                        </div>
                        <div className="form-actions"><button type="submit" className="action-btn save-btn" disabled={loading}>{loading ? '...' : (editingItem ? 'Lưu' : 'Thêm')}</button>{editingItem && <button type="button" className="action-btn cancel-btn" onClick={handleCancel} disabled={loading}>Hủy</button>}</div>
                    </form>
                </div>
                <div className="section">
                    <h2>Danh sách Khuyến mãi</h2>
                    <div className="item-list scrollable-table">
                        <table>
                            <thead><tr><th>Mã</th><th>Tên KM</th><th>Bắt đầu</th><th>Kết thúc</th><th>Giá trị</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                            <tbody>
                                {loading ? (<tr><td colSpan={7} className="text-center">Đang tải...</td></tr>) : danhSach.length === 0 ? (<tr><td colSpan={7} className="text-center">Không có khuyến mãi nào.</td></tr>) : (
                                    danhSach.map(item => (
                                        <tr key={item.ma}>
                                            <td>{item.ma}</td>
                                            <td>{item.tenKhuyenMai}</td>
                                            <td>{new Date(item.ngayBatDau).toLocaleString('vi-VN')}</td>
                                            <td>{new Date(item.ngayKetThuc).toLocaleString('vi-VN')}</td>
                                            <td className="text-right">{item.loaiKhuyenMai === 'PhanTram' ? `${item.giaTriGiamGia}%` : `${item.giaTriGiamGia.toLocaleString('vi-VN')}đ`}</td>
                                            <td><span className={`status-cell status-${item.trangThai.toLowerCase().replace(/\s+/g, '-')}`}>{item.trangThai.replace('DienRa', ' diễn ra')}</span></td>
                                            <td className="actions">
                                                <button className="action-btn edit-btn" onClick={() => handleEdit(item)} disabled={loading}>Sửa</button>
                                                <button className="action-btn delete-btn" onClick={() => handleDelete(item.ma)} disabled={loading}>Xóa</button>
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
// #endregion

export default TrangQuanLyKhuyenMai;
