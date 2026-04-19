import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

/* ─── Google "G" Logo SVG ─── */
const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const getPasswordStrength = (pw) => {
    if (!pw || pw.length < 8) return { level: 0, label: 'Weak', color: 'var(--home-fake)', width: '25%' };
    const hasLetters = /[a-zA-Z]/.test(pw);
    const hasNumbers = /[0-9]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);

    if (hasLetters && hasNumbers && hasUpper && hasSpecial) return { level: 3, label: 'Strong', color: 'var(--home-real)', width: '100%' };
    if (hasLetters && hasNumbers && hasUpper) return { level: 2, label: 'Good', color: 'var(--home-accent)', width: '75%' };
    if (hasLetters && hasNumbers) return { level: 1, label: 'Fair', color: 'var(--home-warn)', width: '50%' };
    return { level: 0, label: 'Weak', color: 'var(--home-fake)', width: '25%' };
};

/* ─── Shared input focus/blur handlers ─── */
const inputFocus = (e) => {
    e.target.style.borderColor = 'var(--home-accent)';
    e.target.style.boxShadow = '0 0 0 2px rgba(184, 166, 138, 0.15)';
};
const inputBlur = (e) => {
    e.target.style.borderColor = 'var(--home-border)';
    e.target.style.boxShadow = 'none';
};

const inputStyle = {
    background: 'transparent',
    border: '1px solid var(--home-border)',
    borderRadius: '4px',
    padding: '11px 44px 11px 42px',
    color: 'var(--home-text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
};

const primaryBtnStyle = {
    background: 'transparent',
    border: '1px solid var(--home-text-primary)',
    borderRadius: '4px',
    padding: '12px',
    color: 'var(--home-text-primary)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.2s',
};

const Register = () => {
    const [username, setUsername] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const strength = getPasswordStrength(password);
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate('/scanner', { replace: true });
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await register(username, password);
            setSuccess(true);
        } catch (err) {
            setError(err?.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError(''); // clear any prior error state
        setGoogleLoading(true);
        try {
            await loginWithGoogle();
            navigate('/scanner', { replace: true });
        } catch (err) {
            // Firebase throws specific error codes; present a friendly message
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('Popup blocked. Please allow popups and try again.');
            } else {
                setError(err.response?.data?.detail || err.message || 'Google sign-in failed.');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4"
                style={{ backgroundColor: 'var(--home-bg)' }}
            >
                <div className="w-full max-w-[420px] p-10 text-center"
                    style={{
                        background: 'var(--home-surface)',
                        borderRadius: '4px',
                        border: '1px solid var(--home-border)',
                    }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{
                            background: 'rgba(127, 160, 136, 0.15)',
                            border: '1px solid rgba(127, 160, 136, 0.25)',
                        }}>
                        <CheckCircle2 className="w-9 h-9" style={{ color: 'var(--home-real)' }} />
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--home-text-primary)', marginBottom: '8px' }}>Account created!</h2>
                    <p style={{ fontSize: '14px', color: 'var(--home-text-secondary)', marginBottom: '20px', fontFamily: 'var(--font-body)' }}>Taking you to the scanner…</p>
                    <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--home-accent)', borderTopColor: 'transparent' }} />
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative"
            style={{ backgroundColor: 'var(--home-bg)' }}
        >
            {/* Brand header */}
            <div className="flex flex-col items-center mb-8 relative z-10">
                <div className="flex items-center justify-center mb-4"
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '4px',
                        border: '1px solid var(--home-border)',
                        background: 'var(--home-surface)',
                    }}>
                    <ShieldCheck size={22} style={{ color: 'var(--home-text-tertiary)' }} strokeWidth={1.8} />
                </div>
                <div className="flex items-center gap-1.5">
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: 'var(--home-text-primary)' }}>TrueSight AI</span>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'var(--home-text-tertiary)', fontWeight: 400, textTransform: 'uppercase', marginTop: '4px' }}>
                    Deepfake Defense
                </p>
            </div>

            {/* Register card */}
            <div className="w-full max-w-[420px] relative z-10"
                style={{
                    background: 'var(--home-surface)',
                    border: '1px solid var(--home-border)',
                    borderRadius: '4px',
                    padding: '40px',
                }}>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '36px',
                    fontWeight: 400,
                    color: 'var(--home-text-primary)',
                    letterSpacing: '-0.02em',
                    marginBottom: '4px',
                    lineHeight: 1.1,
                }}>
                    Create account
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--home-text-secondary)', marginBottom: '28px', fontFamily: 'var(--font-body)' }}>
                    Create an account to test the deepfake detection system
                </p>

                {/* Error message */}
                {error && (
                    <div className="mb-5 p-3.5 flex items-start gap-3" style={{
                        background: 'rgba(199, 119, 100, 0.1)',
                        border: '1px solid rgba(199, 119, 100, 0.25)',
                        borderRadius: '4px',
                    }}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--home-fake)' }} />
                        <span className="text-sm" style={{ color: 'var(--home-fake)' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div>
                        <div className="relative">
                            <div className="absolute left-[14px] top-1/2 -translate-y-1/2" style={{ color: 'var(--home-text-tertiary)' }}>
                                <User size={16} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                className="w-full outline-none transition-all"
                                style={{ ...inputStyle, padding: '11px 14px 11px 42px' }}
                                onFocus={inputFocus}
                                onBlur={inputBlur}
                                placeholder="Username (min 3 characters)"
                                required
                            />
                        </div>
                    </div>

                    {/* Password + strength */}
                    <div>
                        <div className="relative">
                            <div className="absolute left-[14px] top-1/2 -translate-y-1/2" style={{ color: 'var(--home-text-tertiary)' }}>
                                <Lock size={16} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                className="w-full outline-none transition-all"
                                style={inputStyle}
                                onFocus={inputFocus}
                                onBlur={inputBlur}
                                placeholder="Password (min 6 characters)"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: 'var(--home-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {/* Strength indicator */}
                        {password.length > 0 && (
                            <div className="mt-2">
                                <div style={{ height: '4px', width: '100%', background: 'var(--home-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: '4px', transition: 'all 0.3s', background: strength.color, width: strength.width }} />
                                </div>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '4px', fontWeight: 500, color: strength.color, letterSpacing: '0.05em' }}>{strength.label}</p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <div className="relative">
                            <div className="absolute left-[14px] top-1/2 -translate-y-1/2" style={{ color: 'var(--home-text-tertiary)' }}>
                                <Lock size={16} />
                            </div>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                className="w-full outline-none transition-all"
                                style={{
                                    ...inputStyle,
                                    borderColor: passwordsMatch ? 'var(--home-real)' : passwordsMismatch ? 'var(--home-fake)' : undefined,
                                }}
                                onFocus={inputFocus}
                                onBlur={(e) => {
                                    e.target.style.boxShadow = 'none';
                                    if (passwordsMatch) e.target.style.borderColor = 'var(--home-real)';
                                    else if (passwordsMismatch) e.target.style.borderColor = 'var(--home-fake)';
                                    else e.target.style.borderColor = 'var(--home-border)';
                                }}
                                placeholder="Confirm password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: 'var(--home-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {passwordsMatch && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <CheckCircle2 size={14} style={{ color: 'var(--home-real)' }} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--home-real)', fontWeight: 500, letterSpacing: '0.05em' }}>Passwords match</span>
                            </div>
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 group transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        style={primaryBtnStyle}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.background = 'var(--home-accent)';
                                e.currentTarget.style.borderColor = 'var(--home-accent)';
                                e.currentTarget.style.color = 'var(--home-bg)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--home-text-primary)';
                            e.currentTarget.style.color = 'var(--home-text-primary)';
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Creating account…</span>
                            </>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider between email/password and Google sign-in */}
                <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--home-border)]"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-3 bg-[var(--home-surface)] text-[11px] tracking-[0.2em] uppercase text-[var(--home-text-tertiary)] font-mono">
                    or
                    </span>
                </div>
                </div>

                {/* Continue with Google */}
                <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-3 border border-[var(--home-border)] hover:border-[var(--home-accent)] hover:text-[var(--home-bg)] hover:bg-[var(--home-accent)] transition-colors text-[var(--home-text-primary)] text-[15px] font-medium rounded-[4px] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                {/* Minimal Google "G" glyph — monochrome, NOT the colored one */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                    d="M21.35 11.1H12v3.2h5.35c-.23 1.47-1.74 4.3-5.35 4.3-3.22 0-5.85-2.66-5.85-5.95S8.78 6.7 12 6.7c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.78 4.14 14.64 3.2 12 3.2 7.03 3.2 3 7.23 3 12.2s4.03 9 9 9c5.2 0 8.64-3.65 8.64-8.78 0-.59-.06-1.04-.14-1.32z"
                    fill="currentColor"
                    />
                </svg>
                {googleLoading ? 'Signing in…' : 'Continue with Google'}
                </button>

                {/* Login link */}
                <p className="mt-5 text-center" style={{ fontSize: '14px', color: 'var(--home-text-secondary)', fontFamily: 'var(--font-body)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--home-text-primary)', textDecoration: 'underline', textUnderlineOffset: '3px', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
            {/* Footer badge */}
            <div className="mt-6 flex items-center gap-1.5 text-xs relative z-10" style={{ color: 'var(--home-text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em' }}>
                <ShieldCheck size={14} />
                <span>Secured with JWT · Sessions persist across refreshes</span>
            </div>
        </div>

        </>
    );
};

export default Register;
