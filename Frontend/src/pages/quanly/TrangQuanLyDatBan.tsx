import { useState, useEffect, type FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatBans, taoDatBan, updateTrangThaiDatBan, confirmArrivalApi } from '../../api/datBanApi';
import { layDanhSachBanTheoLoai } from '../../api/banHangApi';
import { timKiemKhachHang } from '../../api/khachHangApi';
import type { DatBanDto } from '../../interfaces/DatBan';
import type { Ban } from '../../interfaces/Ban';
import type { KhachHang } from '../../interfaces/KhachHang';
import '../../styles/global/components.css';
import '../../styles/global/layout.css';
import '../../styles/pages/TrangQuanLyDatBan.css';

const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
};

const toLocalISOString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

interface UIMessage {
    text: string;
    type: 'success' | 'error' | 'info';
}

function TrangQuanLyDatBan() {
    const [ngayChon, setNgayChon] = useState(getTodayString());
    const [danhSach, setDanhSach] = useState<DatBanDto[]>([]);
    const [danhSachBanVip, setDanhSachBanVip] = useState<Ban[]>([]);
    const [loading, setLoading] = useState(false);
    const [uiMessage, setUiMessage] = useState<UIMessage | null>(null);
    const navigate = useNavigate();
    const [maBan, setMaBan] = useState<string>('');
    const [thoiGianBatDau, setThoiGianBatDau] = useState<string>('');
    const [thoiGianKetThuc, setThoiGianKetThuc] = useState<string>('');
    const [soKhach, setSoKhach] = useState<number>(1);
    const [ghiChu, setGhiChu] = useState('');
    const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
    const [ketQuaTimKiem, setKetQuaTimKiem] = useState<KhachHang[]>([]);
    const [khachHangDangChon, setKhachHangDangChon] = useState<KhachHang | null>(null);

    const showMessage = (text: string, type: UIMessage['type']) => {
        setUiMessage({ text, type });
        const timer = setTimeout(() => setUiMessage(null), 3500);
        return () => clearTimeout(timer);
    };

    const fetchData = useCallback(async (ngay: string) => {
        setLoading(true);
        showMessage('', 'info');
        try {
            const [dsDatBan, dsBanTheoLoai] = await Promise.all([getDatBans(ngay), layDanhSachBanTheoLoai()]);
            setDanhSach(dsDatBan);
            const vipRooms = dsBanTheoLoai.flatMap(lb => lb.danhSachBan.filter(b => b.loaiBan === 'PhongVIP'));
            setDanhSachBanVip(vipRooms);
            if (vipRooms.length > 0 && !maBan) {
                setMaBan(String(vipRooms[0].ma));
            }
        } catch (err) {
            console.error("Lỗi tải dữ liệu đặt bàn:", err);
            showMessage("Không thể tải dữ liệu đặt bàn. Vui lòng kiểm tra kết nối server.", 'error');
        } finally {
            setLoading(false);
        }
    }, [maBan]);

    useEffect(() => {
        fetchData(ngayChon);
    }, [ngayChon, fetchData]);

    useEffect(() => {
        if (!tuKhoaTimKiem.trim()) {
            setKetQuaTimKiem([]);
            return;
        }
        const handler = setTimeout(async () => {
            try {
                const ketQua = await timKiemKhachHang(tuKhoaTimKiem);
                setKetQuaTimKiem(ketQua);
            } catch (err) {
                console.error("Lỗi tìm kiếm khách hàng:", err);
                showMessage("Lỗi khi tìm kiếm khách hàng.", 'error');
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [tuKhoaTimKiem]);

    const resetForm = useCallback(() => {
        setThoiGianBatDau('');
        setThoiGianKetThuc('');
        setSoKhach(1);
        setGhiChu('');
        setTuKhoaTimKiem('');
        setKetQuaTimKiem([]);
        setKhachHangDangChon(null);
        if (danhSachBanVip.length > 0) {
            setMaBan(String(danhSachBanVip[0].ma));
        }
    }, [danhSachBanVip]);

    const handleChonKhachHang = (kh: KhachHang) => {
        setKhachHangDangChon(kh);
        setGhiChu(`Khách hàng: ${kh.hoTen} - SĐT: ${kh.soDienThoai || 'N/A'}`);
        setTuKhoaTimKiem('');
        setKetQuaTimKiem([]);
    };
    
    const handleUpdateStatus = async (ma: number, trangThai: string) => {
        showMessage('', 'info');
        if (trangThai === 'DaDen') {
            try {
                const res = await confirmArrivalApi(ma);
                if (res.ok) {
                    showMessage("Xác nhận khách đến thành công! Đang chuyển đến trang bán hàng...", 'success');
                    setTimeout(() => navigate('/ban-hang'), 1500);
                } else {
                    const errorText = await res.text();
                    showMessage(`Thao tác thất bại: ${errorText}`, 'error');
                }
            } catch (err) {
                console.error(err);
                showMessage("Lỗi hệ thống khi xác nhận khách đến.", 'error');
            }
        } else {
            if (!window.confirm(`Bạn có chắc muốn chuyển trạng thái đặt bàn #${ma} thành "${trangThai === 'DaHuy' ? 'Đã hủy' : 'Đã kết thúc'}"?`)) return;
            try {
                const res = await updateTrangThaiDatBan(ma, trangThai);
                if (res.ok) {
                    showMessage(`Cập nhật trạng thái thành công!`, 'success');
                    fetchData(ngayChon);
                } else {
                    showMessage('Cập nhật trạng thái thất bại!', 'error');
                }
            } catch (err) {
                console.error(err);
                showMessage("Lỗi hệ thống khi cập nhật trạng thái.", 'error');
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        showMessage('', 'info');
        if (!maBan || !thoiGianBatDau || !thoiGianKetThuc) {
            showMessage("Vui lòng chọn phòng, thời gian bắt đầu và kết thúc.", 'error');
            return;
        }
        const batDau = new Date(`${ngayChon}T${thoiGianBatDau}`);
        const ketThuc = new Date(`${ngayChon}T${thoiGianKetThuc}`);
        if (isNaN(batDau.getTime()) || isNaN(ketThuc.getTime())) {
            showMessage("Định dạng thời gian không hợp lệ.", 'error');
            return;
        }
        if (ketThuc <= batDau) {
            showMessage("Thời gian kết thúc phải sau thời gian bắt đầu.", 'error');
            return;
        }
        const data = {
            maBan: Number(maBan),
            maKhachHang: khachHangDangChon?.ma,
            thoiGianBatDau: toLocalISOString(batDau),
            thoiGianKetThuc: toLocalISOString(ketThuc),
            soLuongKhach: Number(soKhach),
            ghiChu: ghiChu
        };
        setLoading(true);
        try {
            const res = await taoDatBan(data);
            if (res.ok) {
                showMessage("Đặt bàn thành công!", 'success');
                fetchData(ngayChon);
                resetForm();
            } else {
                const errorText = await res.text();
                showMessage(`Đặt bàn thất bại: ${errorText}`, 'error');
            }
        } catch (err) {
            console.error(err);
            showMessage("Lỗi hệ thống khi tạo đặt bàn.", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="quanly-container">
            <h1>Quản lý Đặt Bàn (Phòng VIP)</h1>
            {uiMessage && <div className={`ui-message ${uiMessage.type}`}>{uiMessage.text}</div>}

            <div className="manager-grid-datban">
                <div className="section">
                    <h3>Tạo Đặt Bàn Mới</h3>
                    <form onSubmit={handleSubmit} className="crud-form">
                        <div className="form-group">
                            <label htmlFor="ngayChon">Ngày đặt</label>
                            <input id="ngayChon" type="date" value={ngayChon} onChange={e => setNgayChon(e.target.value)} min={getTodayString()} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="maBan">Phòng VIP</label>
                            <select id="maBan" value={maBan} onChange={e => setMaBan(e.target.value)} required disabled={loading || danhSachBanVip.length === 0}>
                                {danhSachBanVip.length === 0 ? <option value="">Không có phòng VIP</option> : danhSachBanVip.map(b => <option key={b.ma} value={b.ma}>{b.tenBan}</option>)}
                            </select>
                        </div>
                        <div className="time-group">
                            <div className="form-group">
                                <label htmlFor="thoiGianBatDau">Từ</label>
                                <input id="thoiGianBatDau" type="time" value={thoiGianBatDau} onChange={e => setThoiGianBatDau(e.target.value)} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="thoiGianKetThuc">Đến</label>
                                <input id="thoiGianKetThuc" type="time" value={thoiGianKetThuc} onChange={e => setThoiGianKetThuc(e.target.value)} required disabled={loading} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="soKhach">Số lượng khách</label>
                            <input id="soKhach" type="number" min="1" value={soKhach} onChange={e => setSoKhach(Number(e.target.value))} placeholder="Số lượng khách" disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label>Khách hàng (không bắt buộc)</label>
                            <div className="khach-hang-input-section">
                                {khachHangDangChon ? (
                                    <div className="khach-hang-display-box">
                                        <span>{khachHangDangChon.hoTen}</span>
                                        <button type="button" className="action-btn cancel-btn small-btn" onClick={() => { setKhachHangDangChon(null); setGhiChu('')}} disabled={loading}>Bỏ</button>
                                    </div>
                                ) : (
                                    <>
                                        <input type="text" placeholder="Tìm SĐT/Tên khách hàng..." value={tuKhoaTimKiem} onChange={(e) => setTuKhoaTimKiem(e.target.value)} disabled={loading} />
                                        {ketQuaTimKiem.length > 0 && (
                                            <ul className="ket-qua-tim-kiem-dropdown">
                                                {ketQuaTimKiem.map(kh => (
                                                    <li key={kh.ma} onClick={() => handleChonKhachHang(kh)}>
                                                        {kh.hoTen} - {kh.soDienThoai}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="ghiChu">Ghi chú</label>
                            <textarea id="ghiChu" value={ghiChu} onChange={e => setGhiChu(e.target.value)} placeholder="Ghi chú thêm..." disabled={loading} />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="action-btn save-btn" disabled={loading}>{loading ? 'Đang xử lý...' : 'Xác nhận Đặt bàn'}</button>
                            <button type="button" className="action-btn cancel-btn" onClick={resetForm} disabled={loading}>Hủy</button>
                        </div>
                    </form>
                </div>

                <div className="section">
                    <h2>Danh sách Đặt bàn ngày: {new Date(ngayChon + 'T00:00:00').toLocaleDateString('vi-VN')}</h2>
                    <div className="item-list scrollable-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Phòng</th>
                                    <th>Khách hàng</th>
                                    <th>Thời gian</th>
                                    <th className="text-center">Số khách</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center">Đang tải dữ liệu...</td></tr>
                                ) : danhSach.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center text-secondary">Không có lịch đặt bàn cho ngày này.</td></tr>
                                ) : (
                                    danhSach.map(item => (
                                        <tr key={item.ma}>
                                            <td>{item.tenBan}</td>
                                            <td>{item.tenKhachHang !== 'Khách vãng lai' ? item.tenKhachHang : (item.ghiChu || 'Khách vãng lai')}</td>
                                            <td>
                                                {new Date(item.thoiGian_BatDau).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.thoiGian_KetThuc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="text-center">{item.so_Luong_Khach}</td>
                                            <td><span className={`status-cell status-${item.trangThai.toLowerCase()}`}>{item.trangThai.replace('Da', 'Đã ')}</span></td>
                                            <td className="actions">
                                                {item.trangThai === 'DaDat' && (
                                                    <>
                                                        <button className="action-btn save-btn" onClick={() => handleUpdateStatus(item.ma, 'DaDen')} disabled={loading}>Đã đến</button>
                                                        <button className="action-btn delete-btn" onClick={() => handleUpdateStatus(item.ma, 'DaHuy')} disabled={loading}>Hủy</button>
                                                    </>
                                                )}
                                                {item.trangThai === 'DaDen' && <button className="action-btn confirm-btn" onClick={() => handleUpdateStatus(item.ma, 'DaKetThuc')} disabled={loading}>Kết thúc</button>}
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

export default TrangQuanLyDatBan;
