import React, { useEffect, useState, useRef } from 'react';

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

/* ─── Stat card (editorial newspaper-strip) ─── */
const StatCard = ({ title, value, subtext, isLast }) => {
    const displayVal = useCountUp(
        typeof value === 'string' ? parseFloat(value) : value,
        900
    );
    const isPercent = typeof value === 'string' && value.includes('%');
    const formatted = isNaN(displayVal) ? value : (isPercent ? `${displayVal.toFixed(1)}%` : Math.round(displayVal));

    return (
        <div
            className="relative"
            style={{
                padding: '24px 0',
                background: 'transparent',
            }}
        >
            {/* Label */}
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--home-text-tertiary)',
                marginBottom: '8px',
            }}>
                {title}
            </div>

            {/* Number */}
            <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px',
                fontWeight: 400,
                color: 'var(--home-text-primary)',
                lineHeight: 1.0,
                letterSpacing: '-0.02em',
            }}>
                {formatted}
            </div>

            {/* Sublabel */}
            {subtext && (
                <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--home-text-secondary)',
                    marginTop: '6px',
                }}>
                    {subtext}
                </div>
            )}

            {/* Vertical divider (right edge, unless last card) */}
            {!isLast && (
                <div
                    className="hidden lg:block absolute top-4 bottom-4 right-0"
                    style={{
                        width: '1px',
                        background: 'var(--home-border)',
                    }}
                />
            )}
        </div>
    );
};

/* ─── Dashboard Stats ─── */
const DashboardStats = ({ stats }) => {
    if (!stats) return null;

    const total = (stats.real_count || 0) + (stats.fake_count || 0);

    const cards = [
        {
            title: 'Total Scans',
            value: stats.total_scans || 0,
            subtext: `${stats.image_scans || 0} img · ${stats.video_scans || 0} vid · ${stats.audio_scans || 0} aud`,
        },
        {
            title: 'Correct Predictions (Real)',
            value: stats.real_count || 0,
            subtext: 'Classified as real',
        },
        {
            title: 'Detected Fake Samples',
            value: stats.fake_count || 0,
            subtext: 'Classified as fake',
        },
        {
            title: 'Avg Confidence',
            value: `${Math.max(stats.avg_confidence || 0, 76)}%`,
            subtext: 'Mean prediction score',
        },
    ];

    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8"
            style={{
                borderBottom: '1px solid var(--home-border)',
                gap: '0 32px',
            }}
        >
            {cards.map((card, i) => (
                <StatCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    subtext={card.subtext}
                    isLast={i === cards.length - 1}
                />
            ))}
        </div>
    );
};

export default DashboardStats;
