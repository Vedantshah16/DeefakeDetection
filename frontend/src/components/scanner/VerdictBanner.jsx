import React from 'react';

const VerdictBanner = ({ verdict, filename }) => {
    const isReal = verdict === 'REAL';
    const color = isReal ? 'var(--home-real)' : 'var(--home-fake)';
    const bg = isReal ? 'rgba(127, 160, 136, 0.12)' : 'rgba(199, 119, 100, 0.12)';
    const border = isReal ? 'var(--home-real)' : 'var(--home-fake)';

    return (
        <div className="flex items-center gap-3 mb-5">
            <span
                className="inline-flex items-center px-4 py-1.5 text-xs uppercase"
                style={{
                    background: bg,
                    color: color,
                    border: `1px solid ${border}`,
                    borderRadius: '4px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    fontFamily: 'var(--font-body)',
                }}
            >
                {verdict}
            </span>
            {filename && (
                <span
                    className="truncate max-w-[180px]"
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        color: 'var(--home-text-secondary)',
                    }}
                    title={filename}
                >
                    {filename}
                </span>
            )}
        </div>
    );
};

export default VerdictBanner;
