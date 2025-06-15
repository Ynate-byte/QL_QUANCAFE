import { useState, useEffect, type FormEvent, type ChangeEvent, useCallback, useMemo } from 'react';
import {
    getDanhSachDanhMuc, themDanhMuc, suaDanhMuc, xoaDanhMuc,
    getDanhSachSanPham, themSanPham, suaSanPham, xoaSanPham
} from '../../api/menuApi';
import type { DanhMucSanPham } from '../../interfaces/DanhMucSanPham';
import type { SanPham } from '../../interfaces/SanPham';

import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangQuanLyMenu.css';

interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

const initialSanPhamFormState: Omit<SanPham, 'ma'> = {
    tenSP: '',
    moTa: '',
    gia: 0,
    maDanhMuc: 0,
    hinhAnhSP: '',
    soLuongTaoRa: 1,
    soLuongTon: null,
    isAvailable: true
};

function DanhMucManager({ onCategoryUpdate }: { onCategoryUpdate: () => void }) {
    const [danhSach, setDanhSach] = useState<DanhMucSanPham[]>([]);
    const [dangChinhSua, setDangChinhSua] = useState<DanhMucSanPham | null>(null);
    const [tenInput, setTenInput] = useState('');
    const [message, setMessage] = useState<UIMessage | null>(null);
    const [loading, setLoading] = useState(false);

    const showMessage = (text: string, type: UIMessage['type']) => {
        setMessage({ text, type });
        const timer = setTimeout(() => setMessage(null), 3500);
        return () => clearTimeout(timer);
    };

    const taiDanhSach = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDanhSachDanhMuc();
            setDanhSach(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách danh mục:", error);
            showMessage("Không thể tải danh sách danh mục.", 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { taiDanhSach(); }, [taiDanhSach]);

    const handleSua = (dm: DanhMucSanPham) => {
        setDangChinhSua(dm);
        setTenInput(dm.tenDanhMuc);
    };

    const handleHuy = () => {
        setDangChinhSua(null);
        setTenInput('');
    };

    const handleXoa = async (ma: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        setLoading(true);
        try {
            const response = await xoaDanhMuc(ma);
            if (response.ok) {
                showMessage('Xóa danh mục thành công!', 'success');
                await taiDanhSach();
                onCategoryUpdate();
            } else {
                const errorText = await response.text();
                showMessage(`Xóa thất bại: ${errorText || 'Có thể danh mục này đang được sử dụng.'}`, 'error');
            }
        } catch (error) {
            console.error("Lỗi khi xóa danh mục:", error);
            showMessage("Lỗi hệ thống khi xóa danh mục.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!tenInput.trim()) {
            showMessage('Tên danh mục không được để trống.', 'error');
            return;
        }
        setLoading(true);
        try {
            const response = dangChinhSua
                ? await suaDanhMuc({ ...dangChinhSua, tenDanhMuc: tenInput })
                : await themDanhMuc({ tenDanhMuc: tenInput });
            if (response.ok) {
                showMessage(dangChinhSua ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
                handleHuy();
                await taiDanhSach();
                onCategoryUpdate();
            } else {
                const errorText = await response.text();
                showMessage(`Thao tác thất bại: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error("Lỗi khi gửi form danh mục:", error);
            showMessage("Lỗi hệ thống.", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section danh-muc-manager">
            <h2>Quản lý Danh mục</h2>
            {message && <div className="ui-message" style={{ backgroundColor: message.type === 'success' ? '#d4edda' : message.type === 'error' ? '#f8d7da' : '#cce5ff', color: message.type === 'success' ? '#155724' : message.type === 'error' ? '#721c24' : '#004085' }}>{message.text}</div>}
            <form onSubmit={handleSubmit} className="crud-form add-form-inline">
                <input
                    type="text"
                    placeholder={dangChinhSua ? 'Sửa tên danh mục...' : 'Tên danh mục mới...'}
                    value={tenInput}
                    onChange={(e) => setTenInput(e.target.value)}
                    required
                    disabled={loading}
                />
                <div className="form-actions-inline">
                    <button type="submit" className="action-btn save-btn" disabled={loading}>
                        {loading ? '...' : (dangChinhSua ? 'Lưu' : 'Thêm')}
                    </button>
                    {dangChinhSua && <button type="button" className="action-btn cancel-btn" onClick={handleHuy} disabled={loading}>Hủy</button>}
                </div>
            </form>
            <div className="item-list scrollable-table">
                <table>
                    <thead><tr><th>Mã</th><th>Tên Danh mục</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {loading && danhSach.length === 0 ? (
                            <tr><td colSpan={3} className="text-center">Đang tải...</td></tr>
                        ) : danhSach.length === 0 ? (
                            <tr><td colSpan={3} className="text-center">Chưa có danh mục nào.</td></tr>
                        ) : (
                            danhSach.map(dm => (
                                <tr key={dm.ma}>
                                    <td>{dm.ma}</td>
                                    <td>{dm.tenDanhMuc}</td>
                                    <td className="actions">
                                        <button className="action-btn edit-btn" onClick={() => handleSua(dm)} disabled={loading}>Sửa</button>
                                        <button className="action-btn delete-btn" onClick={() => handleXoa(dm.ma)} disabled={loading}>Xóa</button>
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

function SanPhamManager({ danhSachDM }: { danhSachDM: DanhMucSanPham[] }) {
    const [danhSachSP, setDanhSachSP] = useState<SanPham[]>([]);
    const [dangChinhSua, setDangChinhSua] = useState<SanPham | null>(null);
    const [formData, setFormData] = useState<Omit<SanPham, 'ma'>>(initialSanPhamFormState);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [message, setMessage] = useState<UIMessage | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number>(0); // 0 = All Categories

    const showMessage = (text: string, type: UIMessage['type']) => {
        setMessage({ text, type });
        const timer = setTimeout(() => setMessage(null), 3500);
        return () => clearTimeout(timer);
    };

    const taiDuLieuSP = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDanhSachSanPham();
            setDanhSachSP(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error);
            showMessage("Không thể tải danh sách sản phẩm.", 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        taiDuLieuSP();
        if (danhSachDM.length > 0 && formData.maDanhMuc === 0) {
            setFormData(prev => ({ ...prev, maDanhMuc: danhSachDM[0].ma }));
        }
    }, [taiDuLieuSP, danhSachDM, formData.maDanhMuc]);

    const handleSua = (sp: SanPham) => {
        setDangChinhSua(sp);
        setFormData({ ...sp, moTa: sp.moTa || '', hinhAnhSP: sp.hinhAnhSP || '' });
        setImagePreview(sp.hinhAnhSP);
    };

    const handleHuy = () => {
        setDangChinhSua(null);
        setFormData({ ...initialSanPhamFormState, maDanhMuc: danhSachDM.length > 0 ? danhSachDM[0].ma : 0 });
        setImagePreview(null);
    };

    const handleXoa = async (ma: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        setLoading(true);
        try {
            const response = await xoaSanPham(ma);
            if (response.ok) {
                showMessage('Xóa sản phẩm thành công!', 'success');
                taiDuLieuSP();
            } else {
                const errorText = await response.text();
                showMessage(`Xóa thất bại: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            showMessage("Lỗi hệ thống khi xóa sản phẩm.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? checked : (value === '' ? null : value)
        }));

        if (name === 'hinhAnhSP') {
            setImagePreview(value);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.tenSP.trim() || !formData.gia || !formData.maDanhMuc) {
            showMessage('Vui lòng điền đầy đủ các trường bắt buộc.', 'error');
            return;
        }
        setLoading(true);
        const dataToSend = { ...formData, gia: Number(formData.gia) };
        try {
            const response = dangChinhSua
                ? await suaSanPham({ ...dangChinhSua, ...dataToSend })
                : await themSanPham(dataToSend);
            if (response.ok) {
                showMessage(dangChinhSua ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
                handleHuy();
                taiDuLieuSP();
            } else {
                const errorText = await response.text();
                showMessage(`Thao tác thất bại: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error("Lỗi khi gửi form sản phẩm:", error);
            showMessage("Lỗi hệ thống.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredSanPhamList = useMemo(() => {
        if (selectedCategoryFilter === 0) { // 0 nghĩa là "Tất cả danh mục"
            return danhSachSP;
        }
        return danhSachSP.filter((sp: SanPham) => sp.maDanhMuc === selectedCategoryFilter);
    }, [danhSachSP, selectedCategoryFilter]);


    return (
        <div className="section san-pham-manager">
            <h2>{dangChinhSua ? `Chỉnh sửa Sản phẩm - ${dangChinhSua.tenSP}` : 'Thêm Sản phẩm mới'}</h2>
            {message && <div className="ui-message" style={{ backgroundColor: message.type === 'success' ? '#d4edda' : message.type === 'error' ? '#f8d7da' : '#cce5ff', color: message.type === 'success' ? '#155724' : message.type === 'error' ? '#721c24' : '#004085' }}>{message.text}</div>}
            <form onSubmit={handleSubmit} className="crud-form san-pham-form">
                <div className="form-group">
                    <label htmlFor="tenSP">Tên Sản phẩm</label>
                    <input id="tenSP" name="tenSP" value={formData.tenSP} onChange={handleFormChange} required disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="gia">Giá bán (VNĐ)</label>
                    <input id="gia" name="gia" type="number" min="0" value={formData.gia} onChange={handleFormChange} required disabled={loading} />
                </div>
                <div className="form-group full-width">
                    <label htmlFor="moTa">Mô tả</label>
                    <textarea id="moTa" name="moTa" value={formData.moTa || ''} onChange={handleFormChange} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="maDanhMuc">Danh mục</label>
                    <select id="maDanhMuc" name="maDanhMuc" value={formData.maDanhMuc} onChange={handleFormChange} required disabled={loading || danhSachDM.length === 0}>
                        {danhSachDM.length === 0 ? <option value="0">Tải danh mục...</option> : danhSachDM.map(dm => <option key={dm.ma} value={dm.ma}>{dm.tenDanhMuc}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="soLuongTaoRa">Số lượng tạo ra / lần pha chế</label>
                    <input id="soLuongTaoRa" name="soLuongTaoRa" type="number" min="1" value={formData.soLuongTaoRa} onChange={handleFormChange} required disabled={loading} />
                </div>
                <div className="form-group full-width">
                    <label htmlFor="hinhAnhSP">URL Hình ảnh</label>
                    <input id="hinhAnhSP" name="hinhAnhSP" value={formData.hinhAnhSP || ''} onChange={handleFormChange} placeholder="https://example.com/image.png" disabled={loading} />
                </div>
                {imagePreview && (
                    <div className="image-preview-container">
                        <img src={imagePreview} alt="Xem trước" className="image-preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} onLoad={(e) => { e.currentTarget.style.display = 'block'; }} />
                    </div>
                )}
                <div className="form-group">
                    <label htmlFor="soLuongTon">Tồn kho (chỉ cho sản phẩm bán thẳng)</label>
                    <input id="soLuongTon" name="soLuongTon" type="number" min="0" value={formData.soLuongTon ?? ''} onChange={handleFormChange} placeholder="Để trống nếu là món pha chế" disabled={loading} />
                </div>
                <div className="toggle-switch-container">
                    <label className="toggle-switch">
                        <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleFormChange} disabled={loading} />
                        <span className="toggle-slider"></span>
                    </label>
                    <label htmlFor="isAvailable">Cho phép bán</label>
                </div>
                <div className="form-actions full-width">
                    <button type="submit" className="action-btn save-btn" disabled={loading}>{loading ? 'Đang lưu...' : (dangChinhSua ? 'Lưu thay đổi' : 'Thêm mới')}</button>
                    {dangChinhSua && <button type="button" className="action-btn cancel-btn" onClick={handleHuy} disabled={loading}>Hủy</button>}
                </div>
            </form>
            <hr className="section-divider" />
            <h3>Danh sách Sản phẩm hiện có</h3>
            <div className="form-group category-filter-group">
                <label htmlFor="categoryFilter">Lọc theo Danh mục:</label>
                <select id="categoryFilter" className="input-field" value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(Number(e.target.value))} disabled={loading}>
                    <option value="0">Tất cả</option>
                    {danhSachDM.map(dm => (
                        <option key={dm.ma} value={dm.ma}>{dm.tenDanhMuc}</option>
                    ))}
                </select>
            </div>
            <div className="item-list scrollable-table">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '4%' }}>Mã</th>
                            <th style={{ width: '20%' }}>Tên Sản phẩm</th> {/* Giảm % */}
                            <th className="text-right" style={{ width: '15%' }}>Giá</th>
                            <th style={{ width: '15%' }}>Danh mục</th>
                            <th className="text-center" style={{ width: '10%' }}>Tồn kho</th>
                            <th style={{ width: '16%' }}>Trạng thái</th>
                            <th className="text-center" style={{ width: '20%' }}>Hành động</th> {/* Tăng % */}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center">Đang tải...</td></tr>
                        ) : filteredSanPhamList.length === 0 ? (
                            <tr><td colSpan={7} className="text-center">Chưa có sản phẩm nào hoặc không tìm thấy theo bộ lọc.</td></tr>
                        ) : (
                            filteredSanPhamList.map(sp => (
                                <tr key={sp.ma}>
                                    <td>{sp.ma}</td>
                                    <td>{sp.tenSP}</td>
                                    <td className="text-right">{sp.gia.toLocaleString('vi-VN')} đ</td>
                                    <td>{danhSachDM.find(dm => dm.ma === sp.maDanhMuc)?.tenDanhMuc || 'N/A'}</td>
                                    <td className="text-center">{sp.soLuongTon ?? 'N/A'}</td>
                                    <td className={`status-cell status-${sp.isAvailable ? 'available' : 'unavailable'}`}>
                                        <span className="status-dot"></span>
                                        {sp.isAvailable ? 'Sẵn có' : 'Không sẵn'}
                                    </td>
                                    <td className="actions text-center">
                                        <button className="action-btn edit-btn" onClick={() => handleSua(sp)} disabled={loading}>Sửa</button>
                                        <button className="action-btn delete-btn" onClick={() => handleXoa(sp.ma)} disabled={loading}>Xóa</button>
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

function TrangQuanLyMenu() {
    const [danhSachDM, setDanhSachDM] = useState<DanhMucSanPham[]>([]);
    const taiDuLieuDM = useCallback(async () => {
        try {
            const data = await getDanhSachDanhMuc();
            setDanhSachDM(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách danh mục cho component cha:", error);
        }
    }, []);

    useEffect(() => {
        taiDuLieuDM();
    }, [taiDuLieuDM]);

    return (
        <div className="quanly-container">
            <h1>Quản lý Menu</h1>
            <div className="manager-grid-menu">
                <DanhMucManager onCategoryUpdate={taiDuLieuDM} />
                <SanPhamManager danhSachDM={danhSachDM} />
            </div>
        </div>
    );
}

export default TrangQuanLyMenu;