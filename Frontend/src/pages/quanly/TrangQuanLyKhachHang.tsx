import { useState, useEffect, type FormEvent, type ChangeEvent, useCallback } from 'react';
import { getKhachHangs, addKhachHang, updateKhachHang, deleteKhachHang } from '../../api/khachHangApi';
import type { KhachHang, KhachHangLoyalty } from '../../interfaces/KhachHang';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangQuanLyKhachHang.css';

interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

const initialFormState: Omit<KhachHang, 'ma' | 'diemTichLuy' | 'ngaySinh'> & { ngaySinh: string | null } = {
    hoTen: '',
    soDienThoai: '',
    email: '',
    ngaySinh: null
};

function TrangQuanLyKhachHang() {
    const [danhSach, setDanhSach] = useState<KhachHangLoyalty[]>([]);
    const [editingItem, setEditingItem] = useState<KhachHang | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);

    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => {
            setUiMessage(null);
        }, 3500);
        return () => clearTimeout(timer);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getKhachHangs();
            setDanhSach(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách khách hàng:", error);
            showMessage("Không thể tải danh sách khách hàng. Vui lòng kiểm tra kết nối.", 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleEdit = (item: KhachHangLoyalty) => {
        const editData: KhachHang = {
            ma: item.maKhachHang,
            hoTen: item.tenKhachHang,
            soDienThoai: item.soDienThoai,
            email: item.email,
            ngaySinh: item.ngaySinh || null,
            diemTichLuy: item.diemTichLuy
        }
        setEditingItem(editData);
        setFormData({ ...editData, ngaySinh: editData.ngaySinh ? new Date(editData.ngaySinh).toISOString().split('T')[0] : null });
        showMessage('', 'info');
    };

    const handleCancel = () => {
        setEditingItem(null);
        setFormData(initialFormState);
        showMessage('', 'info');
    };

    const handleDelete = async (ma: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này? Thao tác này không thể hoàn tác.')) {
            return;
        }
        setLoading(true);
        try {
            const res = await deleteKhachHang(ma);
            if (res.ok) {
                showMessage('Xóa khách hàng thành công!', 'success');
                fetchData();
            } else {
                const errorText = await res.text();
                showMessage(`Xóa thất bại: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error(error);
            showMessage('Lỗi hệ thống khi xóa khách hàng.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value === '' ? null : value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.hoTen.trim()) {
            showMessage('Họ và tên không được để trống.', 'error');
            return;
        }
        if (formData.soDienThoai && !/^\d{10,11}$/.test(formData.soDienThoai)) {
            showMessage('Số điện thoại không hợp lệ (10-11 chữ số).', 'error');
            return;
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            showMessage('Email không hợp lệ.', 'error');
            return;
        }

        setLoading(true);
        let res;
        try {
            if (editingItem) {
                const updatedData: KhachHang = {
                    ...editingItem,
                    ...formData,
                    ngaySinh: formData.ngaySinh ? new Date(formData.ngaySinh).toISOString() : null,
                };
                res = await updateKhachHang(updatedData);
            } else {
                const newData: Omit<KhachHang, 'ma' | 'diemTichLuy'> = {
                    ...formData,
                    ngaySinh: formData.ngaySinh ? new Date(formData.ngaySinh).toISOString() : null
                };
                res = await addKhachHang(newData);
            }

            if (res.ok) {
                showMessage(editingItem ? 'Cập nhật khách hàng thành công!' : 'Thêm khách hàng thành công!', 'success');
                handleCancel();
                fetchData();
            } else {
                const errorText = await res.text();
                showMessage(`Thao tác thất bại: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error(error);
            showMessage('Lỗi hệ thống khi thực hiện thao tác.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="quanly-container">
            <h1>Quản lý Khách hàng</h1>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}

            <div className="manager-grid-khachhang">
                <div className="section">
                    <form onSubmit={handleSubmit} className="crud-form">
                        <h3>{editingItem ? 'Chỉnh sửa Khách hàng' : 'Thêm Khách hàng mới'}</h3>
                        <div className="form-group">
                            <label htmlFor="hoTen">Họ và tên</label>
                            <input id="hoTen" name="hoTen" value={formData.hoTen} onChange={handleFormChange} placeholder="Nhập họ và tên" required disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="soDienThoai">Số điện thoại</label>
                            <input id="soDienThoai" name="soDienThoai" type="tel" value={formData.soDienThoai || ''} onChange={handleFormChange} placeholder="Nhập số điện thoại" disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" value={formData.email || ''} onChange={handleFormChange} placeholder="Nhập email" disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="ngaySinh">Ngày sinh</label>
                            <input id="ngaySinh" name="ngaySinh" type="date" value={formData.ngaySinh || ''} onChange={handleFormChange} disabled={loading} />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="action-btn save-btn" disabled={loading}>
                                {loading ? 'Đang xử lý...' : (editingItem ? 'Lưu thay đổi' : 'Thêm mới')}
                            </button>
                            {editingItem && <button type="button" className="action-btn cancel-btn" onClick={handleCancel} disabled={loading}>Hủy</button>}
                        </div>
                    </form>
                </div>
                <div className="section">
                    <h2>Danh sách Khách hàng</h2>
                    <div className="item-list scrollable-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã KH</th>
                                    <th>Tên Khách Hàng</th>
                                    <th>SĐT</th>
                                    <th>Email</th>
                                    <th>Ngày sinh</th>
                                    <th>Điểm</th>
                                    <th>Hạng</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && danhSach.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center">Đang tải dữ liệu...</td></tr>
                                ) : danhSach.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center">Không có khách hàng nào.</td></tr>
                                ) : (
                                    danhSach.map(item => (
                                        <tr key={item.maKhachHang}>
                                            <td>{item.maKhachHang}</td>
                                            <td>{item.tenKhachHang}</td>
                                            <td>{item.soDienThoai || 'N/A'}</td>
                                            <td>{item.email || 'N/A'}</td>
                                            <td>{item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                            <td className="text-center">{item.diemTichLuy}</td>
                                            <td>
                                                <span className={`loyalty-rank-cell loyalty-${item.hangKhachHang.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`}>
                                                    {item.hangKhachHang}
                                                </span>
                                            </td>
                                            <td className="actions">
                                                <button className="action-btn edit-btn" onClick={() => handleEdit(item)} disabled={loading}>Sửa</button>
                                                <button className="action-btn delete-btn" onClick={() => handleDelete(item.maKhachHang)} disabled={loading}>Xóa</button>
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

export default TrangQuanLyKhachHang;
