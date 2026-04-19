import React from 'react';

const DEFAULT_FINDINGS = {
    image: [
        'Analyzing facial texture consistency',
        'Evaluating edge artifact patterns',
        'Checking compression anomalies',
    ],
    video: [
        'Temporal consistency analysis',
        'Frame-to-frame coherence check',
        'Motion artifact detection',
    ],
    audio: [
        'Spectral pattern analysis',
        'Voice consistency evaluation',
        'Background noise profiling',
    ],
};

const FactSheetCard = ({ confidence, displayPct, verdict, reportTitle, findings, icon: IconProp, mediaType = 'image' }) => {
    const isReal = verdict === 'REAL';
    const color = isReal ? 'var(--home-real)' : 'var(--home-fake)';

    const displayFindings =
        findings && findings.length > 0
            ? findings.slice(0, 3)
            : (DEFAULT_FINDINGS[mediaType] || DEFAULT_FINDINGS.image);

    // Use strictly displayPct (no fallback to the misleading model confidence)
    const pct = Math.max(0, Math.min(100, Math.round(displayPct ?? 0)));

    return (
        <div style={{ padding: '0', background: 'transparent' }}>
            {/* Percentage + Verdict */}
            <div className="flex items-baseline gap-3 mb-2">
                <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '40px',
                    fontWeight: 400,
                    color: color,
                    lineHeight: 1,
                }}>
                    {pct}%
                </span>
                <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: color,
                }}>
                    {verdict}
                </span>
            </div>

            {/* Report title */}
            <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--home-text-tertiary)',
                marginBottom: '12px',
            }}>
                {reportTitle}
            </p>

            {/* Hairline divider */}
            <div style={{ height: '1px', background: 'var(--home-border)', marginBottom: '12px' }} />

            {/* Findings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {displayFindings.map((finding, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                        <div
                            className="flex-shrink-0"
                            style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                background: color,
                                marginTop: '7px',
                            }}
                        />
                        <span style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            color: 'var(--home-text-secondary)',
                            lineHeight: 1.6,
                        }}>
                            {finding}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FactSheetCard;
