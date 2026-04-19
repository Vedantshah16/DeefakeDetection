import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioPlayer = ({ src, audioRef: externalRef, verdict }) => {
    const internalRef = useRef(null);
    const audioRef = externalRef || internalRef;
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const progressRef = useRef(null);
    const rafRef = useRef(null);

    const isReal = verdict === 'REAL';
    const accentColor = isReal ? 'var(--home-real)' : 'var(--home-fake)';

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onMeta = () => setDuration(audio.duration);
        const onEnded = () => {
            setIsPlaying(false);
            cancelAnimationFrame(rafRef.current);
        };

        audio.addEventListener('loadedmetadata', onMeta);
        audio.addEventListener('ended', onEnded);

        // If metadata already loaded
        if (audio.duration) setDuration(audio.duration);

        return () => {
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.removeEventListener('ended', onEnded);
            cancelAnimationFrame(rafRef.current);
        };
    }, [audioRef]);

    const tick = useCallback(() => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        rafRef.current = requestAnimationFrame(tick);
    }, [audioRef]);

    const togglePlay = (e) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            cancelAnimationFrame(rafRef.current);
        } else {
            audio.play();
            rafRef.current = requestAnimationFrame(tick);
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        e.stopPropagation();
        const audio = audioRef.current;
        const bar = progressRef.current;
        if (!audio || !bar || !duration) return;

        const rect = bar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = ratio * duration;
        setCurrentTime(audio.currentTime);
    };

    const fmt = (t) => {
        if (!t || isNaN(t)) return '0:00';
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex items-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play / Pause */}
            <button
                onClick={togglePlay}
                className="flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                    width: '40px',
                    height: '40px',
                    background: 'transparent',
                    border: '1px solid var(--home-border)',
                    color: 'var(--home-text-primary)',
                    cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--home-accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--home-border)'; }}
            >
                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>

            {/* Progress + Time */}
            <div className="flex-1 flex flex-col gap-1.5">
                <div
                    ref={progressRef}
                    onClick={handleSeek}
                    className="w-full cursor-pointer"
                    style={{ height: '14px', display: 'flex', alignItems: 'center' }}
                >
                    <div style={{
                        width: '100%',
                        height: '2px',
                        background: 'var(--home-border)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        position: 'relative',
                    }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${progress}%`,
                                background: accentColor,
                                borderRadius: '2px',
                                transition: 'width 0.1s linear',
                            }}
                        />
                    </div>
                </div>
                <div className="flex justify-between">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--home-text-secondary)' }}>{fmt(currentTime)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--home-text-secondary)' }}>{fmt(duration)}</span>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
