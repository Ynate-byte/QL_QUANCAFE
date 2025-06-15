import { useState, useEffect, type FormEvent } from 'react';
import type { LichLamViec } from '../../interfaces/LichLamViec';
import type { NhanVien } from '../../interfaces/NhanVien';
import type { CaLam } from '../../interfaces/CaLam';
import { getNhanViens, getCaLams, getLichLamViec, addLichLamViec, deleteLichLamViec } from '../../api/nhanSuApi';

const getTodayString = () => new Date().toISOString().split('T')[0];

function LichLamViecManager() {
    const [lich, setLich] = useState<LichLamViec[]>([]);
    const [danhSachNV, setDanhSachNV] = useState<NhanVien[]>([]);
    const [danhSachCa, setDanhSachCa] = useState<CaLam[]>([]);
    const [ngayChon, setNgayChon] = useState(getTodayString());
    const [nvChon, setNvChon] = useState('');
    const [caChon, setCaChon] = useState('');

    const fetchData = async () => {
        const [dsNV, dsCa] = await Promise.all([getNhanViens(), getCaLams()]);
        setDanhSachNV(dsNV);
        setDanhSachCa(dsCa);
        if (dsNV.length > 0) setNvChon(String(dsNV[0].ma));
        if (dsCa.length > 0) setCaChon(String(dsCa[0].ma));
    };

    const fetchLich = async (ngay: string) => {
        const lichData = await getLichLamViec(ngay);
        setLich(lichData);
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { fetchLich(ngayChon); }, [ngayChon]);

    const handleXoa = async (ma: number) => {
        const res = await deleteLichLamViec(ma);
        if (res.ok) fetchLich(ngayChon); else alert('Xóa thất bại');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const data = { maNhanVien: Number(nvChon), maCa: Number(caChon), ngayLamViec: ngayChon };
        const res = await addLichLamViec(data);
        if (res.ok) fetchLich(ngayChon); else alert('Thêm thất bại (Có thể do phân công đã tồn tại)');
    };

    return (
        <div className="section">
            <h2>Lịch Làm Việc</h2>
            <div className="filter-section" style={{display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px'}}>
                <label>Chọn ngày:</label>
                <input type="date" value={ngayChon} onChange={e => setNgayChon(e.target.value)} />
            </div>

            <form onSubmit={handleSubmit} className="crud-form">
                <select value={nvChon} onChange={e => setNvChon(e.target.value)}>
                    {danhSachNV.map(nv => <option key={nv.ma} value={nv.ma}>{nv.hoTen}</option>)}
                </select>
                <select value={caChon} onChange={e => setCaChon(e.target.value)}>
                    {danhSachCa.map(ca => <option key={ca.ma} value={ca.ma}>{ca.tenCa}</option>)}
                </select>
                <button type="submit" className="action-btn add-btn">Phân công</button>
            </form>

            <div className="schedule-view" style={{marginTop: '20px'}}>
                {danhSachCa.map(ca => (
                    <div key={ca.ma} className="shift-group">
                        <h3>{ca.tenCa} ({ca.gioBatDau.substring(0,5)} - {ca.gioKetThuc.substring(0,5)})</h3>
                        <ul className="employee-list">
                            {lich.filter(l => l.maCa === ca.ma).map(l => (
                                <li key={l.ma}>{l.hoTen} <button onClick={() => handleXoa(l.ma)}>Xóa</button></li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LichLamViecManager;