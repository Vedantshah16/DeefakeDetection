import React, { useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/* ─── Accent configs per card ─── */
const CARD_CONFIGS = [
    { accent: '#3B82F6', iconBg: 'rgba(59,130,246,0.12)', iconColor: '#60A5FA', key: 'total' },
    { accent: '#EF4444', iconBg: 'rgba(239,68,68,0.10)', iconColor: '#F87171', key: 'fake' },
    { accent: '#10B981', iconBg: 'rgba(16,185,129,0.10)', iconColor: '#34D399', key: 'real' },
    { accent: '#F59E0B', iconBg: 'rgba(245,158,11,0.10)', iconColor: '#FBBF24', key: 'avg' },
];

/* ─── Mini Bar Chart (7 bars) ─── */
const MiniBarChart = ({ data, color }) => {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-[3px]" style={{ height: '28px' }}>
            {data.map((v, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-300"
                    style={{
                        height: `${Math.max(3, (v / max) * 100)}%`,
                        background: color,
                        opacity: 0.4 + (i / data.length) * 0.6,
                    }}
                />
            ))}
        </div>
    );
};

/* ─── Progress Bar ─── */
const MiniProgress = ({ value, color }) => (
    <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
        <div
            className="transition-all duration-700"
            style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: '4px' }}
        />
    </div>
);

/* ─── Signal Bars ─── */
const SignalBars = ({ value, color }) => {
    const bars = 7;
    const filled = Math.round((value / 100) * bars);
    return (
        <div className="flex items-end gap-[3px]" style={{ height: '28px' }}>
            {Array.from({ length: bars }, (_, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                        height: `${20 + (i / (bars - 1)) * 80}%`,
                        background: i < filled ? color : 'rgba(255,255,255,0.06)',
                        opacity: i < filled ? 0.5 + (i / bars) * 0.5 : 1,
                    }}
                />
            ))}
        </div>
    );
};

/* ─── Compute helper: daily counts for last N days ─── */
function getDailyCounts(history, days, filterFn = null) {
    const now = new Date();
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        const count = history.filter(h => {
            const hd = new Date(h.created_at);
            const matches = hd >= d && hd < next;
            return filterFn ? matches && filterFn(h) : matches;
        }).length;
        result.push(count);
    }
    return result;
}

/* ─── Compute week-over-week delta ─── */
function computeDelta(history, filterFn = null) {
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const thisWeek = history.filter(h => {
        const d = new Date(h.created_at);
        return (now - d) < oneWeek && (!filterFn || filterFn(h));
    }).length;
    const lastWeek = history.filter(h => {
        const d = new Date(h.created_at);
        const diff = now - d;
        return diff >= oneWeek && diff < 2 * oneWeek && (!filterFn || filterFn(h));
    }).length;
    if (lastWeek === 0) return thisWeek > 0 ? { value: '+100%', trend: 'up' } : { value: '0%', trend: 'neutral' };
    const pct = ((thisWeek - lastWeek) / lastWeek * 100).toFixed(1);
    return {
        value: `${pct > 0 ? '+' : ''}${pct}%`,
        trend: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral',
    };
}

const HistoryStats = ({ history }) => {
    const totalScans = history.length;
    const fakeScans = history.filter(h => h.result_label === 'FAKE').length;
    const realScans = history.filter(h => h.result_label === 'REAL').length;
    const avgConfidence = totalScans > 0
        ? (history.reduce((acc, h) => acc + h.confidence, 0) / totalScans).toFixed(1)
        : '0.0';
    const realPct = totalScans > 0 ? ((realScans / totalScans) * 100).toFixed(1) : '0.0';

    // Compute deltas
    const totalDelta = computeDelta(history);
    const fakeDelta = computeDelta(history, h => h.result_label === 'FAKE');
    const realDelta = computeDelta(history, h => h.result_label === 'REAL');

    // Daily counts for micro-viz
    const dailyTotal = getDailyCounts(history, 7);
    const dailyFake = getDailyCounts(history, 7, h => h.result_label === 'FAKE');

    const TrendIcon = ({ trend }) => {
        if (trend === 'up') return <TrendingUp size={14} />;
        if (trend === 'down') return <TrendingDown size={14} />;
        return <Minus size={14} />;
    };

    const cards = [
        {
            title: 'Total Analyses',
            value: totalScans,
            delta: totalDelta,
            icon: Activity,
            cfgIdx: 0,
            microViz: <MiniBarChart data={dailyTotal} color="#60A5FA" />,
        },
        {
            title: 'Fake Predictions',
            value: fakeScans,
            delta: fakeDelta,
            icon: AlertTriangle,
            cfgIdx: 1,
            microViz: <MiniBarChart data={dailyFake} color="rgba(248,113,113,0.7)" />,
        },
        {
            title: 'Real Predictions',
            value: realScans,
            delta: realDelta,
            icon: CheckCircle,
            cfgIdx: 2,
            microViz: <MiniProgress value={parseFloat(realPct)} color="#8B5CF6" />,
        },
        {
            title: 'Avg Confidence',
            value: `${avgConfidence}%`,
            delta: { value: 'Mean Score', trend: 'neutral' },
            icon: TrendingUp,
            cfgIdx: 3,
            microViz: <SignalBars value={parseFloat(avgConfidence)} color="#34D399" />,
        },
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cards.map((card, index) => {
                    const cfg = CARD_CONFIGS[card.cfgIdx];
                    const Icon = card.icon;
                    const deltaColor = card.delta.trend === 'up' ? '#34D399' : card.delta.trend === 'down' ? '#F87171' : '#64748b';
                    return (
                        <div
                            key={index}
                            className={`group relative overflow-hidden animate-fade-in-up-delay-${index}`}
                            style={{
                                background: 'rgba(20, 20, 28, 0.6)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '14px',
                                padding: '20px 18px 16px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Top accent border */}
                            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: cfg.accent }} />

                            {/* Hover glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{ background: `linear-gradient(to right, ${cfg.accent}10, transparent 40%)` }} />

                            {/* Header row: label + trend icon */}
                            <div className="relative z-10 flex items-center justify-between mb-2">
                                <span className="text-[10px] font-semibold uppercase text-slate-500" style={{ letterSpacing: '0.08em' }}>
                                    {card.title}
                                </span>
                                <div style={{ color: cfg.iconColor }}>
                                    <TrendIcon trend={card.delta.trend} />
                                </div>
                            </div>

                            {/* Value + delta */}
                            <div className="relative z-10 flex items-baseline gap-2 mb-3">
                                <span style={{ fontSize: '30px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                                    {card.value}
                                </span>
                                <span className="text-[11px] font-semibold" style={{ color: deltaColor }}>
                                    {card.delta.value}
                                </span>
                            </div>

                            {/* Micro visualization */}
                            <div className="relative z-10 mt-auto">
                                {card.microViz}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Model metadata pills */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                {['Model: EfficientNet-B4 v1.0', 'Dataset: ~200 samples', 'Threshold: 0.70'].map((tag, i) => (
                    <span key={i} style={{
                        background: 'transparent',
                        border: '1px solid rgba(139,92,246,0.2)',
                        color: '#818cf8',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 500,
                        letterSpacing: '0.02em',
                    }}>
                        {tag}
                    </span>
                ))}
            </div>
        </>
    );
};

export default HistoryStats;
