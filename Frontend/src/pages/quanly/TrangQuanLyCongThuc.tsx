import { useState, useEffect, type FormEvent, useCallback } from 'react';
import { getDanhSachSanPham } from '../../api/menuApi';
import { getNguyenLieus } from '../../api/khoApi';
import { getCongThuc, luuCongThuc } from '../../api/congThucApi';
import type { SanPham } from '../../interfaces/SanPham';
import type { NguyenLieu } from '../../interfaces/NguyenLieu';
import type { ChiTietCongThuc } from '../../interfaces/CongThuc';
import type { TaoCongThucDto } from '../../interfaces/Dto';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangQuanLyCongThuc.css';

// --- Interfaces & Initial States ---
interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

function TrangQuanLyCongThuc() {
    // #region --- States ---
    const [danhSachSP, setDanhSachSP] = useState<SanPham[]>([]);
    const [danhSachNL, setDanhSachNL] = useState<NguyenLieu[]>([]);
    const [sanPhamChon, setSanPhamChon] = useState<SanPham | null>(null);
    const [chiTietList, setChiTietList] = useState<ChiTietCongThuc[]>([]);
    const [tenCongThuc, setTenCongThuc] = useState('');
    const [loading, setLoading] = useState(false);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);
    // #endregion

    // #region --- Functions ---
    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => setUiMessage(null), 3500);
        return () => clearTimeout(timer);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [dsSP, dsNL] = await Promise.all([getDanhSachSanPham(), getNguyenLieus()]);
            setDanhSachSP(dsSP.filter(sp => sp.soLuongTon === null)); // Chỉ lọc sản phẩm pha chế
            setDanhSachNL(dsNL);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            showMessage("Không thể tải dữ liệu cho trang công thức.", 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChonSanPham = useCallback(async (sp: SanPham) => {
        if (loading) return;
        setLoading(true);
        setSanPhamChon(sp);
        setTenCongThuc(`Công thức cho ${sp.tenSP}`);
        showMessage('', 'info');
        try {
            const dataCongThuc = await getCongThuc(sp.ma);
            if (dataCongThuc) {
                setChiTietList(dataCongThuc.chiTiet.map(item => ({ ...item, donViTinh: item.donViTinh || '' })));
                setTenCongThuc(dataCongThuc.congThuc.tenCongThuc);
            } else {
                setChiTietList([]);
                showMessage('Chưa có công thức cho sản phẩm này. Hãy tạo mới!', 'info');
            }
        } catch (error) {
            console.error("Lỗi tải công thức:", error);
            setChiTietList([]);
            showMessage("Lỗi khi tải công thức của sản phẩm.", 'error');
        } finally {
            setLoading(false);
        }
    }, [loading]);

    const handleAddChiTiet = () => {
        const availableNguyenLieu = danhSachNL.find(nl => !chiTietList.some(ct => ct.maNguyenLieu === nl.ma));
        if (!availableNguyenLieu) {
            showMessage("Đã chọn hết các nguyên liệu có sẵn.", 'info');
            return;
        }
        setChiTietList(prev => [...prev, { maNguyenLieu: availableNguyenLieu.ma, soLuongCan: 1, donViTinh: availableNguyenLieu.donViTinh || '' }]);
    };

    const handleRemoveChiTiet = (index: number) => setChiTietList(prev => prev.filter((_, i) => i !== index));

    const handleChiTietChange = (index: number, field: keyof ChiTietCongThuc, value: string | number) => {
        setChiTietList(prev => prev.map((item, i) => {
            if (i === index) {
                if (field === 'maNguyenLieu') {
                    const selectedNl = danhSachNL.find(nl => nl.ma === Number(value));
                    return { ...item, maNguyenLieu: Number(value), donViTinh: selectedNl?.donViTinh || '' };
                }
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleLuuCongThuc = async () => {
        if (!sanPhamChon || !tenCongThuc.trim()) {
            showMessage("Vui lòng chọn sản phẩm và nhập tên công thức.", 'error');
            return;
        }
        if (chiTietList.some(ct => !ct.maNguyenLieu || !ct.soLuongCan || ct.soLuongCan <= 0 || !ct.donViTinh?.trim())) {
            showMessage("Vui lòng điền đầy đủ thông tin cho tất cả các nguyên liệu.", 'error');
            return;
        }
        setLoading(true);
        const dataToSend: TaoCongThucDto = {
            maSanPham: sanPhamChon.ma,
            tenCongThuc: tenCongThuc,
            moTaCongThuc: `Công thức pha chế cho ${sanPhamChon.tenSP}`,
            chiTietCongThuc: chiTietList.map(ct => ({ ...ct, soLuongCan: Number(ct.soLuongCan) }))
        };
        try {
            const res = await luuCongThuc(dataToSend);
            if (res.ok) {
                showMessage('Lưu công thức thành công!', 'success');
            } else {
                showMessage(`Lưu công thức thất bại: ${await res.text()}`, 'error');
            }
        } catch (error) {
            console.error("Lỗi lưu công thức:", error);
            showMessage("Lỗi hệ thống khi lưu công thức.", 'error');
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
            <h1>Quản lý Công thức Pha chế</h1>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}
            <div className="manager-grid-congthuc">
                <div className="section">
                    <h2>Chọn Sản phẩm</h2>
                    <p className="section-description">Chọn sản phẩm cần quản lý công thức (chỉ các sản phẩm pha chế).</p>
                    <div className="item-list scrollable-list">
                        {loading && danhSachSP.length === 0 ? (
                            <p className="text-center">Đang tải danh sách sản phẩm...</p>
                        ) : danhSachSP.length === 0 ? (
                            <p className="text-center">Không có sản phẩm pha chế nào.</p>
                        ) : (
                            danhSachSP.map(sp => (
                                <div key={sp.ma} onClick={() => handleChonSanPham(sp)} className={`selectable-item ${sanPhamChon?.ma === sp.ma ? 'selected' : ''}`}>
                                    {sp.tenSP}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="section">
                    {sanPhamChon ? (
                        <div>
                            <h2>Công thức cho: <span className="highlight-text">{sanPhamChon.tenSP}</span></h2>
                            <form className="crud-form" onSubmit={(e: FormEvent) => { e.preventDefault(); handleLuuCongThuc(); }}>
                                <div className="form-group">
                                    <label htmlFor="tenCongThuc">Tên công thức</label>
                                    <input id="tenCongThuc" value={tenCongThuc} onChange={e => setTenCongThuc(e.target.value)} required disabled={loading}/>
                                </div>
                                <hr className="section-divider" />
                                <h4>Danh sách Nguyên liệu cần thiết</h4>
                                <div className="chi-tiet-cong-thuc-container">
                                    {chiTietList.length === 0 && !loading && (
                                        <p className="text-center text-secondary">Chưa có nguyên liệu nào. Hãy thêm mới!</p>
                                    )}
                                    {chiTietList.map((ct, index) => {
                                        const otherSelectedIds = new Set(chiTietList.filter((_, i) => i !== index).map(item => item.maNguyenLieu));
                                        return (
                                            <div key={index} className="chi-tiet-cong-thuc-row">
                                                <select value={ct.maNguyenLieu || ''} onChange={e => handleChiTietChange(index, 'maNguyenLieu', Number(e.target.value))} required disabled={loading}>
                                                    <option value="" disabled>-- Chọn nguyên liệu --</option>
                                                    {danhSachNL.filter(nl => !otherSelectedIds.has(nl.ma) || nl.ma === ct.maNguyenLieu).map(nl => <option key={nl.ma} value={nl.ma}>{nl.tenNguyenLieu}</option>)}
                                                </select>
                                                <input type="number" step="0.01" min="0" value={ct.soLuongCan} onChange={e => handleChiTietChange(index, 'soLuongCan', Number(e.target.value))} placeholder="SL" required disabled={loading}/>
                                                <input value={ct.donViTinh} onChange={e => handleChiTietChange(index, 'donViTinh', e.target.value)} placeholder="ĐVT" required disabled={loading} />
                                                <button type="button" className="action-btn delete-btn icon-btn" onClick={() => handleRemoveChiTiet(index)} disabled={loading}>&times;</button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="form-actions-extended">
                                    <button type="button" onClick={handleAddChiTiet} className="action-btn add-btn" disabled={loading}>+ Thêm nguyên liệu</button>
                                    <button type="submit" className="action-btn save-btn" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu Công Thức'}</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="placeholder-content">
                            <h2 className="text-center text-secondary">Vui lòng chọn một sản phẩm từ danh sách bên trái để xem hoặc tạo công thức.</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TrangQuanLyCongThuc;
