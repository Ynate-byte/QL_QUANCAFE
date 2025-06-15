import { useState, useEffect, type FormEvent, type ChangeEvent, useCallback } from 'react';
import { getLoaiBans, addLoaiBan, updateLoaiBan, deleteLoaiBan, getBans, addBan, updateBan, deleteBan } from '../../api/quanLyBanApi';
import type { LoaiBan } from '../../interfaces/LoaiBan';
import type { Ban } from '../../interfaces/Ban';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangQuanLyBan.css';

// --- Interfaces & Initial States ---
interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}
const initialBanFormState: Partial<Ban> = { tenBan: '', loaiBan: 'Thuong', sucChua: 2, maLoaiBan: undefined };

// =================================================================
// #region COMPONENT QUẢN LÝ LOẠI BÀN (KHU VỰC)
// =================================================================
function LoaiBanManager({ onUpdate }: { onUpdate: () => void }) {
    const [danhSach, setDanhSach] = useState<LoaiBan[]>([]);
    const [editingItem, setEditingItem] = useState<LoaiBan | null>(null);
    const [tenInput, setTenInput] = useState('');
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
            const res = await getLoaiBans();
            if (res.ok) setDanhSach(await res.json());
            else showMessage('Lỗi khi tải danh sách khu vực.', 'error');
        } catch (err) {
            console.error("Lỗi tải loại bàn:", err);
            showMessage('Không thể tải danh sách khu vực.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleEdit = (item: LoaiBan) => {
        setEditingItem(item);
        setTenInput(item.tenLoaiBan);
    };

    const handleCancel = () => {
        setEditingItem(null);
        setTenInput('');
    };

    const handleDelete = async (ma: number) => {
        if (!window.confirm('Xóa khu vực sẽ khiến các bàn thuộc khu vực này bị mất phân loại. Bạn chắc chứ?')) return;
        setLoading(true);
        try {
            const res = await deleteLoaiBan(ma);
            if (res.ok) {
                showMessage('Xóa khu vực thành công!', 'success');
                fetchData();
                onUpdate();
            } else {
                const errorText = await res.text();
                showMessage(`Xóa thất bại: ${errorText}`, 'error');
            }
        } catch (err) {
            console.error("Lỗi xóa loại bàn:", err);
            showMessage('Lỗi hệ thống khi xóa khu vực.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!tenInput.trim()) {
            showMessage('Tên khu vực không được để trống.', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = editingItem ? await updateLoaiBan({ ...editingItem, tenLoaiBan: tenInput }) : await addLoaiBan({ tenLoaiBan: tenInput });
            if (res.ok) {
                showMessage(editingItem ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
                handleCancel();
                await fetchData();
                onUpdate();
            } else {
                const errorText = await res.text();
                showMessage(`Thao tác thất bại: ${errorText}`, 'error');
            }
        } catch (err) {
            console.error("Lỗi submit loại bàn:", err);
            showMessage('Lỗi hệ thống.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="section">
            <h2>Quản lý Khu vực</h2>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
            <form onSubmit={handleSubmit} className="crud-form add-form-inline">
                <input type="text" placeholder={editingItem ? 'Sửa tên khu vực...' : 'Tên khu vực mới...'} value={tenInput} onChange={(e) => setTenInput(e.target.value)} required disabled={loading}/>
                <div className="form-actions-inline">
                    <button type="submit" className="action-btn save-btn" disabled={loading}>{loading ? '...' : (editingItem ? 'Lưu' : 'Thêm')}</button>
                    {editingItem && <button type="button" className="action-btn cancel-btn" onClick={handleCancel} disabled={loading}>Hủy</button>}
                </div>
            </form>
            <div className="item-list scrollable-table">
                <table>
                    <thead><tr><th>Mã</th><th>Tên Khu vực</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {loading && danhSach.length === 0 ? (
                            <tr><td colSpan={3} className="text-center">Đang tải...</td></tr>
                        ) : danhSach.length === 0 ? (
                            <tr><td colSpan={3} className="text-center">Chưa có khu vực nào.</td></tr>
                        ) : (
                            danhSach.map(item => (
                                <tr key={item.ma}>
                                    <td>{item.ma}</td>
                                    <td>{item.tenLoaiBan}</td>
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
    );
}
// #endregion

// =================================================================
// #region COMPONENT QUẢN LÝ BÀN
// =================================================================
function BanManager({ danhSachLoaiBan, onDataChange }: { danhSachLoaiBan: LoaiBan[], onDataChange: () => void }) {
    const [danhSachBan, setDanhSachBan] = useState<Ban[]>([]);
    const [editingItem, setEditingItem] = useState<Ban | null>(null);
    const [formData, setFormData] = useState<Partial<Ban>>(initialBanFormState);
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
            const res = await getBans();
            if (res.ok) setDanhSachBan(await res.json());
            else showMessage('Lỗi khi tải danh sách bàn.', 'error');
        } catch (err) {
            console.error("Lỗi tải bàn:", err);
            showMessage('Không thể tải dữ liệu bàn.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleEdit = (item: Ban) => {
        setEditingItem(item);
        setFormData(item);
    };

    const handleCancel = useCallback(() => {
        setEditingItem(null);
        setFormData({ ...initialBanFormState, maLoaiBan: danhSachLoaiBan.length > 0 ? danhSachLoaiBan[0].ma : undefined });
    }, [danhSachLoaiBan]);

    const handleDelete = async (ma: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa bàn này?')) return;
        setLoading(true);
        try {
            const res = await deleteBan(ma);
            if (res.ok) {
                showMessage('Xóa bàn thành công!', 'success');
                fetchData();
                onDataChange();
            } else {
                const errorText = await res.text();
                showMessage(`Xóa thất bại: ${errorText}`, 'error');
            }
        } catch (err) {
            console.error("Lỗi xóa bàn:", err);
            showMessage('Lỗi hệ thống khi xóa bàn.', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.tenBan?.trim() || !formData.maLoaiBan) {
            showMessage("Tên bàn và khu vực không được để trống.", 'error');
            return;
        }
        if (Number(formData.sucChua) < 1) {
            showMessage("Sức chứa phải lớn hơn 0.", 'error');
            return;
        }
        setLoading(true);
        const dataToSend = { ...formData, sucChua: Number(formData.sucChua), maLoaiBan: Number(formData.maLoaiBan) };
        try {
            const res = editingItem ? await updateBan(dataToSend as Ban) : await addBan(dataToSend as Omit<Ban, 'ma' | 'trangThai'>);
            if (res.ok) {
                showMessage('Thao tác thành công!', 'success');
                handleCancel();
                fetchData();
                onDataChange();
            } else {
                const errorText = await res.text();
                showMessage(`Thao tác thất bại: ${errorText}`, 'error');
            }
        } catch (err) {
            console.error("Lỗi submit bàn:", err);
            showMessage('Lỗi hệ thống.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { handleCancel(); }, [danhSachLoaiBan, handleCancel]);

    return (
        <div className="section">
            <h2>{editingItem ? `Chỉnh sửa - ${editingItem.tenBan}` : 'Thêm Bàn mới'}</h2>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
            <form onSubmit={handleSubmit} className="crud-form ban-form">
                <div className="form-group"><label htmlFor="tenBan">Tên Bàn</label><input id="tenBan" name="tenBan" value={formData.tenBan || ''} onChange={handleFormChange} required disabled={loading} /></div>
                <div className="form-group"><label htmlFor="sucChua">Sức chứa</label><input id="sucChua" name="sucChua" type="number" min="1" value={formData.sucChua ?? ''} onChange={handleFormChange} required disabled={loading} /></div>
                <div className="form-group"><label htmlFor="maLoaiBan">Khu vực</label><select id="maLoaiBan" name="maLoaiBan" value={formData.maLoaiBan ?? ''} onChange={handleFormChange} disabled={loading || danhSachLoaiBan.length === 0}>{danhSachLoaiBan.map(lb => <option key={lb.ma} value={lb.ma}>{lb.tenLoaiBan}</option>)}</select></div>
                <div className="form-group"><label htmlFor="loaiBan">Loại Bàn</label><select id="loaiBan" name="loaiBan" value={formData.loaiBan || 'Thuong'} onChange={handleFormChange} disabled={loading}><option value="Thuong">Bàn Thường</option><option value="PhongVIP">Phòng VIP</option></select></div>
                <div className="form-actions"><button type="submit" className="action-btn save-btn" disabled={loading}>{loading ? '...' : (editingItem ? 'Lưu' : 'Thêm')}</button>{editingItem && <button type="button" className="action-btn cancel-btn" onClick={handleCancel} disabled={loading}>Hủy</button>}</div>
            </form>
            <hr className="section-divider" />
            <h3>Danh sách Bàn hiện có</h3>
            <div className="item-list scrollable-table">
                <table>
                    <thead><tr><th>Mã</th><th>Tên Bàn</th><th>Sức chứa</th><th>Loại Bàn</th><th>Khu vực</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center">Đang tải...</td></tr>
                        ) : danhSachBan.length === 0 ? (
                            <tr><td colSpan={7} className="text-center">Chưa có bàn nào.</td></tr>
                        ) : (
                            danhSachBan.map(item => (
                                <tr key={item.ma}>
                                    <td>{item.ma}</td>
                                    <td>{item.tenBan}</td>
                                    <td className="text-center">{item.sucChua ?? 'N/A'}</td>
                                    <td>{item.loaiBan === 'PhongVIP' ? 'Phòng VIP' : 'Thường'}</td>
                                    <td>{danhSachLoaiBan.find(lb => lb.ma === item.maLoaiBan)?.tenLoaiBan || 'N/A'}</td>
                                    <td><span className={`status-cell status-${item.trangThai.toLowerCase().replace(/\s+/g, '-')}`}>{item.trangThai}</span></td>
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
    );
}
// #endregion

// =================================================================
// #region COMPONENT CHÍNH CỦA TRANG
// =================================================================
function TrangQuanLyBan() {
    const [danhSachLoaiBan, setDanhSachLoaiBan] = useState<LoaiBan[]>([]);
    
    const handleCategoryUpdate = useCallback(async () => {
        try {
            const res = await getLoaiBans();
            if (res.ok) setDanhSachLoaiBan(await res.json());
        } catch (error) {
            console.error("Lỗi tải lại danh sách loại bàn:", error);
        }
    }, []);

    useEffect(() => { handleCategoryUpdate(); }, [handleCategoryUpdate]);

    return (
        <div className="quanly-container">
            <h1>Quản lý Bàn & Khu vực</h1>
            <div className="manager-grid-ban">
                <LoaiBanManager onUpdate={handleCategoryUpdate} />
                <BanManager danhSachLoaiBan={danhSachLoaiBan} onDataChange={handleCategoryUpdate} />
            </div>
        </div>
    );
}

export default TrangQuanLyBan;
