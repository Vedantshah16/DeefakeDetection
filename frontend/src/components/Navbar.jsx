import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/detect', label: 'Scanner' },
        { to: '/history', label: 'History' },
    ];

    return (
        <header
            className="sticky top-0 z-50 w-full"
            style={{
                backgroundColor: 'rgba(15, 14, 11, 0.85)',
                backdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid var(--home-border)',
            }}
        >
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

                {/* Brand */}
                <NavLink to="/" className="flex items-center gap-3 group cursor-pointer no-underline">
                    <ShieldCheck
                        size={18}
                        style={{ color: 'var(--home-text-tertiary)', strokeWidth: 1.8 }}
                    />
                    <div>
                        <h1
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '20px',
                                fontWeight: 400,
                                letterSpacing: '0',
                                color: 'var(--home-text-primary)',
                                margin: 0,
                                lineHeight: 1.2,
                                transition: 'color 0.2s',
                            }}
                        >
                            TrueSight AI
                        </h1>
                        <div
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                fontWeight: 400,
                                letterSpacing: '0.15em',
                                color: 'var(--home-text-tertiary)',
                                textTransform: 'uppercase',
                            }}
                        >
                            Deepfake Defense
                        </div>
                    </div>
                </NavLink>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center" style={{ gap: '32px' }}>
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className="no-underline"
                            style={({ isActive }) => ({
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '6px 0',
                                fontSize: '14px',
                                fontWeight: 500,
                                fontFamily: 'var(--font-body)',
                                textDecoration: 'none',
                                transition: 'color 0.2s',
                                color: isActive ? 'var(--home-text-primary)' : 'var(--home-text-secondary)',
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    {link.label}
                                    {isActive && (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                bottom: '-2px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--home-text-primary)',
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Right Section */}
                <div className="flex gap-3 items-center">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            {/* Online indicator */}
                            <div
                                className="hidden lg:flex items-center gap-2"
                                style={{
                                    padding: '4px 10px',
                                    color: 'var(--home-text-secondary)',
                                    fontSize: '13px',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                <span
                                    className="inline-flex rounded-full"
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        backgroundColor: 'var(--home-real)',
                                    }}
                                />
                                <span>Online</span>
                            </div>

                            {/* Username chip */}
                            <div
                                className="hidden md:flex items-center gap-2 px-3 py-1.5"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--home-border)',
                                    borderRadius: '4px',
                                }}
                            >
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                                    style={{
                                        background: 'var(--home-text-tertiary)',
                                        color: 'var(--home-bg)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {user?.photo_url ? (
                                        <img
                                            src={user.photo_url}
                                            alt={user.display_name || user.username}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            referrerPolicy="no-referrer"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <span>
                                            {(user?.display_name || user?.username || '?').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--home-text-secondary)' }}
                                >
                                    {user?.display_name || user?.username}
                                </span>
                            </div>

                            {/* Logout button */}
                            <button
                                onClick={handleLogout}
                                className="p-2 transition-all"
                                style={{
                                    color: 'var(--home-text-tertiary)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--home-accent)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--home-text-tertiary)')}
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 transition-all text-sm"
                            style={{
                                color: 'var(--home-text-primary)',
                                border: '1px solid var(--home-border)',
                                background: 'transparent',
                                padding: '8px 10px',
                                borderRadius: '4px',
                                fontWeight: 500,
                                fontFamily: 'var(--font-body)',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--home-accent)')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--home-border)')}
                        >
                            <LogIn size={18} />
                            <span>Sign In</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
