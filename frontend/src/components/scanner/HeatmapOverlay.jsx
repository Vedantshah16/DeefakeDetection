import React, { useRef, useEffect } from 'react';

const HeatmapOverlay = ({ imageUrl, verdict, confidence }) => {
    const isReal = verdict === 'REAL';

    /* Editorial semantic colors */
    const glowColor = isReal ? 'rgba(127, 160, 136, 0.35)' : 'rgba(199, 119, 100, 0.35)';
    const borderColor = isReal ? 'rgba(127, 160, 136, 0.5)' : 'rgba(199, 119, 100, 0.5)';

    const haloRef = useRef(null);
    const thumbnailRef = useRef(null);

    // Confidence as 0–1
    const conf01 = Math.min(confidence || 0, 100) / 100;
    const haloOpacity = 0.4 + conf01 * 0.6;

    /* ─── Draw confidence halo on main image ─── */
    useEffect(() => {
        const canvas = haloRef.current;
        if (!canvas) return;

        const draw = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const radius = Math.min(rect.width, rect.height) * 0.65;

            /* Oxblood / sage halo colors */
            const innerColor = isReal
                ? 'rgba(127, 160, 136, 0.40)'
                : 'rgba(199, 119, 100, 0.50)';
            const outerColor = isReal
                ? 'rgba(127, 160, 136, 0)'
                : 'rgba(199, 119, 100, 0)';

            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            gradient.addColorStop(0, innerColor);
            gradient.addColorStop(0.65, outerColor);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, rect.width, rect.height);
        };

        // Draw after image has loaded and sized the container
        const timer = setTimeout(draw, 100);
        window.addEventListener('resize', draw);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', draw);
        };
    }, [isReal, conf01]);

    /* ─── Draw 3×3 blob grid in thumbnail ─── */
    useEffect(() => {
        const canvas = thumbnailRef.current;
        if (!canvas) return;

        const draw = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            const w = rect.width;
            const h = rect.height;

            // Strengths: center strongest, corners faintest
            const strengths = [
                [0.2, 0.4, 0.2],
                [0.4, 1.0, 0.4],
                [0.2, 0.4, 0.2],
            ];

            /* Oxblood / sage blob colors */
            const blobColor = isReal ? [127, 160, 136] : [199, 119, 100];

            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const cx = (col + 0.5) * (w / 3);
                    const cy = (row + 0.5) * (h / 3);
                    const r = Math.min(w, h) / 4.5;
                    const strength = strengths[row][col];

                    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
                    gradient.addColorStop(0, `rgba(${blobColor.join(',')}, ${strength * 0.65})`);
                    gradient.addColorStop(1, `rgba(${blobColor.join(',')}, 0)`);

                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, w, h);
                }
            }
        };

        const timer = setTimeout(draw, 100);
        return () => clearTimeout(timer);
    }, [isReal]);

    /* ─── Caption text ─── */
    const captionText = isReal
        ? 'CONFIDENCE VISUALIZATION — LOW SUSPICION'
        : 'CONFIDENCE VISUALIZATION — HIGH SUSPICION';
    const captionColor = isReal ? 'var(--home-real)' : 'var(--home-fake)';

    return (
        <div className="relative mb-5">
            <div className="flex gap-3">
                {/* Main image with confidence halo */}
                <div
                    className="relative flex-1 overflow-hidden"
                    style={{
                        borderRadius: '4px',
                        border: `1px solid ${borderColor}`,
                        boxShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor.replace('0.35', '0.10')}`,
                    }}
                >
                    <img
                        src={imageUrl}
                        alt="Analyzed"
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '280px', background: 'rgba(15,14,11,0.5)' }}
                    />

                    {/* Confidence halo canvas overlay */}
                    <canvas
                        ref={haloRef}
                        className="absolute inset-0 w-full h-full pointer-events-none animate-pulse-slow"
                        style={{
                            mixBlendMode: 'screen',
                            opacity: haloOpacity,
                        }}
                    />

                    {/* Face detection bracket corners — cream */}
                    <div className="absolute inset-[12%] pointer-events-none">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2"
                            style={{ borderColor: 'var(--home-text-primary)' }} />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2"
                            style={{ borderColor: 'var(--home-text-primary)' }} />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2"
                            style={{ borderColor: 'var(--home-text-primary)' }} />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2"
                            style={{ borderColor: 'var(--home-text-primary)' }} />
                    </div>

                    {/* Caption pill (bottom-left inside image) */}
                    <div
                        className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1.5"
                        style={{
                            background: 'rgba(15, 14, 11, 0.55)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: '2px',
                        }}
                        title="Visualization derived from the model's final confidence score. Not a pixel-level attention map."
                    >
                        <span
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '8px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                color: captionColor,
                            }}
                        >
                            ● {captionText}
                        </span>
                    </div>
                </div>

                {/* Attention map thumbnail — 3×3 blob grid */}
                <div className="w-[88px] flex-shrink-0 flex flex-col gap-1.5">
                    <div
                        className="w-full aspect-square overflow-hidden relative"
                        style={{
                            background: 'rgba(15, 14, 11, 0.9)',
                            border: '1px solid var(--home-border)',
                            borderRadius: '4px',
                        }}
                    >
                        <canvas ref={thumbnailRef} className="w-full h-full" />
                    </div>
                    <div className="text-center">
                        <p style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '8px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            letterSpacing: '0.2em',
                            color: 'var(--home-text-tertiary)',
                        }}>
                            Model Focus
                        </p>
                        <p style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '7px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            letterSpacing: '0.2em',
                            color: 'var(--home-text-tertiary)',
                            marginTop: '2px',
                            opacity: 0.6,
                        }}>
                            Illustrative
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatmapOverlay;
