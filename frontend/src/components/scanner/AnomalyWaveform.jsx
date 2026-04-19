import React, { useRef, useEffect, useState, useCallback } from 'react';

const SAMPLES = 120;

/* ─── Seeded PRNG for deterministic fallback waveform ─── */
function seededRandom(seed) {
    let x = 0;
    for (let i = 0; i < seed.length; i++) {
        x = ((x << 5) - x) + seed.charCodeAt(i);
        x |= 0;
    }
    return () => {
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        return (x >>> 0) / 4294967296;
    };
}

function generateFallbackWaveform(filename) {
    const rng = seededRandom(filename || 'truesight-fallback-seed');
    const peaks = [];
    let prev = 0.5;
    for (let i = 0; i < SAMPLES; i++) {
        prev = prev * 0.7 + rng() * 0.3;
        peaks.push(prev);
    }
    const max = Math.max(...peaks);
    return peaks.map(p => p / max);
}

/* ─── Color interpolation helper ─── */
function lerpColor(a, b, t) {
    return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t),
    ];
}

/* ─── Component ─── */
const AnomalyWaveform = ({ file, verdict, confidence, mediaRef, filename }) => {
    const canvasRef = useRef(null);
    const [waveformData, setWaveformData] = useState(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [isFallback, setIsFallback] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const rafRef = useRef(null);

    const isFake = verdict === 'FAKE';

    /* ─── 1. Decode audio from file via Web Audio API ─── */
    useEffect(() => {
        let cancelled = false;
        let ctx = null;

        const decode = async () => {
            if (!file) {
                setWaveformData(generateFallbackWaveform(filename || 'no-file'));
                setIsFallback(true);
                return;
            }

            try {
                const arrayBuffer = await file.arrayBuffer();
                ctx = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                if (cancelled) return;

                const rawData = audioBuffer.getChannelData(0);
                const blockSize = Math.floor(rawData.length / SAMPLES);
                const peaks = [];
                for (let i = 0; i < SAMPLES; i++) {
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(rawData[i * blockSize + j]);
                    }
                    peaks.push(sum / blockSize);
                }

                const max = Math.max(...peaks);
                const normalized = peaks.map(p => max > 0 ? p / max : 0);

                setWaveformData(normalized);
                setAudioDuration(audioBuffer.duration);
                setIsFallback(false);
            } catch (err) {
                console.warn('Web Audio decode failed, using fallback waveform:', err.message);
                if (!cancelled) {
                    setWaveformData(generateFallbackWaveform(filename || file?.name || 'decode-error'));
                    setIsFallback(true);
                }
            }
        };

        decode();

        return () => {
            cancelled = true;
            if (ctx && ctx.state !== 'closed') {
                ctx.close().catch(() => {});
            }
        };
    }, [file, filename]);

    /* ─── 2. Sync playhead with media element ─── */
    useEffect(() => {
        const syncPlayhead = () => {
            if (mediaRef?.current) {
                setCurrentTime(mediaRef.current.currentTime);
                if (!isNaN(mediaRef.current.duration) && mediaRef.current.duration > 0) {
                    setAudioDuration(prev => prev || mediaRef.current.duration);
                }
            }
            rafRef.current = requestAnimationFrame(syncPlayhead);
        };

        rafRef.current = requestAnimationFrame(syncPlayhead);
        return () => cancelAnimationFrame(rafRef.current);
    }, [mediaRef]);

    /* ─── 3. Draw waveform + playhead on canvas ─── */
    useEffect(() => {
        if (!waveformData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const barWidth = Math.max(2, (width / waveformData.length) - 1.5);

        ctx.clearRect(0, 0, width, height);

        /* Editorial color palettes */
        const amberRGB  = [212, 179, 106]; // #D4B36A warm amber
        const midRGB    = [184, 138, 92];  // #B88A5C warm mid-orange
        const oxbloodRGB = [199, 119, 100]; // #C77764 oxblood
        const sageRGB   = [127, 160, 136]; // #7FA088 sage

        waveformData.forEach((value, i) => {
            const x = (i / waveformData.length) * width;
            const barHeight = Math.max(2, value * (height - 6));
            const y = height - barHeight;

            let color;
            if (isFake) {
                // Editorial gradient: warm amber → mid → oxblood by amplitude
                if (value < 0.33) {
                    const rgb = lerpColor(amberRGB, midRGB, value / 0.33);
                    color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
                } else if (value < 0.66) {
                    const rgb = lerpColor(midRGB, oxbloodRGB, (value - 0.33) / 0.33);
                    color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
                } else {
                    color = `rgb(${oxbloodRGB[0]}, ${oxbloodRGB[1]}, ${oxbloodRGB[2]})`;
                }
            } else {
                // Sage with amplitude-scaled opacity
                const opacity = 0.35 + value * 0.65;
                color = `rgba(${sageRGB[0]}, ${sageRGB[1]}, ${sageRGB[2]}, ${opacity})`;
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x, y, barWidth, barHeight, 1);
            } else {
                ctx.rect(x, y, barWidth, barHeight);
            }
            ctx.fill();
        });

        // Playhead — cream 1px
        if (audioDuration > 0 && currentTime > 0) {
            const px = (currentTime / audioDuration) * width;
            ctx.strokeStyle = '#F5F1E8';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, height);
            ctx.stroke();
        }
    }, [waveformData, currentTime, audioDuration, isFake]);

    /* ─── 4. Click-to-seek ─── */
    const handleCanvasClick = (e) => {
        e.stopPropagation();
        if (!mediaRef?.current || audioDuration <= 0 || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        mediaRef.current.currentTime = ratio * audioDuration;
    };

    /* ─── 5. Timeline ruler labels ─── */
    const timeLabels = [];
    if (audioDuration > 0) {
        const ticks = audioDuration > 60 ? 6 : audioDuration > 10 ? 5 : Math.max(3, Math.ceil(audioDuration) + 1);
        const step = audioDuration / (ticks - 1);
        for (let i = 0; i < ticks; i++) {
            const t = Math.min(step * i, audioDuration);
            const m = Math.floor(t / 60);
            const s = Math.floor(t % 60);
            timeLabels.push(`${m}:${String(s).padStart(2, '0')}`);
        }
    }

    /* ─── 6. Caption ─── */
    const suspicion = isFake ? 'HIGH' : 'LOW';
    const captionColor = isFake ? 'var(--home-fake)' : 'var(--home-real)';

    return (
        <div
            className="p-4 mb-4"
            style={{
                background: 'transparent',
                borderRadius: '4px',
            }}
        >
            <div className="flex items-center gap-2 mb-3">
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--home-text-tertiary)',
                    }}
                >
                    {isFallback ? 'WAVEFORM PREVIEW' : 'WAVEFORM VISUALIZATION'}
                </span>
            </div>

            {waveformData ? (
                <>
                    <div
                        className="relative cursor-pointer"
                        style={{ height: '90px' }}
                        onClick={handleCanvasClick}
                    >
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full"
                            style={{ background: 'rgba(15,14,11,0.4)', borderRadius: '4px' }}
                        />
                    </div>

                    {/* Timeline ruler */}
                    {timeLabels.length > 0 && (
                        <div className="flex justify-between mt-1.5 px-0.5">
                            {timeLabels.map((label, i) => (
                                <span key={i} style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: 'var(--home-text-tertiary)',
                                }}>
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Caption */}
                    <div className="flex items-center gap-1.5 mt-3">
                        <span
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '9px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                color: captionColor,
                            }}
                        >
                            {isFallback
                                ? '● WAVEFORM PREVIEW UNAVAILABLE'
                                : `● WAVEFORM VISUALIZATION — ${suspicion} SUSPICION REGIONS`}
                        </span>
                    </div>
                </>
            ) : (
                <div
                    className="flex flex-col items-center justify-center py-6"
                    style={{ background: 'rgba(15,14,11,0.3)', borderRadius: '4px' }}
                >
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--home-text-tertiary)',
                        letterSpacing: '0.1em',
                    }}>
                        Decoding audio waveform...
                    </span>
                </div>
            )}
        </div>
    );
};

export default AnomalyWaveform;
