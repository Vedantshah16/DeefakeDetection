import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

const getPasswordStrength = (pw) => {
    if (!pw || pw.length < 8) return { level: 0, label: 'Weak', color: 'bg-red-500', text: 'text-red-400', width: 'w-1/4' };
    const hasLetters = /[a-zA-Z]/.test(pw);
    const hasNumbers = /[0-9]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);

    if (hasLetters && hasNumbers && hasUpper && hasSpecial) return { level: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400', width: 'w-full' };
    if (hasLetters && hasNumbers && hasUpper) return { level: 2, label: 'Good', color: 'bg-blue-500', text: 'text-blue-400', width: 'w-3/4' };
    if (hasLetters && hasNumbers) return { level: 1, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400', width: 'w-2/4' };
    return { level: 0, label: 'Weak', color: 'bg-red-500', text: 'text-red-400', width: 'w-1/4' };
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
    const { register } = useAuth();
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

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-[420px] bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-10 text-center"
                    style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
                    <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-5 animate-pop border border-emerald-500/20">
                        <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Account created!</h2>
                    <p className="text-sm text-slate-400 mb-5">Taking you to the scanner…</p>
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-violet-600/8 blur-[120px] rounded-full"></div>
            </div>

            {/* Brand header */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
                    <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold text-white">TrueSight</span>
                    <span className="text-2xl font-bold gradient-text">AI</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-1">Deepfake Defense</p>
            </div>

            {/* Register card */}
            <div className="w-full max-w-[420px] bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-8"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 80px rgba(99,102,241,0.05)' }}>
                <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
                <p className="text-sm text-slate-400 mb-6">Join TrueSight AI to start detecting deepfakes</p>

                {/* Error message */}
                {error && (
                    <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-fade-in">
                        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-rose-300">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600"
                                placeholder="Username (min 3 characters)"
                                required
                            />
                        </div>
                    </div>

                    {/* Password + strength */}
                    <div>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-11 pr-11 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600"
                                placeholder="Password (min 6 characters)"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {/* Strength indicator */}
                        {password.length > 0 && (
                            <div className="mt-2">
                                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                                </div>
                                <p className={`text-[11px] mt-1 font-medium ${strength.text}`}>{strength.label}</p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                className={`w-full bg-white/[0.05] border rounded-xl pl-11 pr-11 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 ${passwordsMatch ? 'border-emerald-500/40' : passwordsMismatch ? 'border-rose-500/40' : 'border-white/[0.08]'
                                    }`}
                                placeholder="Confirm password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordsMatch && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <CheckCircle2 size={14} className="text-emerald-400" />
                                <span className="text-[11px] text-emerald-400 font-medium">Passwords match</span>
                            </div>
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
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

                {/* Login link */}
                <p className="mt-5 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>

            {/* Footer badge */}
            <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-600">
                <ShieldCheck size={14} />
                <span>Secured with JWT · Sessions persist across refreshes</span>
            </div>
        </div>
    );
};

export default Register;
