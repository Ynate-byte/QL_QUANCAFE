import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../api/authApi';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../styles/pages/LoginPage.css';
import '../styles/global/components.css';
import '../styles/global/layout.css';

function LoginPage() {
    const [email, setEmail] = useState('an.nv@cafe.com');
    const [password, setPassword] = useState('123');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await loginApi({ email, matKhau: password });
            if (response.ok) {
                const data = await response.json();
                login(data);
                setMessage('Đăng nhập thành công! Đang chuyển hướng...');
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
            }
        } catch (err) {
            console.error("Lỗi API đăng nhập:", err);
            setError('Không thể kết nối tới server. Vuiplicated-code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="login-container"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 60px)',
                backgroundColor: 'var(--light-bg-color)',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            <form
                className="login-form"
                onSubmit={handleSubmit}
                style={{
                    padding: '40px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    width: '100%',
                    maxWidth: '420px',
                    textAlign: 'center',
                    border: '1px solid var(--border-color)'
                }}
            >
                <h2
                    style={{
                        marginBottom: '30px',
                        color: 'var(--primary-color)',
                        fontWeight: '700'
                    }}
                >
                    Đăng nhập Hệ thống
                </h2>
                <div
                    className="form-group"
                    style={{
                        marginBottom: '20px',
                        textAlign: 'left'
                    }}
                >
                    <label
                        htmlFor="email"
                        style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: 'var(--text-color-dark)',
                            fontSize: '0.95em'
                        }}
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            boxSizing: 'border-box',
                            fontSize: '1em',
                            fontFamily: "'Inter', sans-serif",
                            transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                    />
                </div>
                <div
                    className="form-group"
                    style={{
                        marginBottom: '20px',
                        textAlign: 'left'
                    }}
                >
                    <label
                        htmlFor="password"
                        style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: 'var(--text-color-dark)',
                            fontSize: '0.95em'
                        }}
                    >
                        Mật khẩu
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Mật khẩu"
                        required
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            boxSizing: 'border-box',
                            fontSize: '1em',
                            fontFamily: "'Inter', sans-serif",
                            transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                    />
                </div>
                {message && <p className="ui-message success">{message}</p>}
                {error && <p className="ui-message error">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        border: 'none',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1.1em',
                        fontWeight: '600',
                        transition: 'background-color 0.2s, transform 0.1s',
                        marginTop: '15px'
                    }}
                    onMouseOver={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--primary-dark-color)'; }}
                    onMouseOut={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--primary-color)'; }}
                    onMouseDown={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                    onMouseUp={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>

                <div
                    className="customer-actions"
                    style={{
                        marginTop: '30px',
                        paddingTop: '20px',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}
                >
                    <Link
                        to="/tra-cuu-diem"
                        style={{
                            color: 'var(--text-color-light)',
                            textDecoration: 'none',
                            fontSize: '0.9em',
                            fontWeight: '500',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary-color)'} // Corrected type to HTMLAnchorElement
                        onMouseOut={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-color-light)'} // Corrected type to HTMLAnchorElement
                    >
                        Tra cứu điểm thành viên
                    </Link>
                    <span style={{ color: '#ccc', fontSize: '0.9em' }}>|</span>
                    <Link
                        to="/phan-hoi"
                        style={{
                            color: 'var(--text-color-light)',
                            textDecoration: 'none',
                            fontSize: '0.9em',
                            fontWeight: '500',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary-color)'} // Corrected type to HTMLAnchorElement
                        onMouseOut={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-color-light)'} // Corrected type to HTMLAnchorElement
                    >
                        Gửi phản hồi & Góp ý
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default LoginPage;