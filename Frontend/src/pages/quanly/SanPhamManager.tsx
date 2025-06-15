import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { getDanhSachSanPham, themSanPham, suaSanPham, xoaSanPham, getDanhSachDanhMuc } from '../../api/menuApi';
import type { SanPham } from '../../interfaces/SanPham';
import type { DanhMucSanPham } from '../../interfaces/DanhMucSanPham';
import '../../styles/pages/SanPhamManager.css'
const initialFormState: Omit<SanPham, 'ma'> = {
    tenSP: '',
    moTa: '',
    gia: 0,
    maDanhMuc: 0,
    hinhAnhSP: '',
    soLuongTaoRa: 1,
    soLuongTon: null,
    isAvailable: false,
};

function SanPhamManager() {
    const [danhSachSP, setDanhSachSP] = useState<SanPham[]>([]);
    const [danhSachDM, setDanhSachDM] = useState<DanhMucSanPham[]>([]);
    const [dangChinhSua, setDangChinhSua] = useState<SanPham | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const taiDuLieu = async () => {
        setLoading(true);
        try {
            const [dsSP, dsDM] = await Promise.all([getDanhSachSanPham(), getDanhSachDanhMuc()]);
            setDanhSachSP(dsSP);
            setDanhSachDM(dsDM);
            if (dsDM.length > 0) {
                setFormData(prev => ({ ...prev, maDanhMuc: dsDM[0].ma }));
            }
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            console.error('Lỗi khi tải dữ liệu:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        taiDuLieu();
    }, []);

    const handleSua = (sp: SanPham) => {
        setDangChinhSua(sp);
        setFormData({
            tenSP: sp.tenSP,
            moTa: sp.moTa || '',
            gia: sp.gia,
            maDanhMuc: sp.maDanhMuc,
            hinhAnhSP: sp.hinhAnhSP || '',
            soLuongTaoRa: sp.soLuongTaoRa || 1,
            soLuongTon: sp.soLuongTon,
            isAvailable: sp.isAvailable,
        });
    };

    const handleHuy = () => {
        setDangChinhSua(null);
        setFormData(initialFormState);
        setError(null);
    };

    const handleXoa = async (ma: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            setLoading(true);
            try {
                const response = await xoaSanPham(ma);
                if (response.ok) {
                    alert('Xóa thành công!');
                    taiDuLieu();
                } else {
                    const errorText = await response.text();
                    setError(`Xóa thất bại: ${errorText || 'Lỗi không xác định'}`);
                }
            } catch (err) {
                setError('Lỗi hệ thống khi xóa sản phẩm.');
                console.error('Lỗi khi xóa sản phẩm:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? (value === '' ? null : Number(value)) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const dataToSend = {
            ...formData,
            gia: Number(formData.gia),
            maDanhMuc: Number(formData.maDanhMuc),
            soLuongTaoRa: Number(formData.soLuongTaoRa),
        };

        try {
            let response;
            if (dangChinhSua) {
                response = await suaSanPham({ ...dangChinhSua, ...dataToSend });
            } else {
                response = await themSanPham(dataToSend);
            }

            if (response.ok) {
                alert(dangChinhSua ? 'Cập nhật thành công!' : 'Thêm thành công!');
                handleHuy();
                taiDuLieu();
            } else {
                const errorText = await response.text();
                setError(`Thao tác thất bại: ${errorText || 'Lỗi không xác định'}`);
            }
        } catch (err) {
            setError('Lỗi hệ thống khi xử lý yêu cầu.');
            console.error('Lỗi khi xử lý yêu cầu:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="san-pham-manager">
            <h2>Quản lý Sản phẩm</h2>
            {loading && <div className="loading">Đang tải...</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="crud-form">
                <h3>{dangChinhSua ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}</h3>
                <input name="tenSP" value={formData.tenSP} onChange={handleFormChange} placeholder="Tên sản phẩm" required />
                <textarea name="moTa" value={formData.moTa || ''} onChange={handleFormChange} placeholder="Mô tả" />
                <input name="gia" type="number" value={formData.gia} onChange={handleFormChange} placeholder="Giá bán" required />
                <select name="maDanhMuc" value={formData.maDanhMuc} onChange={handleFormChange}>
                    {danhSachDM.map(dm => <option key={dm.ma} value={dm.ma}>{dm.tenDanhMuc}</option>)}
                </select>
                <input name="hinhAnhSP" value={formData.hinhAnhSP || ''} onChange={handleFormChange} placeholder="URL hình ảnh" />
                <input name="soLuongTaoRa" type="number" value={formData.soLuongTaoRa} onChange={handleFormChange} placeholder="Số lượng tạo ra" required />
                <input name="soLuongTon" type="number" value={formData.soLuongTon || ''} onChange={handleFormChange} placeholder="Tồn kho (để trống nếu không áp dụng)" />
                <label>
                    <input name="isAvailable" type="checkbox" checked={formData.isAvailable} onChange={handleFormChange} /> Cho phép bán
                </label>
                <div className="form-actions">
                    <button type="submit" disabled={loading}>{dangChinhSua ? 'Lưu thay đổi' : 'Thêm mới'}</button>
                    {dangChinhSua && <button type="button" disabled={loading} onClick={handleHuy}>Hủy</button>}
                </div>
            </form>

            <div className="item-list">
                <table>
                    <thead>
                        <tr>
                            <th>Tên Sản phẩm</th>
                            <th>Giá</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {danhSachSP.map(sp => (
                            <tr key={sp.ma}>
                                <td>{sp.tenSP}</td>
                                <td>{sp.gia.toLocaleString('vi-VN')} đ</td>
                                <td className="actions">
                                    <button className="action-btn edit-btn" onClick={() => handleSua(sp)} disabled={loading}>Sửa</button>
                                    <button className="action-btn delete-btn" onClick={() => handleXoa(sp.ma)} disabled={loading}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {danhSachSP.length === 0 && (
                            <tr>
                                <td colSpan={3} className="no-data">Không có sản phẩm nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SanPhamManager;