import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/components/Navbar.css'; // Import CSS riêng cho Navbar

// Component Icon Hamburger cho di động
const HamburgerIcon = ({ isOpen, onClick }: { isOpen: boolean, onClick: () => void }) => (
    <button
        className="navbar-toggler"
        type="button"
        onClick={onClick}
        aria-label="Toggle navigation"
        // Inline styles for basic appearance and active state transition
        style={{
            display: 'none', // Hidden by default, controlled by CSS media query for mobile
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            width: '24px',
            height: '24px',
            position: 'relative',
            zIndex: 1001 // Ensure it's above other elements when active
        }}
    >
        <span className="bar" style={{
            display: 'block',
            width: '100%',
            height: '3px',
            backgroundColor: 'var(--text-color-dark)',
            borderRadius: '3px',
            transition: 'all 0.3s ease-in-out',
            position: 'absolute',
            top: isOpen ? '10px' : '0',
            transform: isOpen ? 'rotate(45deg)' : 'none'
        }}></span>
        <span className="bar" style={{
            display: 'block',
            width: '100%',
            height: '3px',
            backgroundColor: 'var(--text-color-dark)',
            borderRadius: '3px',
            transition: 'all 0.3s ease-in-out',
            position: 'absolute',
            top: '50%',
            transform: isOpen ? 'translateY(-50%) scaleX(0)' : 'translateY(-50%)'
        }}></span>
        <span className="bar" style={{
            display: 'block',
            width: '100%',
            height: '3px',
            backgroundColor: 'var(--text-color-dark)',
            borderRadius: '3px',
            transition: 'all 0.3s ease-in-out',
            position: 'absolute',
            bottom: isOpen ? '10px' : '0',
            transform: isOpen ? 'rotate(-45deg)' : 'none'
        }}></span>
    </button>
);

function Navbar() {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showBaoCaoMenu, setShowBaoCaoMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Đóng menu di động và menu "Báo cáo" khi một liên kết được click
    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
        setShowBaoCaoMenu(false);
    };

    return (
        <nav
            className="navbar"
            style={{
                backgroundColor: '#ffffff',
                color: 'var(--text-color-dark)',
                height: '70px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                fontFamily: "'Inter', sans-serif",
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                padding: '0 24px'
            }}
        >
            <div
                className="navbar-container"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                    maxWidth: '1600px',
                    margin: '0 auto'
                }}
            >
                <div
                    className="navbar-left"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}
                >
                    <NavLink
                        to="/"
                        className="navbar-brand"
                        onClick={handleLinkClick}
                        style={{
                            fontSize: '1.8em',
                            fontWeight: '800',
                            color: 'var(--primary-color)',
                            textDecoration: 'none'
                        }}
                    >
                        QL-Cafe
                    </NavLink>
                    {auth?.token && (
                        <ul
                            className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}
                            style={{
                                listStyleType: 'none',
                                margin: 0,
                                padding: 0,
                                display: 'flex', // Default to flex for desktop
                                height: '100%',
                                alignItems: 'center',
                                // Mobile styles (overridden by Navbar.css media queries)
                                // right: isMobileMenuOpen ? '0' : '-100%', // Controlled by CSS
                            }}
                        >
                            {[
                                { to: "/", label: "Dashboard" },
                                { to: "/ban-hang", label: "Bán Hàng" },
                                { to: "/quan-ly-dat-ban", label: "Đặt Bàn" },
                                { to: "/quan-ly-ban", label: "Bàn" },
                                { to: "/quan-ly-khach-hang", label: "Khách hàng" },
                                { to: "/quan-ly-menu", label: "Menu" },
                                { to: "/quan-ly-kho", label: "Kho" },
                                { to: "/quan-ly-cong-thuc", label: "Công thức" },
                                { to: "/quan-ly-nhan-su", label: "Nhân sự" },
                                { to: "/quan-ly-khuyen-mai", label: "Khuyến mãi" },
                                { to: "/quan-ly-phan-hoi", label: "Phản hồi" }
                            ].map((link) => (
                                <li key={link.to} style={{
                                    position: 'relative',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: 'auto' // Default for desktop
                                }}>
                                    <NavLink
                                        to={link.to}
                                        className="nav-item"
                                        onClick={handleLinkClick}
                                        style={({ isActive }) => ({
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '100%',
                                            color: isActive ? 'var(--primary-color)' : '#555',
                                            textDecoration: 'none',
                                            padding: '0 16px',
                                            fontWeight: isActive ? '600' : '500',
                                            fontSize: '0.95em',
                                            transition: 'color 0.2s ease, background-color 0.2s ease',
                                            borderBottom: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                                            boxSizing: 'border-box',
                                            backgroundColor: isActive ? '#f8f9fa' : 'transparent', // Added active background
                                            // Mobile specific styles handled by Navbar.css
                                        })}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'var(--primary-color)';
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!e.currentTarget.classList.contains('active')) { // Keep active style if it's active NavLink
                                                e.currentTarget.style.color = '#555';
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}

                            <li
                                className="dropdown-container"
                                onMouseEnter={() => setShowBaoCaoMenu(true)}
                                onMouseLeave={() => setShowBaoCaoMenu(false)}
                                style={{
                                    position: 'relative',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: 'auto' // Default for desktop
                                }}
                            >
                                <a
                                    href="#!"
                                    className="dropdown-toggle nav-item"
                                    onClick={(e) => { e.preventDefault(); setShowBaoCaoMenu(!showBaoCaoMenu); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '100%',
                                        color: '#555',
                                        textDecoration: 'none',
                                        padding: '0 16px',
                                        fontWeight: '500',
                                        fontSize: '0.95em',
                                        transition: 'color 0.2s ease, background-color 0.2s ease',
                                        borderBottom: '3px solid transparent',
                                        boxSizing: 'border-box',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-color)'; e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    Báo cáo{' '}
                                    <span
                                        className="dropdown-caret"
                                        style={{
                                            marginLeft: '6px',
                                            fontSize: '0.7em',
                                            transition: 'transform 0.2s ease',
                                            transform: showBaoCaoMenu ? 'rotate(180deg)' : 'none'
                                        }}
                                    >
                                        ▼
                                    </span>
                                </a>
                                {showBaoCaoMenu && (
                                    <ul
                                        className="dropdown-menu"
                                        style={{
                                            display: 'block',
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            backgroundColor: '#fff',
                                            listStyleType: 'none',
                                            padding: '8px 0',
                                            margin: 0,
                                            minWidth: '240px',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                            zIndex: 100,
                                            borderRadius: '8px',
                                            border: '1px solid #eee',
                                            overflow: 'hidden',
                                            animation: 'fadeInScale 0.2s ease-out', // Keep animation if defined in CSS
                                            // Mobile specific styles handled by Navbar.css
                                        }}
                                    >
                                        <li><NavLink to="/bao-cao" className="dropdown-item" onClick={handleLinkClick}>Doanh thu & Lợi nhuận</NavLink></li>
                                        <li><NavLink to="/bao-cao/bang-luong" className="dropdown-item" onClick={handleLinkClick}>Bảng lương</NavLink></li>
                                        <li><NavLink to="/bao-cao/hieu-qua-khuyen-mai" className="dropdown-item" onClick={handleLinkClick}>Hiệu quả Khuyến mãi</NavLink></li>
                                        <li><NavLink to="/bao-cao/loi-nhuan-san-pham" className="dropdown-item" onClick={handleLinkClick}>Lợi nhuận Sản phẩm</NavLink></li>
                                    </ul>
                                )}
                            </li>
                        </ul>
                    )}
                </div>
                {auth?.token && (
                    <div
                        className="navbar-right"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                    >
                        <div
                            className="navbar-user"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '0.9em'
                            }}
                        >
                            <span
                                className="user-info"
                                style={{
                                    color: 'var(--text-color-light)'
                                }}
                            >
                                Chào,{' '}
                                <strong
                                    className="user-name"
                                    style={{
                                        fontWeight: '600',
                                        color: 'var(--text-color-dark)'
                                    }}
                                >
                                    {auth.hoTen}
                                </strong>{' '}
                                (<span
                                    className="user-role"
                                    style={{
                                        fontStyle: 'italic',
                                        color: '#95a5a6'
                                    }}
                                >
                                    {auth.vaiTro}
                                </span>)
                            </span>
                            <button
                                onClick={handleLogout}
                                className="logout-btn"
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '0.9em',
                                    backgroundColor: '#f1f3f5',
                                    color: 'var(--text-color-dark)',
                                    borderRadius: '6px',
                                    fontWeight: '500',
                                    border: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease, color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--danger-color)';
                                    e.currentTarget.style.borderColor = 'var(--danger-color)';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f3f5';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.color = 'var(--text-color-dark)';
                                }}
                            >
                                Đăng xuất
                            </button>
                        </div>
                        <HamburgerIcon isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;