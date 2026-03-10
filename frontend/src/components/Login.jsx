import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
            navigate(location.state?.from?.pathname || '/scanner', { replace: true });
        } catch (err) {
            setError(err?.response?.data?.detail || 'Invalid username or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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

            {/* Login card */}
            <div className="w-full max-w-[420px] bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-8"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 80px rgba(99,102,241,0.05)' }}>
                <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
                <p className="text-sm text-slate-400 mb-6">Sign in to access your detection platform</p>

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
                                placeholder="Username"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
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
                                placeholder="Password"
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
                                <span>Signing in…</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-white/[0.08]" />
                    <span className="text-xs text-slate-600">or</span>
                    <div className="flex-1 h-px bg-white/[0.08]" />
                </div>

                {/* Guest button */}
                <button
                    onClick={() => navigate('/scanner')}
                    className="w-full py-3 border border-white/[0.1] text-slate-400 font-medium rounded-xl hover:bg-white/[0.04] hover:text-white transition-all text-sm"
                >
                    Continue as Guest
                </button>

                {/* Register link */}
                <p className="mt-5 text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                        Create one
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

export default Login;
