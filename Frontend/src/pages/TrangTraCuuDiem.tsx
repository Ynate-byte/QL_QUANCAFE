import { useState, type FormEvent } from 'react';
import { traCuuDiem } from '../api/khachHangApi';
import type { KhachHangLoyalty } from '../interfaces/KhachHang';
import '../styles/pages/LoginPage.css';

function TrangTraCuuDiem() {
    const [sdt, setSdt] = useState('');
    const [customerInfo, setCustomerInfo] = useState<KhachHangLoyalty | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setCustomerInfo(null);

        if (!sdt.trim()) {
            setError('Vui lòng nhập số điện thoại.');
            setLoading(false);
            return;
        }

        try {
            const data = await traCuuDiem(sdt);
            setCustomerInfo(data);
        } catch (err) {
            console.error("Lỗi tra cứu điểm:", err);
            setError('Không tìm thấy khách hàng với số điện thoại này.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Tra cứu Điểm tích lũy</h2>
                <p>Vui lòng nhập số điện thoại của bạn để xem điểm và hạng thành viên.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input 
                            type="tel" 
                            value={sdt} 
                            onChange={e => setSdt(e.target.value)} 
                            placeholder="Nhập số điện thoại" 
                            required 
                        />
                    </div>
                    <button type="submit" disabled={loading}>{loading ? 'Đang tra cứu...' : 'Tra cứu'}</button>
                </form>

                {error && <p className="error-message" style={{marginTop: '20px'}}>{error}</p>}

                {customerInfo && (
                    <div className="thong-tin-khach-hang" style={{marginTop: '20px', textAlign: 'left', backgroundColor: '#eef' , padding: '15px', borderRadius: '5px'}}>
                        <h3>Thông tin thành viên</h3>
                        <p><strong>Xin chào:</strong> {customerInfo.tenKhachHang}</p>
                        <p><strong>Điểm tích lũy:</strong> {customerInfo.diemTichLuy}</p>
                        <p><strong>Hạng thành viên:</strong> {customerInfo.hangKhachHang}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TrangTraCuuDiem;