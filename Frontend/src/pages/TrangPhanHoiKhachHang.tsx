import { useState, type FormEvent } from 'react';
import { submitFeedback } from '../api/phanHoiApi';
import '../styles/pages/LoginPage.css'; 
import '../styles/pages/TrangPhanHoiKhachHang.css'; 
import '../styles/global/components.css'; 

function TrangPhanHoiKhachHang() {
    const [soDienThoai, setSoDienThoai] = useState('');
    const [loaiPhanHoi, setLoaiPhanHoi] = useState('Góp ý');
    const [noiDung, setNoiDung] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Basic validation
        if (!noiDung.trim()) {
            setError('Nội dung phản hồi không được để trống.');
            setLoading(false);
            return;
        }

        try {
            const res = await submitFeedback({
                soDienThoai: soDienThoai || undefined,
                loaiPhanHoi,
                noiDung
            });

            if (res.ok) {
                // const data = await res.json(); // API của bạn có thể không trả về body cho 200 OK
                setMessage('Gửi phản hồi thành công! Cảm ơn bạn đã đóng góp ý kiến.');
                setSoDienThoai('');
                setNoiDung('');
            } else {
                const errorText = await res.text();
                throw new Error(errorText || 'Gửi phản hồi thất bại.');
            }
        } catch (err) {
            console.error("Lỗi gửi phản hồi:", err);
            setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container"> {/* Dùng layout container của login */}
            <div className="login-form"> {/* Dùng form styles của login */}
                <h2>Gửi Phản Hồi & Góp Ý</h2>
                <p className="description-text">Chúng tôi luôn lắng nghe ý kiến của bạn để cải thiện dịch vụ.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="soDienThoai">Số điện thoại của bạn (không bắt buộc):</label>
                        <input
                            type="tel"
                            id="soDienThoai"
                            value={soDienThoai}
                            onChange={e => setSoDienThoai(e.target.value)}
                            placeholder="Số điện thoại"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="loaiPhanHoi">Loại phản hồi:</label>
                        <select id="loaiPhanHoi" value={loaiPhanHoi} onChange={e => setLoaiPhanHoi(e.target.value)} disabled={loading}>
                            <option value="Góp ý">Góp ý</option>
                            <option value="Khen ngợi">Khen ngợi</option>
                            <option value="Khiếu nại">Khiếu nại</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="noiDung">Nội dung phản hồi của bạn:</label>
                        <textarea
                            id="noiDung"
                            rows={5}
                            value={noiDung}
                            onChange={e => setNoiDung(e.target.value)}
                            placeholder="Nhập nội dung phản hồi của bạn..."
                            required
                            disabled={loading}
                        />
                    </div>
                    {message && <p className="ui-message success">{message}</p>}
                    {error && <p className="ui-message error">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang gửi...' : 'Gửi Phản Hồi'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TrangPhanHoiKhachHang;