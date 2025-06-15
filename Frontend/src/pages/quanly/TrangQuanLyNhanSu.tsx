import { useState, useEffect, type FormEvent, type ChangeEvent, useCallback } from 'react';
import { getNhanViens, getCaLams, getLichLamViec, addLichLamViec, deleteLichLamViec, addNhanVien, updateNhanVien, deleteNhanVien } from '../../api/nhanSuApi';
import type { CaLam } from '../../interfaces/CaLam';
import type { LichLamViec } from '../../interfaces/LichLamViec';
import type { NhanVien, UpdateNhanVienResult } from '../../interfaces/NhanVien';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangQuanLyNhanSu.css';

// #region --- Interfaces and Initial States ---
interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

const initialNhanVienFormState: Omit<NhanVien, 'ma' | 'ngayVaoLam'> & { luongTheoGio: number | null, matKhau?: string } = {
    hoTen: '',
    email: '',
    soDienThoai: '',
    vaiTro: 'PhaChe',
    luongTheoGio: null,
    trangThaiTaiKhoan: 'HoatDong',
    matKhau: ''
};

const getTodayString = () => new Date().toISOString().split('T')[0];

/**
 * @summary Kiểm tra xem một ngày (chuỗi YYYY-MM-DD) có trong quá khứ hay không.
 * @param {string} dateString Chuỗi ngày định dạng YYYY-MM-DD.
 * @returns {boolean} True nếu ngày đó là trước ngày hiện tại (không bao gồm ngày hiện tại).
 */
const isDateInPast = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt về đầu ngày để so sánh chính xác
    const dateToCheck = new Date(dateString);
    dateToCheck.setHours(0, 0, 0, 0); // Đặt về đầu ngày để so sánh chính xác

    return dateToCheck < today;
};
// #endregion

// #region --- Employee Form Component ---
function NhanVienFormManager({ showMessage, loading, setLoading, fetchData, editingItem, setEditingItem, formData, setFormData }: {
    showMessage: (text: string, type: UIMessage['type']) => void,
    loading: boolean,
    setLoading: (isLoading: boolean) => void,
    fetchData: () => Promise<void>,
    editingItem: NhanVien | null,
    setEditingItem: (item: NhanVien | null) => void,
    formData: typeof initialNhanVienFormState,
    setFormData: (data: typeof initialNhanVienFormState | ((prev: typeof initialNhanVienFormState) => typeof initialNhanVienFormState)) => void
}) {

    const handleCancel = () => {
        setEditingItem(null);
        setFormData(initialNhanVienFormState);
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // Validation logic
        if (!formData.hoTen.trim() || !formData.email || !formData.vaiTro.trim()) {
            showMessage('Vui lòng điền đầy đủ Họ tên, Email và Vai trò.', 'error'); return;
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            showMessage('Email không hợp lệ.', 'error'); return;
        }
        if (!editingItem && (!formData.matKhau || formData.matKhau.length < 6)) {
            showMessage('Mật khẩu phải có ít nhất 6 ký tự khi thêm nhân viên mới.', 'error'); return;
        }

        setLoading(true);
        const dataToSend: NhanVien = {
            ma: editingItem?.ma || 0,
            hoTen: formData.hoTen, email: formData.email, soDienThoai: formData.soDienThoai || null, vaiTro: formData.vaiTro,
            ngayVaoLam: editingItem?.ngayVaoLam || new Date().toISOString(),
            luongTheoGio: formData.luongTheoGio ? Number(formData.luongTheoGio) : null,
            trangThaiTaiKhoan: formData.trangThaiTaiKhoan,
            matKhau: formData.matKhau || undefined
        };

        if (editingItem && !dataToSend.matKhau?.trim()) delete dataToSend.matKhau;

        try {
            const res = editingItem ? await updateNhanVien(dataToSend) : await addNhanVien(dataToSend);
            
            if (res.ok) {
                if (editingItem) {
                    const result: UpdateNhanVienResult = await res.json();
                    let successMessage = result.Message;
                    if (result.DeletedShifts && result.DeletedShifts.length > 0) {
                        successMessage += `\nCác ca làm sau đã bị hủy do nhân viên nghỉ việc:\n- ${result.DeletedShifts.join('\n- ')}`;
                    }
                    showMessage(successMessage, 'success');
                } else {
                    const resJson = await res.json();
                    showMessage(resJson.Message || 'Thêm nhân viên thành công!', 'success');
                }
                handleCancel();
                await fetchData();
            } else {
                const errorText = await res.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    showMessage(`Thao tác thất bại: ${errorJson.Message || errorText}`, 'error');
                } catch {
                    showMessage(`Thao tác thất bại: ${errorText}`, 'error');
                }
            }
        } catch (error) {
            console.error("Submit NhanVien Error:", error);
            showMessage('Lỗi hệ thống khi thực hiện thao tác.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section">
            <h2>{editingItem ? `Chỉnh sửa: ${editingItem.hoTen}` : 'Thêm Nhân viên mới'}</h2>
            <form onSubmit={handleSubmit} className="crud-form nhan-vien-form">
                <div className="form-group"><label htmlFor="hoTen">Họ và tên</label><input id="hoTen" name="hoTen" value={formData.hoTen} onChange={handleFormChange} required disabled={loading} /></div>
                <div className="form-group"><label htmlFor="email">Email (dùng để đăng nhập)</label><input id="email" name="email" type="email" value={formData.email || ''} onChange={handleFormChange} required disabled={loading} /></div>
                <div className="form-group"><label htmlFor="soDienThoai">Số điện thoại</label><input id="soDienThoai" name="soDienThoai" type="tel" value={formData.soDienThoai || ''} onChange={handleFormChange} disabled={loading} /></div>
                <div className="form-group"><label htmlFor="luongTheoGio">Lương/giờ (VNĐ)</label><input id="luongTheoGio" name="luongTheoGio" type="number" min="0" value={formData.luongTheoGio ?? ''} onChange={handleFormChange} required disabled={loading} /></div>
                <div className="form-group"><label htmlFor="matKhau">Mật khẩu</label><input id="matKhau" name="matKhau" type="password" value={formData.matKhau || ''} onChange={handleFormChange} placeholder={editingItem ? "Để trống nếu không đổi" : "Tối thiểu 6 ký tự"} required={!editingItem} disabled={loading} /></div>
                <div className="form-group"><label htmlFor="vaiTro">Vai trò</label><select id="vaiTro" name="vaiTro" value={formData.vaiTro} onChange={handleFormChange} disabled={loading}><option value="PhaChe">Pha Chế</option><option value="ThuNgan">Thu Ngân</option><option value="QuanLy">Quản Lý</option><option value="Kho">Kho</option></select></div>
                <div className="form-group"><label htmlFor="trangThaiTaiKhoan">Trạng thái</label><select id="trangThaiTaiKhoan" name="trangThaiTaiKhoan" value={formData.trangThaiTaiKhoan} onChange={handleFormChange} disabled={loading}><option value="HoatDong">Hoạt động</option><option value="DanNghiViec">Đã nghỉ việc</option></select></div>
                <div className="form-actions"><button type="submit" className="action-btn save-btn" disabled={loading}>{loading ? '...' : (editingItem ? 'Lưu' : 'Thêm')}</button>{editingItem && <button type="button" className="action-btn cancel-btn" onClick={handleCancel} disabled={loading}>Hủy</button>}</div>
            </form>
        </div>
    );
}
// #endregion

// #region --- Employee List Component ---
function NhanVienListManager({ showMessage, loading, setLoading, fetchData, danhSachNV, onEditNhanVien }: { 
    showMessage: (text: string, type: UIMessage['type']) => void, 
    loading: boolean, 
    setLoading: (isLoading: boolean) => void, 
    fetchData: () => Promise<void>, 
    danhSachNV: NhanVien[],
    onEditNhanVien: (item: NhanVien) => void
}) {
    const handleDeleteNhanVien = async (ma: number) => {
        if (!window.confirm('Xóa nhân viên này? Thao tác này có thể ảnh hưởng đến các dữ liệu liên quan.')) return;
        setLoading(true);
        try {
            const res = await deleteNhanVien(ma);
            if (res.ok) {
                const resJson = await res.json();
                showMessage(resJson.Message || 'Xóa nhân viên thành công!', 'success');
                await fetchData();
            } else {
                const errorText = await res.text();
                 try {
                    const errorJson = JSON.parse(errorText);
                    showMessage(`Xóa thất bại: ${errorJson.Message || errorText}`, 'error');
                } catch {
                    showMessage(`Xóa thất bại: ${errorText}`, 'error');
                }
            }
        } catch (err) {
            console.error("Lỗi xóa nhân viên:", err);
            showMessage('Lỗi hệ thống khi xóa nhân viên.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section">
            <h2>Danh sách Nhân Viên</h2>
            <div className="item-list scrollable-table">
                <table>
                    <thead><tr><th>Mã</th><th>Họ Tên</th><th>Vai trò</th><th>Email</th><th>Lương/giờ</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {loading && danhSachNV.length === 0 ? (<tr><td colSpan={7} className="text-center">Đang tải...</td></tr>) : danhSachNV.length === 0 ? (<tr><td colSpan={7} className="text-center">Chưa có nhân viên nào.</td></tr>) : (
                            danhSachNV.map(item => (
                                <tr key={item.ma}>
                                    <td>{item.ma}</td>
                                    <td>{item.hoTen}</td>
                                    <td>{item.vaiTro}</td>
                                    <td>{item.email || 'N/A'}</td>
                                    <td className="text-right">{(item.luongTheoGio ?? 0).toLocaleString('vi-VN')} đ</td>
                                    <td><span className={`status-cell status-${item.trangThaiTaiKhoan.toLowerCase()}`}>{item.trangThaiTaiKhoan === 'HoatDong' ? 'Hoạt động' : 'Nghỉ việc'}</span></td>
                                    <td className="actions">
                                        <button className="action-btn edit-btn" onClick={() => onEditNhanVien(item)} disabled={loading}>Sửa</button>
                                        <button className="action-btn delete-btn" onClick={() => handleDeleteNhanVien(item.ma)} disabled={loading}>Xóa</button>
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

// #region --- Schedule Management Component ---
function ScheduleManagementArea({ showMessage, loading, setLoading, danhSachNV, danhSachCa }: { showMessage: (text: string, type: UIMessage['type']) => void, loading: boolean, setLoading: (isLoading: boolean) => void, danhSachNV: NhanVien[], danhSachCa: CaLam[] }) {
    const [lich, setLich] = useState<LichLamViec[]>([]);
    const [ngayChon, setNgayChon] = useState(getTodayString());
    const [nvChon, setNvChon] = useState<string>('');
    const [caChon, setCaChon] = useState<string>('');

    const fetchLich = useCallback(async (ngay: string) => {
        setLoading(true);
        try {
            setLich(await getLichLamViec(ngay));
        } catch (err) {
            console.error("Lỗi tải lịch làm việc:", err);
            showMessage("Không thể tải lịch làm việc.", 'error');
        } finally {
            setLoading(false);
        }
    }, [showMessage, setLoading]);

    // useEffect này kích hoạt fetchLich khi ngày hoặc danh sách nhân viên thay đổi
    useEffect(() => {
        fetchLich(ngayChon);
    }, [ngayChon, fetchLich, danhSachNV]); // danhSachNV được thêm vào dependency array

    useEffect(() => {
        if (danhSachNV.length > 0 && (!nvChon || !danhSachNV.some(nv => String(nv.ma) === nvChon))) setNvChon(String(danhSachNV[0]?.ma));
        if (danhSachCa.length > 0 && (!caChon || !danhSachCa.some(ca => String(ca.ma) === caChon))) setCaChon(String(danhSachCa[0]?.ma));
    }, [danhSachNV, danhSachCa, nvChon, caChon]);

    const handleXoaLich = async (ma: number, ngayLamViec: string) => { // Thêm ngayLamViec vào tham số
        if (isDateInPast(ngayLamViec)) {
            showMessage('Không thể xóa ca làm trong quá khứ.', 'error');
            return;
        }
        if (!window.confirm('Bạn có chắc muốn xóa lịch làm việc này?')) return;
        setLoading(true);
        try {
            const res = await deleteLichLamViec(ma);
            if (res.ok) {
                const resJson = await res.json();
                showMessage(resJson.Message || 'Xóa lịch làm việc thành công!', 'success');
                fetchLich(ngayChon);
            } else {
                const errorText = await res.text();
                 try {
                    const errorJson = JSON.parse(errorText);
                    showMessage(`Xóa thất bại: ${errorJson.Message || errorText}`, 'error');
                } catch {
                    showMessage(`Xóa thất bại: ${errorText}`, 'error');
                }
            }
        } catch (err) {
            console.error(err);
            showMessage('Lỗi hệ thống khi xóa lịch làm việc.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitLich = async (e: FormEvent) => {
        e.preventDefault();
        if (!nvChon || !caChon || !ngayChon) {
            showMessage('Vui lòng chọn đầy đủ thông tin.', 'error');
            return;
        }
        if (isDateInPast(ngayChon)) { // Kiểm tra ngày có trong quá khứ không
            showMessage('Không thể phân công ca làm trong quá khứ.', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await addLichLamViec({ maNhanVien: Number(nvChon), maCa: Number(caChon), ngayLamViec: ngayChon });
            if (res.ok) {
                const resJson = await res.json();
                showMessage(resJson.Message || 'Phân công thành công!', 'success');
                fetchLich(ngayChon);
            } else {
                const errorText = await res.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    showMessage(`Phân công thất bại: ${errorJson.Message || errorText}`, 'error');
                } catch {
                    showMessage(`Phân công thất bại: ${errorText}`, 'error');
                }
            }
        } catch (err) {
            console.error(err);
            showMessage('Lỗi hệ thống khi phân công.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="schedule-management-area">
            <div className="add-schedule-section">
                <h2>Phân công Lịch làm việc</h2>
                <form onSubmit={handleSubmitLich} className="crud-form">
                    <div className="form-group"><label htmlFor="ngayChonLich">Chọn ngày</label><input id="ngayChonLich" type="date" value={ngayChon} onChange={e => setNgayChon(e.target.value)} disabled={loading} /></div>
                    <div className="form-group"><label htmlFor="nvChon">Nhân viên</label><select id="nvChon" value={nvChon} onChange={e => setNvChon(e.target.value)} disabled={loading || danhSachNV.length === 0}>{danhSachNV.map(nv => <option key={nv.ma} value={nv.ma}>{nv.hoTen}</option>)}</select></div>
                    <div className="form-group"><label htmlFor="caChon">Ca làm</label><select id="caChon" value={caChon} onChange={e => setCaChon(e.target.value)} disabled={loading || danhSachCa.length === 0}>{danhSachCa.map(ca => <option key={ca.ma} value={ca.ma}>{ca.tenCa} ({ca.gioBatDau.substring(0, 5)} - {ca.gioKetThuc.substring(0, 5)})</option>)}</select></div>
                    <div className="form-actions"><button type="submit" className="action-btn add-btn full-width" disabled={loading || danhSachNV.length === 0 || danhSachCa.length === 0 || isDateInPast(ngayChon)}>{loading ? '...' : 'Phân công'}</button></div>
                </form>
            </div>
            <div className="daily-schedule-section">
                <h2>Lịch làm việc ngày {new Date(ngayChon + 'T00:00:00').toLocaleDateString('vi-VN')}</h2>
                {loading && (<p className="text-center">Đang tải...</p>)}
                {!loading && danhSachCa.length === 0 && (<p className="text-center text-secondary">Chưa có ca làm nào.</p>)}
                <div className="shift-grid">
                    {danhSachCa.map(ca => (
                        <div key={ca.ma} className="shift-group">
                            <h4>{ca.tenCa}</h4>
                            <ul className="employee-list">
                                {lich.filter(l => l.maCa === ca.ma).length === 0 ? (<li className="no-employee">Chưa có nhân viên</li>) : (
                                    lich.filter(l => l.maCa === ca.ma).map(l => {
                                        const isPastShift = isDateInPast(l.ngayLamViec);
                                        return (
                                            <li key={l.ma}>
                                                <span>{l.hoTen}</span>
                                                <button className="action-btn delete-btn small-btn" onClick={() => handleXoaLich(l.ma, l.ngayLamViec)} disabled={loading || isPastShift}>Xóa</button>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
// #endregion

// #region --- Main Page Component ---
function TrangQuanLyNhanSu() {
    const [allNhanViens, setAllNhanViens] = useState<NhanVien[]>([]);
    const [allCaLams, setAllCaLams] = useState<CaLam[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);
    const [editingNhanVien, setEditingNhanVien] = useState<NhanVien | null>(null);
    const [nhanVienFormData, setNhanVienFormData] = useState(initialNhanVienFormState);

    const showMessage = useCallback((text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => setUiMessage(null), 3500);
        return () => clearTimeout(timer);
    }, []);

    const fetchAllInitialData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [nvData, caData] = await Promise.all([getNhanViens(), getCaLams()]);
            setAllNhanViens(nvData);
            setAllCaLams(caData);
        } catch (error) {
            console.error("Lỗi tải dữ liệu ban đầu:", error);
            showMessage("Không thể tải dữ liệu ban đầu cho trang nhân sự.", "error");
        } finally {
            setLoadingData(false);
        }
    }, [showMessage]);

    useEffect(() => { fetchAllInitialData(); }, [fetchAllInitialData]);

    const handleEditNhanVienFromList = (nhanVien: NhanVien) => {
        setEditingNhanVien(nhanVien);
        setNhanVienFormData({
            hoTen: nhanVien.hoTen, email: nhanVien.email || '', soDienThoai: nhanVien.soDienThoai || '',
            vaiTro: nhanVien.vaiTro, luongTheoGio: nhanVien.luongTheoGio, trangThaiTaiKhoan: nhanVien.trangThaiTaiKhoan, matKhau: ''
        });
        showMessage('Thông tin nhân viên đã được đổ vào form bên trái để chỉnh sửa.', 'info');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="quanly-container">
            <h1>Quản lý Nhân sự</h1>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
            <div className="manager-grid-nhansu">
                <NhanVienFormManager
                    showMessage={showMessage} loading={loadingData} setLoading={setLoadingData} fetchData={fetchAllInitialData}
                    editingItem={editingNhanVien} setEditingItem={setEditingNhanVien}
                    formData={nhanVienFormData} setFormData={setNhanVienFormData}
                />
                <div className="right-column">
                    <NhanVienListManager
                        showMessage={showMessage} loading={loadingData} setLoading={setLoadingData} fetchData={fetchAllInitialData}
                        danhSachNV={allNhanViens} onEditNhanVien={handleEditNhanVienFromList}
                    />
                    <ScheduleManagementArea
                        showMessage={showMessage} loading={loadingData} setLoading={setLoadingData}
                        danhSachNV={allNhanViens.filter(nv => nv.trangThaiTaiKhoan === 'HoatDong')}
                        danhSachCa={allCaLams}
                    />
                </div>
            </div>
        </div>
    );
}
// #endregion

export default TrangQuanLyNhanSu;