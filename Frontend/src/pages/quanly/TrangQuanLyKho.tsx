import { useState, useEffect, type FormEvent, type ChangeEvent, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import type { NguyenLieu } from '../../interfaces/NguyenLieu';
import type { NhaCungCap } from '../../interfaces/NhaCungCap';
import type { PhieuNhap } from '../../interfaces/PhieuNhap';
import type { ChiTietPhieuNhapViewDto, TaoPhieuNhapDto } from '../../interfaces/Dto';
import {
    getNguyenLieus, addNguyenLieu, updateNguyenLieu, deleteNguyenLieu,
    getNCCs, addNCC, updateNCC, deleteNCC,
    getLichSuPhieuNhap, taoPhieuNhap, getChiTietPhieuNhap
} from '../../api/khoApi';
import { useAuth } from '../../context/AuthContext';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangQuanLyKho.css';

// --- INTERFACES ---
interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}
interface CongThucXungDot {
    maCongThuc: number;
    tenCongThuc: string;
    tenSanPham: string;
}
interface ChiTietPhieuNhapForm {
    maNguyenLieu: string;
    soLuongNhap: number;
    donGiaNhap: number;
}

// #region --- Component Nhà Cung Cấp ---
function NhaCungCapManager({ onUpdate }: { onUpdate: () => void }) {
    const [danhSach, setDanhSach] = useState<NhaCungCap[]>([]);
    const [editingItem, setEditingItem] = useState<NhaCungCap | null>(null);
    const [formData, setFormData] = useState<Omit<NhaCungCap, 'ma'>>({ tenNhaCungCap: '', diaChi: '', soDienThoai: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);

    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => setUiMessage(null), 3500);
        return () => clearTimeout(timer);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getNCCs();
            setDanhSach(data);
        } catch (err) {
            console.error("Lỗi tải nhà cung cấp:", err);
            showMessage('Không thể tải danh sách nhà cung cấp.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleEdit = (item: NhaCungCap) => {
        setEditingItem(item);
        setFormData(item);
    };

    const handleCancel = () => {
        setEditingItem(null);
        setFormData({ tenNhaCungCap: '', diaChi: '', soDienThoai: '', email: '' });
    };

    const handleDelete = async (ma: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) return;
        setLoading(true);
        try {
            const res = await deleteNCC(ma);
            if (res.ok) {
                showMessage('Xóa nhà cung cấp thành công!', 'success');
                fetchData();
                onUpdate();
            } else {
                showMessage(`Xóa thất bại: ${await res.text()}`, 'error');
            }
        } catch (err) {
            console.error("Lỗi xóa nhà cung cấp:", err);
            showMessage('Lỗi hệ thống khi xóa nhà cung cấp.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.tenNhaCungCap.trim()) {
            showMessage('Tên nhà cung cấp không được để trống.', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = editingItem ? await updateNCC({ ...editingItem, ...formData }) : await addNCC(formData);
            if (res.ok) {
                showMessage(editingItem ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
                handleCancel();
                fetchData();
                onUpdate();
            } else {
                showMessage(`Thao tác thất bại: ${await res.text()}`, 'error');
            }
        } catch (err) {
            console.error("Lỗi submit nhà cung cấp:", err);
            showMessage('Lỗi hệ thống khi thực hiện thao tác.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section">
            <h2>Quản lý Nhà Cung Cấp</h2>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
            <form onSubmit={handleSubmit} className="crud-form">
                <h3>{editingItem ? 'Chỉnh sửa NCC' : 'Thêm NCC mới'}</h3>
                <div className="form-group"><label htmlFor="tenNhaCungCap">Tên Nhà Cung Cấp</label><input id="tenNhaCungCap" name="tenNhaCungCap" value={formData.tenNhaCungCap} onChange={(e) => setFormData({ ...formData, tenNhaCungCap: e.target.value })} required disabled={loading} /></div>
                <div className="form-group"><label htmlFor="soDienThoai">Số điện thoại</label><input id="soDienThoai" type="tel" value={formData.soDienThoai || ''} onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })} disabled={loading} /></div>
                <div className="form-group"><label htmlFor="email">Email</label><input id="email" name="email" type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={loading} /></div>
                <div className="form-group"><label htmlFor="diaChi">Địa chỉ</label><input id="diaChi" name="diaChi" value={formData.diaChi || ''} onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })} disabled={loading} /></div>
                <div className="form-actions">
                    <button type="submit" className="action-btn save-btn" disabled={loading}>{loading ? '...' : (editingItem ? 'Lưu' : 'Thêm')}</button>
                    {editingItem && <button type="button" className="action-btn cancel-btn" onClick={handleCancel} disabled={loading}>Hủy</button>}
                </div>
            </form>
            <div className="item-list scrollable-table">
                <table>
                    <thead><tr><th>Mã</th><th>Tên NCC</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {loading ? (<tr><td colSpan={3} className="text-center">Đang tải...</td></tr>) : danhSach.length === 0 ? (<tr><td colSpan={3} className="text-center">Chưa có nhà cung cấp.</td></tr>) : (
                            danhSach.map(item => (<tr key={item.ma}><td>{item.ma}</td><td>{item.tenNhaCungCap}</td><td className="actions"><button className="action-btn edit-btn" onClick={() => handleEdit(item)} disabled={loading}>Sửa</button><button className="action-btn delete-btn" onClick={() => handleDelete(item.ma)} disabled={loading}>Xóa</button></td></tr>))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
// #endregion

// #region --- Component Quản lý Nguyên liệu ---
function NguyenLieuManager({ danhSachNCC, onDataChange }: { danhSachNCC: NhaCungCap[], onDataChange: () => void }) {
    const [danhSachNL, setDanhSachNL] = useState<NguyenLieu[]>([]);
    const [editingItem, setEditingItem] = useState<NguyenLieu | null>(null);
    const [formData, setFormData] = useState<Omit<NguyenLieu, 'ma'>>({ tenNguyenLieu: '', soLuongTon: 0, donViTinh: '', giaNhap: 0, maNhaCungCap: null, soLuongTon_Toi_Thieu: 0, });
    const [loading, setLoading] = useState(false);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [conflictingRecipes, setConflictingRecipes] = useState<CongThucXungDot[]>([]);
    const [conflictMessage, setConflictMessage] = useState('');

    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => setUiMessage(null), 3500);
        return () => clearTimeout(timer);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getNguyenLieus();
            setDanhSachNL(data);
        } catch (err) {
            console.error(err);
            showMessage('Không thể tải danh sách nguyên liệu.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCancel = useCallback(() => {
        setEditingItem(null);
        setFormData({ tenNguyenLieu: '', soLuongTon: 0, donViTinh: '', giaNhap: 0, maNhaCungCap: danhSachNCC.length > 0 ? danhSachNCC[0].ma : null, soLuongTon_Toi_Thieu: 0 });
    }, [danhSachNCC]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { if (!editingItem) handleCancel(); }, [danhSachNCC, editingItem, handleCancel]);

    const handleEdit = (item: NguyenLieu) => {
        setEditingItem(item);
        setFormData(item);
    };

    const handleDelete = async (ma: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa nguyên liệu này?')) return;
        setLoading(true);
        try {
            const res = await deleteNguyenLieu(ma);
            if (res.ok) {
                showMessage('Xóa nguyên liệu thành công!', 'success');
                fetchData();
                onDataChange();
            } else {
                if (res.status === 409) {
                    const errorData = await res.json();
                    setConflictMessage(errorData.message);
                    setConflictingRecipes(errorData.conflictingRecipes);
                    setIsConflictModalOpen(true);
                } else {
                    showMessage(`Xóa thất bại: ${await res.text()}`, 'error');
                }
            }
        } catch (err) {
            console.error(err);
            showMessage('Lỗi hệ thống khi xóa nguyên liệu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === '' ? null : (['soLuongTon', 'giaNhap', 'soLuongTon_Toi_Thieu', 'maNhaCungCap'].includes(name) ? Number(value) : value) }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = editingItem ? await updateNguyenLieu({ ...editingItem, ...formData }) : await addNguyenLieu(formData);
            if (res.ok) {
                showMessage('Thao tác thành công!', 'success');
                handleCancel();
                fetchData();
                onDataChange();
            } else {
                showMessage(`Thao tác thất bại: ${await res.text()}`, 'error');
            }
        } catch (err) {
            console.error(err);
            showMessage('Lỗi hệ thống.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section">
            <h2>{editingItem ? `Chỉnh sửa - ${editingItem.tenNguyenLieu}` : 'Thêm Nguyên liệu mới'}</h2>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
            <form onSubmit={handleSubmit} className="crud-form nguyen-lieu-form">
                <div className="form-group"><label htmlFor="tenNguyenLieu">Tên Nguyên Liệu</label><input id="tenNguyenLieu" name="tenNguyenLieu" value={formData.tenNguyenLieu} onChange={handleFormChange} required disabled={loading} /></div>
                <div className="form-group"><label htmlFor="maNhaCungCap">Nhà cung cấp</label><select id="maNhaCungCap" name="maNhaCungCap" value={formData.maNhaCungCap ?? ''} onChange={handleFormChange} disabled={loading}><option value="">-- Tùy chọn --</option>{danhSachNCC.map(ncc => <option key={ncc.ma} value={ncc.ma}>{ncc.tenNhaCungCap}</option>)}</select></div>
                <div className="form-group"><label htmlFor="soLuongTon">Số lượng tồn</label><input id="soLuongTon" name="soLuongTon" type="number" step="0.1" value={formData.soLuongTon} onChange={handleFormChange} disabled={loading} /></div>
                <div className="form-group"><label htmlFor="donViTinh">Đơn vị tính</label><input id="donViTinh" name="donViTinh" value={formData.donViTinh} onChange={handleFormChange} placeholder="kg, lít, chai..." required disabled={loading} /></div>
                <div className="form-group"><label htmlFor="giaNhap">Giá nhập</label><input id="giaNhap" name="giaNhap" type="number" min="0" value={formData.giaNhap || ''} onChange={handleFormChange} disabled={loading} /></div>
                <div className="form-group"><label htmlFor="soLuongTon_Toi_Thieu">Ngưỡng tồn tối thiểu</label><input id="soLuongTon_Toi_Thieu" name="soLuongTon_Toi_Thieu" type="number" min="0" step="0.1" value={formData.soLuongTon_Toi_Thieu || ''} onChange={handleFormChange} disabled={loading} /></div>
                <div className="form-actions"><button type="submit" className="action-btn save-btn" disabled={loading}>{loading ? '...' : (editingItem ? 'Lưu' : 'Thêm')}</button>{editingItem && <button type="button" className="action-btn cancel-btn" onClick={handleCancel} disabled={loading}>Hủy</button>}</div>
            </form>
            <hr className="section-divider" />
            <h3>Danh sách Nguyên liệu</h3>
            <div className="item-list scrollable-table">
                <table>
                    <thead><tr><th>Mã</th><th>Tên</th><th>Tồn Kho</th><th>ĐVT</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {loading ? (<tr><td colSpan={5} className="text-center">Đang tải...</td></tr>) : danhSachNL.length === 0 ? (<tr><td colSpan={5} className="text-center">Chưa có nguyên liệu.</td></tr>) : (
                            danhSachNL.map(item => (
                                <tr key={item.ma}>
                                    <td>{item.ma}</td>
                                    <td>{item.tenNguyenLieu}</td>
                                    <td className="text-center">{item.soLuongTon}</td>
                                    <td>{item.donViTinh}</td>
                                    <td className="actions"><button className="action-btn edit-btn" onClick={() => handleEdit(item)} disabled={loading}>Sửa</button><button className="action-btn delete-btn" onClick={() => handleDelete(item.ma)} disabled={loading}>Xóa</button></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {isConflictModalOpen && (<div className="modal-overlay" onClick={() => setIsConflictModalOpen(false)}><div className="modal-content" onClick={(e) => e.stopPropagation()}><div className="modal-header"><h3 style={{ color: 'var(--danger-color)' }}>Không thể xóa nguyên liệu</h3><button onClick={() => setIsConflictModalOpen(false)} className="modal-close-btn">&times;</button></div><div className="modal-body"><p className="conflict-message">{conflictMessage}</p><div className="item-list scrollable-table" style={{ maxHeight: '200px', marginTop: '15px' }}><table><thead><tr><th>Tên Sản phẩm</th><th>Tên Công thức</th></tr></thead><tbody>{conflictingRecipes.map(recipe => (<tr key={recipe.maCongThuc}><td>{recipe.tenSanPham}</td><td>{recipe.tenCongThuc}</td></tr>))}</tbody></table></div></div><div className="modal-footer"><button onClick={() => setIsConflictModalOpen(false)} className="action-btn">Đã hiểu</button></div></div></div>)}
        </div>
    );
}
// #endregion

// #region --- Component Quản lý Phiếu Nhập ---
function ChiTietPhieuNhapModal({ isOpen, onClose, details }: { isOpen: boolean, onClose: () => void, details: ChiTietPhieuNhapViewDto[] | null }) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>Chi tiết Phiếu nhập</h3><button onClick={onClose} className="modal-close-btn">&times;</button></div>
                <div className="modal-body">
                    {!details ? <p>Đang tải chi tiết...</p> : details.length === 0 ? <p>Không có chi tiết cho phiếu nhập này.</p> : (
                        <table className="detail-table">
                            <thead><tr><th>Tên Nguyên Liệu</th><th>SL Nhập</th><th>Đơn Giá</th><th>Thành Tiền</th></tr></thead>
                            <tbody>
                                {details.map(item => (
                                    <tr key={item.maChiTietPhieuNhap}>
                                        <td>{item.tenNguyenLieu}</td>
                                        <td className="text-center">{item.soLuongNhap}</td>
                                        <td className="text-right">{item.donGiaNhap.toLocaleString('vi-VN')} đ</td>
                                        <td className="text-right">{(Number(item.soLuongNhap) * item.donGiaNhap).toLocaleString('vi-VN')} đ</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function PhieuNhapManager({ danhSachNL, onUpdate }: { danhSachNL: NguyenLieu[], onUpdate: () => void }) {
    const [lichSu, setLichSu] = useState<PhieuNhap[]>([]);
    const [chiTietList, setChiTietList] = useState<ChiTietPhieuNhapForm[]>([]);
    const [ghiChu, setGhiChu] = useState('');
    const location = useLocation();
    const { auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPhieuNhapDetails, setSelectedPhieuNhapDetails] = useState<ChiTietPhieuNhapViewDto[] | null>(null);

    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => setUiMessage(null), 3500);
        return () => clearTimeout(timer);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getLichSuPhieuNhap();
            setLichSu(data);
        } catch (err) {
            console.error("Lỗi tải phiếu nhập:", err);
            showMessage("Không thể tải lịch sử phiếu nhập.", 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (location.state?.suggestedItems) {
            setChiTietList(location.state.suggestedItems);
            setGhiChu('Phiếu nhập được tạo tự động từ cảnh báo tồn kho.');
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleViewDetails = async (maPhieuNhap: number) => {
        setSelectedPhieuNhapDetails(null);
        setIsDetailModalOpen(true);
        try {
            const details = await getChiTietPhieuNhap(maPhieuNhap);
            setSelectedPhieuNhapDetails(details);
        } catch (err) {
            console.error("Lỗi tải chi tiết:", err);
            showMessage("Không thể tải chi tiết phiếu nhập.", "error");
        }
    };

    const handleAddChiTiet = () => {
        const availableNguyenLieu = danhSachNL.find(nl => !chiTietList.some(ct => Number(ct.maNguyenLieu) === nl.ma));
        if (!availableNguyenLieu) {
            showMessage("Đã chọn hết các nguyên liệu có sẵn.", 'info');
            return;
        }
        setChiTietList([...chiTietList, { maNguyenLieu: String(availableNguyenLieu.ma), soLuongNhap: 1, donGiaNhap: availableNguyenLieu.giaNhap || 0 }]);
    };

    const handleRemoveChiTiet = (index: number) => {
        setChiTietList(chiTietList.filter((_, i) => i !== index));
    };

    const handleChiTietChange = (index: number, field: keyof ChiTietPhieuNhapForm, value: string) => {
        const updatedList = chiTietList.map((item, i) => i === index ? { ...item, [field]: (['soLuongNhap', 'donGiaNhap'].includes(field) ? Number(value) : value) } : item);
        setChiTietList(updatedList);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (chiTietList.length === 0 || chiTietList.some(ct => !ct.maNguyenLieu || Number(ct.soLuongNhap) <= 0 || Number(ct.donGiaNhap) < 0)) {
            showMessage('Vui lòng thêm và điền đầy đủ thông tin cho tất cả nguyên liệu.', 'error');
            return;
        }
        setLoading(true);
        const phieuNhapData: TaoPhieuNhapDto = {
            maNhanVienNhap: auth?.maNhanVien ?? 0,
            ghiChu: ghiChu,
            chiTietPhieuNhap: chiTietList.map(ct => ({ ...ct, maNguyenLieu: Number(ct.maNguyenLieu), soLuongNhap: Number(ct.soLuongNhap), donGiaNhap: Number(ct.donGiaNhap) }))
        };
        try {
            const res = await taoPhieuNhap(phieuNhapData);
            if (res.ok) {
                showMessage('Tạo phiếu nhập thành công!', 'success');
                setChiTietList([]);
                setGhiChu('');
                fetchData();
                onUpdate();
            } else {
                showMessage(`Tạo phiếu nhập thất bại: ${await res.text()}`, 'error');
            }
        } catch (err) {
            console.error("Lỗi tạo phiếu nhập:", err);
            showMessage("Lỗi hệ thống khi tạo phiếu nhập.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const tongTien = chiTietList.reduce((sum, ct) => sum + (Number(ct.soLuongNhap) * Number(ct.donGiaNhap)), 0);

    return (
        <div className="section">
            <h2>Quản lý Nhập Kho</h2>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
            <form onSubmit={handleSubmit} className="crud-form">
                <h3>Tạo Phiếu Nhập Mới</h3>
                <div className="form-group"><label htmlFor="ghiChuPhieuNhap">Ghi chú phiếu nhập</label><textarea id="ghiChuPhieuNhap" value={ghiChu} onChange={e => setGhiChu(e.target.value)} placeholder="Ghi chú (tùy chọn)..." disabled={loading}></textarea></div>
                <div className="chi-tiet-phieu-nhap-container">
                    {chiTietList.length > 0 && <label>Chi tiết phiếu nhập</label>}
                    {chiTietList.map((ct, index) => {
                        const otherSelectedIds = new Set(chiTietList.filter((_, i) => i !== index).map(item => Number(item.maNguyenLieu)));
                        return (
                            <div key={index} className="chi-tiet-nhap-row">
                                <select value={ct.maNguyenLieu} onChange={e => handleChiTietChange(index, 'maNguyenLieu', e.target.value)} required disabled={loading}><option value="" disabled>-- Chọn nguyên liệu --</option>{danhSachNL.filter(nl => !otherSelectedIds.has(nl.ma) || nl.ma === Number(ct.maNguyenLieu)).map(nl => <option key={nl.ma} value={nl.ma}>{nl.tenNguyenLieu}</option>)}</select>
                                <input type="number" min="0" step="0.01" value={ct.soLuongNhap} onChange={e => handleChiTietChange(index, 'soLuongNhap', e.target.value)} placeholder="Số lượng" required disabled={loading} />
                                <input type="number" min="0" value={ct.donGiaNhap} onChange={e => handleChiTietChange(index, 'donGiaNhap', e.target.value)} placeholder="Đơn giá" required disabled={loading} />
                                <button type="button" className="action-btn delete-btn icon-btn" onClick={() => handleRemoveChiTiet(index)} disabled={loading}>&times;</button>
                            </div>
                        );
                    })}
                </div>
                <button type="button" onClick={handleAddChiTiet} className="action-btn add-btn" disabled={loading}>+ Thêm nguyên liệu</button>
                {chiTietList.length > 0 && (<><div className="total-amount"><h4>Tổng tiền:</h4><span>{tongTien.toLocaleString('vi-VN')} đ</span></div><div className="form-actions"><button type="submit" className="action-btn save-btn" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu Phiếu Nhập'}</button></div></>)}
            </form>
            <hr className="section-divider" />
            <h3>Lịch sử Nhập Kho</h3>
            <div className="item-list scrollable-table">
                <table>
                    <thead><tr><th>Mã Phiếu</th><th>Ngày Nhập</th><th className="text-right">Tổng Tiền</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {loading ? (<tr><td colSpan={4} className="text-center">Đang tải...</td></tr>) : lichSu.length === 0 ? (<tr><td colSpan={4} className="text-center">Chưa có phiếu nhập nào.</td></tr>) : (
                            lichSu.map(pn => (<tr key={pn.ma}><td>PN-{pn.ma}</td><td>{new Date(pn.ngayNhap).toLocaleDateString('vi-VN')}</td><td className="text-right">{pn.tongTienNhap.toLocaleString('vi-VN')} đ</td><td className="actions"><button type="button" className="action-btn view-btn" onClick={() => handleViewDetails(pn.ma)} disabled={loading}>Xem</button></td></tr>))
                        )}
                    </tbody>
                </table>
            </div>
            <ChiTietPhieuNhapModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} details={selectedPhieuNhapDetails} />
        </div>
    );
}
// #endregion

// =================================================================
// #region COMPONENT CHÍNH CỦA TRANG
// =================================================================
function TrangQuanLyKho() {
    const [danhSachNCC, setDanhSachNCC] = useState<NhaCungCap[]>([]);
    const [danhSachNL, setDanhSachNL] = useState<NguyenLieu[]>([]);

    const handleDataUpdate = useCallback(async () => {
        try {
            const [nccData, nlData] = await Promise.all([getNCCs(), getNguyenLieus()]);
            setDanhSachNCC(nccData);
            setDanhSachNL(nlData);
        } catch (error) {
            console.error("Lỗi khi tải lại dữ liệu kho:", error);
        }
    }, []);

    useEffect(() => { handleDataUpdate(); }, [handleDataUpdate]);

    return (
        <div className="quanly-container">
            <h1>Quản lý Kho</h1>
            <div className="manager-grid-kho">
                <NhaCungCapManager onUpdate={handleDataUpdate} />
                <div className="kho-right-column">
                    <NguyenLieuManager danhSachNCC={danhSachNCC} onDataChange={handleDataUpdate} />
                    <PhieuNhapManager danhSachNL={danhSachNL} onUpdate={handleDataUpdate} />
                </div>
            </div>
        </div>
    );
}

export default TrangQuanLyKho;
