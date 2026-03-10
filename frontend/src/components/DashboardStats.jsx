import React, { useEffect, useState, useRef } from 'react';
import { Shield, AlertTriangle, Activity, Layers } from 'lucide-react';

/* ─── Animated counter ─── */
function useCountUp(target, duration = 800) {
    const [value, setValue] = useState(0);
    const prev = useRef(0);

    useEffect(() => {
        if (target == null) return;
        const start = prev.current;
        const end = typeof target === 'string' ? parseFloat(target) : target;
        if (isNaN(end)) { setValue(target); return; }
        const range = end - start;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setValue(start + range * eased);
            if (progress < 1) requestAnimationFrame(tick);
            else prev.current = end;
        };
        requestAnimationFrame(tick);
    }, [target, duration]);

    return value;
}

/* ─── Mini ring ─── */
function MiniRing({ percent, color, size = 36 }) {
    const r = (size - 4) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (c * Math.min(percent, 100)) / 100;

    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
                className="text-white/[0.06]" strokeWidth={3} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
                strokeWidth={3} strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={offset}
                className="confidence-ring"
                style={{ filter: `drop-shadow(0 0 4px ${color}40)` }} />
        </svg>
    );
}

/* ─── Stat card ─── */
const StatCard = ({ title, value, subtext, icon: Icon, accentColor, ringPercent, delay }) => {
    const displayVal = useCountUp(
        typeof value === 'string' ? parseFloat(value) : value,
        900
    );
    const isPercent = typeof value === 'string' && value.includes('%');
    const formatted = isNaN(displayVal) ? value : (isPercent ? `${displayVal.toFixed(1)}%` : Math.round(displayVal));

    return (
        <div
            className="group relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 overflow-hidden
                        hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${delay}ms`, borderLeftColor: accentColor, borderLeftWidth: '4px' }}
        >
            {/* Hover glow (subtle) */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `linear-gradient(to right, ${accentColor}10, transparent 40%)` }} />

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1">
                    <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{title}</div>
                    <div className="text-2xl font-bold tracking-tight text-white">{formatted}</div>
                    {subtext && <div className="text-slate-600 text-xs font-medium">{subtext}</div>}
                </div>

                <div className="relative flex items-center justify-center">
                    {ringPercent != null ? (
                        <div className="relative">
                            <MiniRing percent={ringPercent} color={accentColor} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Icon size={14} style={{ color: accentColor }} />
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/[0.06]"
                            style={{ backgroundColor: `${accentColor}15` }}>
                            <Icon size={18} style={{ color: accentColor }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── Dashboard Stats ─── */
const DashboardStats = ({ stats }) => {
    if (!stats) return null;

    const total = (stats.real_count || 0) + (stats.fake_count || 0);
    const authPercent = total > 0 ? ((stats.real_count || 0) / total) * 100 : 0;
    const fakePercent = total > 0 ? ((stats.fake_count || 0) / total) * 100 : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
                title="Total Scans"
                value={stats.total_scans || 0}
                subtext={`${stats.image_scans || 0} img · ${stats.video_scans || 0} vid`}
                icon={Layers}
                accentColor="#818cf8"
                delay={50}
            />
            <StatCard
                title="Authentic"
                value={stats.real_count || 0}
                subtext="Verified human"
                icon={Shield}
                accentColor="#34d399"
                ringPercent={authPercent}
                delay={100}
            />
            <StatCard
                title="Deepfakes"
                value={stats.fake_count || 0}
                subtext="Synthetic detected"
                icon={AlertTriangle}
                accentColor="#fb7185"
                ringPercent={fakePercent}
                delay={150}
            />
            <StatCard
                title="Avg Confidence"
                value={`${stats.avg_confidence || 0}%`}
                subtext="Model certainty"
                icon={Activity}
                accentColor="#fbbf24"
                ringPercent={stats.avg_confidence || 0}
                delay={200}
            />
        </div>
    );
};

export default DashboardStats;
