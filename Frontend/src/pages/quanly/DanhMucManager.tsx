import { useState, useEffect, type FormEvent } from 'react';
import { getDanhSachDanhMuc, themDanhMuc, suaDanhMuc, xoaDanhMuc } from '../../api/menuApi';
import type { DanhMucSanPham } from '../../interfaces/DanhMucSanPham';

function DanhMucManager() {
    const [danhSach, setDanhSach] = useState<DanhMucSanPham[]>([]);
    const [dangChinhSua, setDangChinhSua] = useState<DanhMucSanPham | null>(null);
    const [tenInput, setTenInput] = useState('');

    const taiDanhSach = async () => {
        const data = await getDanhSachDanhMuc();
        setDanhSach(data);
    };

    useEffect(() => {
        taiDanhSach();
    }, []);

    const handleSua = (dm: DanhMucSanPham) => {
        setDangChinhSua(dm);
        setTenInput(dm.tenDanhMuc);
    };

    const handleHuy = () => {
        setDangChinhSua(null);
        setTenInput('');
    };

    const handleXoa = async (ma: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            const response = await xoaDanhMuc(ma);
            if (response.ok) {
                alert('Xóa thành công!');
                taiDanhSach();
            } else {
                alert('Xóa thất bại. Có thể danh mục này đang được sử dụng.');
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!tenInput.trim()) {
            alert('Tên danh mục không được để trống.');
            return;
        }

        let response;
        if (dangChinhSua) {
            response = await suaDanhMuc({ ...dangChinhSua, tenDanhMuc: tenInput });
        } else {
            response = await themDanhMuc({ tenDanhMuc: tenInput });
        }

        if (response.ok) {
            alert(dangChinhSua ? 'Cập nhật thành công!' : 'Thêm thành công!');
            handleHuy();
            taiDanhSach();
        } else {
            alert('Thao tác thất bại.');
        }
    };

    return (
        <div>
            <h2>Quản lý Danh mục</h2>
            <form onSubmit={handleSubmit} className="add-form">
                <input
                    type="text"
                    placeholder="Tên danh mục mới..."
                    value={tenInput}
                    onChange={(e) => setTenInput(e.target.value)}
                />
                <button type="submit" className="action-btn save-btn">{dangChinhSua ? 'Lưu' : 'Thêm'}</button>
                {dangChinhSua && <button type="button" className="action-btn cancel-btn" onClick={handleHuy}>Hủy</button>}
            </form>

            <div className="item-list">
                <table>
                    <thead>
                        <tr>
                            <th>Mã</th>
                            <th>Tên Danh mục</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {danhSach.map(dm => (
                            <tr key={dm.ma}>
                                <td>{dm.ma}</td>
                                <td>{dm.tenDanhMuc}</td>
                                <td className="actions">
                                    <button className="action-btn edit-btn" onClick={() => handleSua(dm)}>Sửa</button>
                                    <button className="action-btn delete-btn" onClick={() => handleXoa(dm.ma)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DanhMucManager;