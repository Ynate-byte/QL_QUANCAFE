import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import type { NguyenLieu } from '../../interfaces/NguyenLieu';
import type { NhaCungCap } from '../../interfaces/NhaCungCap';
import { getNguyenLieus, addNguyenLieu, updateNguyenLieu, deleteNguyenLieu, getNCCs } from '../../api/khoApi';

const initialFormState: Omit<NguyenLieu, 'ma'> = {
    tenNguyenLieu: '',
    soLuongTon: 0,
    donViTinh: '',
    giaNhap: 0,
    maNhaCungCap: null,
    soLuongTon_Toi_Thieu: 0,
};

function NguyenLieuManager() {
    const [danhSachNL, setDanhSachNL] = useState<NguyenLieu[]>([]);
    const [danhSachNCC, setDanhSachNCC] = useState<NhaCungCap[]>([]);
    const [editingItem, setEditingItem] = useState<NguyenLieu | null>(null);
    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            const [dsNL, dsNCC] = await Promise.all([getNguyenLieus(), getNCCs()]);
            setDanhSachNL(dsNL);
            setDanhSachNCC(dsNCC);
        } catch (error) {
            console.error(error);
            alert('Không thể tải dữ liệu cho trang quản lý kho.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleEdit = (item: NguyenLieu) => {
        setEditingItem(item);
        setFormData(item);
    };
    
    const handleCancel = () => {
        setEditingItem(null);
        setFormData(initialFormState);
    };

    const handleDelete = async (ma: number) => {
        if(window.confirm('Bạn có chắc muốn xóa nguyên liệu này?')) {
            const res = await deleteNguyenLieu(ma);
            if (res.ok) { fetchData(); } else { alert('Xóa thất bại.'); }
        }
    };
    
    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            soLuongTon: Number(formData.soLuongTon),
            giaNhap: formData.giaNhap ? Number(formData.giaNhap) : null,
            maNhaCungCap: formData.maNhaCungCap ? Number(formData.maNhaCungCap) : null,
            soLuongTon_Toi_Thieu: formData.soLuongTon_Toi_Thieu ? Number(formData.soLuongTon_Toi_Thieu) : null
        };
        const res = editingItem ? await updateNguyenLieu(dataToSend as NguyenLieu) : await addNguyenLieu(dataToSend);
        if(res.ok) {
            alert('Thao tác thành công!');
            handleCancel();
            fetchData();
        } else {
            alert('Thao tác thất bại.');
        }
    };

    return (
        <div>
            <h2>Quản lý Nguyên Liệu</h2>
            <form onSubmit={handleSubmit} className="crud-form">
                <input name="tenNguyenLieu" value={formData.tenNguyenLieu} onChange={handleFormChange} placeholder="Tên nguyên liệu" required/>
                <input name="soLuongTon" type="number" value={formData.soLuongTon} onChange={handleFormChange} placeholder="Số lượng tồn"/>
                <input name="donViTinh" value={formData.donViTinh} onChange={handleFormChange} placeholder="Đơn vị tính (kg, lít, chai...)" required/>
                <input name="giaNhap" type="number" value={formData.giaNhap || ''} onChange={handleFormChange} placeholder="Giá nhập"/>
                <input name="soLuongTon_Toi_Thieu" type="number" value={formData.soLuongTon_Toi_Thieu || ''} onChange={handleFormChange} placeholder="Ngưỡng tồn tối thiểu"/>
                <select name="maNhaCungCap" value={formData.maNhaCungCap || ''} onChange={handleFormChange}>
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {danhSachNCC.map(ncc => <option key={ncc.ma} value={ncc.ma}>{ncc.tenNhaCungCap}</option>)}
                </select>
                <button type="submit" className="action-btn save-btn">{editingItem ? 'Lưu' : 'Thêm'}</button>
                {editingItem && <button type="button" className="action-btn cancel-btn" onClick={handleCancel}>Hủy</button>}
            </form>
            <div className="item-list">
                <table>
                    <thead><tr><th>Tên Nguyên Liệu</th><th>Tồn Kho</th><th>ĐVT</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {danhSachNL.map(item => (
                            <tr key={item.ma}>
                                <td>{item.tenNguyenLieu}</td>
                                <td>{item.soLuongTon}</td>
                                <td>{item.donViTinh}</td>
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

export default NguyenLieuManager;