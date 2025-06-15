import { useState, useEffect, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import type { NguyenLieu } from '../../interfaces/NguyenLieu';
import type { PhieuNhap } from '../../interfaces/PhieuNhap';
import { getNguyenLieus, getLichSuPhieuNhap, taoPhieuNhap } from '../../api/khoApi';
import type { TaoPhieuNhapDto } from '../../interfaces/Dto';
import { useAuth } from '../../context/AuthContext';

interface ChiTietPhieuNhap {
    maNguyenLieu: string;
    soLuongNhap: number;
    donGiaNhap: number;
}

function PhieuNhapManager() {
    const [lichSu, setLichSu] = useState<PhieuNhap[]>([]);
    const [danhSachNL, setDanhSachNL] = useState<NguyenLieu[]>([]);
    const [chiTietList, setChiTietList] = useState<ChiTietPhieuNhap[]>([]);
    const [ghiChu, setGhiChu] = useState('');
    const location = useLocation();
    const { auth } = useAuth();

    useEffect(() => {
        if (location.state?.suggestedItems) {
            setChiTietList(location.state.suggestedItems);
            setGhiChu('Phiếu nhập được tạo tự động từ cảnh báo tồn kho.');
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);

    const fetchData = async () => {
        const [resLS, resNL] = await Promise.all([getLichSuPhieuNhap(), getNguyenLieus()]);
        setLichSu(resLS);
        setDanhSachNL(resNL);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddChiTiet = () => {
        setChiTietList([...chiTietList, { maNguyenLieu: '', soLuongNhap: 1, donGiaNhap: 0 }]);
    };

    const handleRemoveChiTiet = (index: number) => {
        setChiTietList(chiTietList.filter((_, i) => i !== index));
    };

    const handleChiTietChange = (index: number, field: keyof ChiTietPhieuNhap, value: string) => {
        const updatedList = chiTietList.map((item, i) => {
            if (i === index) {
                const newValue = field === 'maNguyenLieu' ? value : Number(value);
                return {
                    ...item,
                    [field]: newValue
                };
            }
            return item;
        });
        setChiTietList(updatedList);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (chiTietList.length === 0 || chiTietList.some(ct => !ct.maNguyenLieu)) {
            alert('Vui lòng thêm và chọn nguyên liệu cho phiếu nhập.');
            return;
        }

        const phieuNhapData: TaoPhieuNhapDto = {
            maNhanVienNhap: auth?.maNhanVien ?? 0,
            ghiChu: ghiChu,
            chiTietPhieuNhap: chiTietList.map(ct => ({
                maNguyenLieu: Number(ct.maNguyenLieu),
                soLuongNhap: Number(ct.soLuongNhap),
                donGiaNhap: Number(ct.donGiaNhap)
            }))
        };
        
        const res = await taoPhieuNhap(phieuNhapData);
        if (res.ok) {
            alert('Tạo phiếu nhập thành công!');
            setChiTietList([]);
            setGhiChu('');
            fetchData();
        } else {
            alert('Tạo phiếu nhập thất bại.');
        }
    };
    
    const tongTien = chiTietList.reduce((sum, ct) => sum + (Number(ct.soLuongNhap) * Number(ct.donGiaNhap)), 0);

    return (
        <div>
            <h2>Quản lý Nhập Kho</h2>
            <form onSubmit={handleSubmit} className="crud-form">
                <h3>Tạo Phiếu Nhập Mới</h3>
                <textarea value={ghiChu} onChange={e => setGhiChu(e.target.value)} placeholder="Ghi chú cho phiếu nhập..."></textarea>
                
                {chiTietList.map((ct, index) => (
                    <div key={index} className="chi-tiet-nhap-row">
                        <select value={ct.maNguyenLieu} onChange={e => handleChiTietChange(index, 'maNguyenLieu', e.target.value)} required>
                            <option value="">-- Chọn nguyên liệu --</option>
                            {danhSachNL.map(nl => <option key={nl.ma} value={nl.ma}>{nl.tenNguyenLieu}</option>)}
                        </select>
                        <input type="number" min="0" value={ct.soLuongNhap} onChange={e => handleChiTietChange(index, 'soLuongNhap', e.target.value)} placeholder="Số lượng"/>
                        <input type="number" min="0" value={ct.donGiaNhap} onChange={e => handleChiTietChange(index, 'donGiaNhap', e.target.value)} placeholder="Đơn giá"/>
                        <button type="button" onClick={() => handleRemoveChiTiet(index)}>Xóa</button>
                    </div>
                ))}

                <button type="button" onClick={handleAddChiTiet} className="action-btn add-btn" style={{width: 'auto', marginRight: 'auto'}}>+ Thêm nguyên liệu</button>
                <h4>Tổng tiền: {tongTien.toLocaleString('vi-VN')} đ</h4>
                <button type="submit" className="action-btn save-btn">Lưu Phiếu Nhập</button>
            </form>

            <div className="item-list" style={{marginTop: '20px'}}>
                <h3>Lịch sử Nhập Kho</h3>
                <table>
                    <thead><tr><th>Mã Phiếu</th><th>Ngày Nhập</th><th>Tổng Tiền</th><th>Ghi Chú</th></tr></thead>
                    <tbody>
                        {lichSu.map(pn => (
                            <tr key={pn.ma}>
                                <td>PN-{pn.ma}</td>
                                <td>{new Date(pn.ngayNhap).toLocaleDateString('vi-VN')}</td>
                                <td>{pn.tongTienNhap.toLocaleString('vi-VN')} đ</td>
                                <td>{pn.ghiChu}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PhieuNhapManager;