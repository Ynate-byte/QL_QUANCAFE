import { useState, useEffect, type FormEvent } from 'react';
import type { NhaCungCap } from '../../interfaces/NhaCungCap';
import { getNCCs, addNCC, updateNCC, deleteNCC } from '../../api/khoApi';

const initialFormState: Omit<NhaCungCap, 'ma'> = {
    tenNhaCungCap: '',
    diaChi: '',
    soDienThoai: '',
    email: ''
};

function NhaCungCapManager() {
    const [danhSach, setDanhSach] = useState<NhaCungCap[]>([]);
    const [editingItem, setEditingItem] = useState<NhaCungCap | null>(null);
    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            const data = await getNCCs();
            setDanhSach(data);
        } catch (error) {
            console.error(error);
            alert('Không thể tải danh sách nhà cung cấp.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (item: NhaCungCap) => {
        setEditingItem(item);
        setFormData(item);
    };

    const handleCancel = () => {
        setEditingItem(null);
        setFormData(initialFormState);
    };

    const handleDelete = async (ma: number) => {
        if (window.confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) {
            const res = await deleteNCC(ma);
            if (res.ok) {
                alert('Xóa thành công!');
                fetchData();
            } else {
                alert('Xóa thất bại.');
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const res = editingItem ? await updateNCC(formData as NhaCungCap) : await addNCC(formData);

        if (res.ok) {
            alert(editingItem ? 'Cập nhật thành công!' : 'Thêm thành công!');
            handleCancel();
            fetchData();
        } else {
            alert('Thao tác thất bại.');
        }
    };

    return (
        <div>
            <h2>Quản lý Nhà Cung Cấp</h2>
            <form onSubmit={handleSubmit} className="crud-form">
                <input value={formData.tenNhaCungCap} onChange={(e) => setFormData({...formData, tenNhaCungCap: e.target.value})} placeholder="Tên nhà cung cấp" required/>
                <input value={formData.diaChi || ''} onChange={(e) => setFormData({...formData, diaChi: e.target.value})} placeholder="Địa chỉ"/>
                <input value={formData.soDienThoai || ''} onChange={(e) => setFormData({...formData, soDienThoai: e.target.value})} placeholder="Số điện thoại"/>
                <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email"/>
                <button type="submit" className="action-btn save-btn">{editingItem ? 'Lưu' : 'Thêm'}</button>
                {editingItem && <button type="button" className="action-btn cancel-btn" onClick={handleCancel}>Hủy</button>}
            </form>
            <div className="item-list">
                <table>
                    <thead><tr><th>Tên NCC</th><th>Địa chỉ</th><th>SĐT</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {danhSach.map(item => (
                            <tr key={item.ma}>
                                <td>{item.tenNhaCungCap}</td>
                                <td>{item.diaChi}</td>
                                <td>{item.soDienThoai}</td>
                                <td className="actions">
                                    <button className="action-btn edit-btn" onClick={() => handleEdit(item)}>Sửa</button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(item.ma)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default NhaCungCapManager;