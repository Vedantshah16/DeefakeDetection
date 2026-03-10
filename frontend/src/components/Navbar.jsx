import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LogIn, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StackingNavbar } from './ui/stacking-navbar';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-4 z-50 mb-10 animate-slide-up px-4">
            <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-4 flex justify-between items-center border border-white/[0.06]"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(99,102,241,0.04)' }}>
                <NavLink to="/" className="flex items-center gap-3.5 group cursor-pointer decoration-0">
                    <div className="relative w-10 h-10">
                        <img src="/truesight_logo_v3.png" alt="TrueSight Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors duration-300">
                            TrueSight <span className="gradient-text">AI</span>
                        </h1>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Deepfake Defense
                        </div>
                    </div>
                </NavLink>

                <div className="hidden md:block">
                    <StackingNavbar />
                </div>

                <div className="flex gap-3 items-center">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            {/* Online indicator */}
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-full border border-white/[0.08] text-[11px] font-medium text-slate-400">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                                </span>
                                <span>Online</span>
                            </div>

                            {/* Username chip */}
                            <div className="hidden md:flex items-center gap-2 bg-white/[0.06] rounded-xl px-3 py-1.5 border border-white/[0.08]">
                                <UserIcon size={14} className="text-slate-400" />
                                <span className="text-sm font-medium text-slate-300">{user.username}</span>
                            </div>

                            {/* Logout button */}
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] transition-all"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-indigo-300 font-semibold hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all text-sm"
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
