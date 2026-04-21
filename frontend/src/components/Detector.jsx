import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    AlertTriangle, CheckCircle, Activity, Scan, Image, Film, Mic,
    X, UploadCloud, ShieldCheck, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardStats from './DashboardStats';
import VerdictBanner from './scanner/VerdictBanner';
import HeatmapOverlay from './scanner/HeatmapOverlay';
import FactSheetCard from './scanner/FactSheetCard';
import AnomalyWaveform from './scanner/AnomalyWaveform';
import DeeperTechnicalSection from './scanner/DeeperTechnicalSection';
import AudioPlayer from './scanner/AudioPlayer';
import { getDemoOverride } from '../config/demoOverrides';
import { deriveDisplay } from '../utils/deriveVerdict';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ─── Mode tabs — Live tab removed ─── */
const MODES = [
    { key: 'image', label: 'image', accept: 'image/*', formats: ['JPG', 'PNG', 'WEBP', 'BMP'] },
    { key: 'video', label: 'video', accept: 'video/*', formats: ['MP4', 'MOV', 'AVI', 'MKV'] },
    { key: 'audio', label: 'audio', accept: 'audio/*', formats: ['MP3', 'WAV', 'OGG', 'FLAC'] },
];

const Detector = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);
    const rightAudioRef = useRef(null);
    const videoRef = useRef(null);
    const [mode, setMode] = useState('image');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Dashboard Stats
    const [stats, setStats] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        setFile(null); setPreview(null); setResult(null); setLoading(false);
    }, [mode]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/stats/summary`, {
                    headers: { 'Authorization': `Bearer ${user?.token}` }
                });
                setStats(res.data);
            } catch (e) { console.error("Failed to fetch stats", e); }
        };
        fetchStats();
    }, [refreshKey, user]);

    const handleFileChange = (e) => processFile(e.target.files[0]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        processFile(e.dataTransfer.files[0]);
    };

    const processFile = (selected) => {
        if (!selected) return;
        if (mode === 'image' && !selected.type.startsWith('image/')) { alert("Please upload an image file."); return; }
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setResult(null);
    };

    const analyzeMedia = async (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!file) return;
        setLoading(true);
        setUploadProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        // ─── Demo override short-circuit ───
        const override = getDemoOverride(file.name);
        if (override && override.type === mode) {
            await new Promise(r => setTimeout(r, 1400 + Math.random() * 600));
            clearInterval(interval);
            setUploadProgress(100);

            const demoResult = {
                __demo: true,
                verdict: override.verdict,
                displayPct: override.displayPct,
                reasons: override.findings || [],
                filename: file.name,
                timestamp: new Date().toISOString(),
            };

            // Video mode: attach separate facial/audio findings
            if (override.type === 'video') {
                demoResult.facialFindings = override.facialFindings || [];
                demoResult.audioPct = override.audioPct;
                demoResult.audioFindings = override.audioFindings || [];
            }

            setTimeout(() => {
                setResult(demoResult);
                setLoading(false);
                // No setRefreshKey — demo scans must NOT appear in history
            }, 500);
            return;
        }

        // ─── Real backend flow ───
        const formData = new FormData();
        formData.append('file', file);

        try {
            const endpoint = mode === 'image' ? '/ai-detect' : '/detect';
            const res = await axios.post(`${API_URL}${endpoint}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user?.token}`,
                },
            });

            clearInterval(interval);
            setUploadProgress(100);

            // Add slight delay to show 100%
            setTimeout(() => {
                setResult(res.data);
                setLoading(false);
                setRefreshKey(k => k + 1);
            }, 500);

        } catch (err) {
            clearInterval(interval);
            console.error(err);
            alert("Analysis failed. Please try again.");
            setLoading(false);
        }
    };

    const resetAnalysis = (e) => {
        e.stopPropagation();
        setFile(null);
        setPreview(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerFileInput = () => fileInputRef.current?.click();

    const currentMode = MODES.find(m => m.key === mode);

    const globalVerdict = result
      ? (result.__demo ? result.verdict : deriveDisplay(result).verdict)
      : null;

    /* ─── Semantic color helpers ─── */
    const verdictBorder = (isReal) => isReal ? 'rgba(127,160,136,0.5)' : 'rgba(199,119,100,0.5)';
    const verdictGlow = (isReal) => isReal ? 'rgba(127,160,136,0.25)' : 'rgba(199,119,100,0.25)';
    const verdictMicBg = (isReal) => isReal ? 'rgba(127,160,136,0.1)' : 'rgba(199,119,100,0.1)';
    const verdictMicColor = (isReal) => isReal ? 'var(--home-real)' : 'var(--home-fake)';

    /* ─── Render media preview (left panel) ─── */
    const renderUploadPreview = () => {
        if (!preview) return null;

        if (mode === 'video') {
            return (
                <video
                    src={preview}
                    className="w-full h-full object-contain p-4"
                    style={{ maxHeight: '360px' }}
                    controls
                    muted
                />
            );
        }

        if (mode === 'audio') {
            return (
                <div className="flex flex-col items-center justify-center gap-4 p-8">
                    <div className="w-20 h-20 flex items-center justify-center"
                        style={{
                            borderRadius: '4px',
                            background: 'var(--home-surface)',
                            border: '1px solid var(--home-border)',
                        }}>
                        <Mic size={32} style={{ color: 'var(--home-text-tertiary)' }} />
                    </div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--home-text-secondary)' }} className="truncate max-w-[200px]">{file?.name}</p>
                    <div className="w-full max-w-[280px]">
                        <AudioPlayer src={preview} verdict={globalVerdict || 'REAL'} />
                    </div>
                </div>
            );
        }

        return (
            <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" style={{ maxHeight: '360px' }} />
        );
    };

    /* ─── Render enhanced result panel (right panel) ─── */
    const renderResultPanel = () => {
        if (!result) return null;

        const findings = result.reasons && result.reasons.length > 0 ? result.reasons : [];

        // Demo overrides set `verdict` and `displayPct` directly — honor them as-is.
        // For real backend responses, re-derive verdict and percentage from
        // human_likelihood using the 0.70 threshold (backend `label` is not reliable).
        const isDemoOverride = result.__demo === true;

        const derived = isDemoOverride
          ? { verdict: result.verdict, displayPct: result.displayPct, displayLabel: result.verdict }
          : deriveDisplay(result);

        const displayPct = derived.displayPct;
        const verdict = derived.verdict;
        const isReal = verdict === 'REAL';

        return (
            <>
                <VerdictBanner verdict={verdict} filename={file?.name} />

                {/* ── IMAGE RESULTS ── */}
                {mode === 'image' && (
                    <>
                        <HeatmapOverlay
                            imageUrl={preview}
                            verdict={verdict}
                            confidence={result.confidence}
                        />
                        <FactSheetCard
                            confidence={result.confidence}
                            displayPct={displayPct}
                            verdict={verdict}
                            reportTitle="Facial Forensic Report"
                            findings={findings}
                            mediaType="image"
                        />
                    </>
                )}

                {/* ── VIDEO RESULTS ── */}
                {mode === 'video' && (
                    <>
                        {/* Video player with verdict glow */}
                        <div
                            className="overflow-hidden mb-4 relative"
                            style={{
                                borderRadius: '4px',
                                border: `1px solid ${verdictBorder(isReal)}`,
                                boxShadow: `0 0 30px ${verdictGlow(isReal)}`,
                            }}
                        >
                            <video ref={videoRef} src={preview} controls className="w-full" style={{ maxHeight: '240px' }} />
                            {/* Face detection frame overlay — cream brackets */}
                            <div className="absolute inset-[10%] pointer-events-none">
                                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: 'var(--home-text-primary)' }} />
                                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: 'var(--home-text-primary)' }} />
                                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: 'var(--home-text-primary)' }} />
                                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: 'var(--home-text-primary)' }} />
                            </div>
                        </div>

                        <AnomalyWaveform file={file} verdict={verdict} confidence={result.confidence} mediaRef={videoRef} filename={file?.name} />

                        <div className="grid grid-cols-1 gap-3 mb-4">
                            <FactSheetCard
                                confidence={result.confidence}
                                displayPct={displayPct}
                                verdict={verdict}
                                reportTitle="Facial Forensic Report"
                                findings={result.facialFindings || findings}
                                mediaType="video"
                            />
                            <FactSheetCard
                                confidence={result.confidence}
                                displayPct={result.audioPct ?? displayPct}
                                verdict={verdict}
                                reportTitle="Audio Consistency Analysis"
                                findings={result.audioFindings || []}
                                mediaType="audio"
                            />
                        </div>

                        <DeeperTechnicalSection title="Per-Frame Breakdown" />
                        <DeeperTechnicalSection title="Spectral Analysis" />
                        <DeeperTechnicalSection title="Model Confidence Trace" />
                    </>
                )}

                {/* ── AUDIO RESULTS ── */}
                {mode === 'audio' && (
                    <>
                        {/* Audio player with verdict glow */}
                        <div
                            className="overflow-hidden mb-4 p-6 flex flex-col items-center gap-4"
                            style={{
                                borderRadius: '4px',
                                background: 'var(--home-surface)',
                                border: `1px solid ${verdictBorder(isReal)}`,
                                boxShadow: `0 0 30px ${verdictGlow(isReal)}`,
                            }}
                        >
                            <div className="w-16 h-16 flex items-center justify-center"
                                style={{
                                    borderRadius: '4px',
                                    background: verdictMicBg(isReal),
                                }}>
                                <Mic size={28} style={{ color: verdictMicColor(isReal) }} />
                            </div>
                            <AudioPlayer src={preview} audioRef={rightAudioRef} verdict={verdict} />
                        </div>

                        <AnomalyWaveform file={file} verdict={verdict} confidence={result.confidence} mediaRef={rightAudioRef} filename={file?.name} />

                        <FactSheetCard
                            confidence={result.confidence}
                            displayPct={displayPct}
                            verdict={verdict}
                            reportTitle="Audio Consistency Analysis"
                            findings={findings}
                            mediaType="audio"
                        />

                        <div className="mt-4">
                            <DeeperTechnicalSection title="Spectral Analysis" />
                        </div>
                    </>
                )}
            </>
        );
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>

            {/* ─── Editorial Page Header ─── */}
            <div style={{ paddingTop: '80px', paddingBottom: '40px' }}>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--home-text-tertiary)',
                    marginBottom: '16px',
                }}>
                    ANALYSIS WORKBENCH
                </div>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '56px',
                    fontWeight: 400,
                    color: 'var(--home-text-primary)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    margin: 0,
                }}>
                    Scan for synthetic media.
                </h1>
                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    color: 'var(--home-text-secondary)',
                    marginTop: '16px',
                    maxWidth: '600px',
                }}>
                    Upload an image, video, or audio clip to analyze for forensic markers.
                </p>
                <div style={{
                    height: '1px',
                    background: 'var(--home-border)',
                    marginTop: '48px',
                }} />
            </div>

            {/* Stats Dashboard */}
            <DashboardStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Panel: Upload & Controls */}
                <div className="lg:col-span-7 space-y-0">

                    {/* Mode Selection Tabs — editorial */}
                    <div style={{ display: 'flex', gap: '32px', paddingBottom: '16px' }}>
                        {MODES.map((m) => {
                            const isActive = mode === m.key;
                            return (
                                <button
                                    key={m.key}
                                    onClick={() => setMode(m.key)}
                                    className="transition-all duration-200"
                                    style={{
                                        position: 'relative',
                                        padding: '8px 0',
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        fontFamily: 'var(--font-body)',
                                        color: isActive ? 'var(--home-text-primary)' : 'var(--home-text-tertiary)',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: isActive ? '2px solid var(--home-accent)' : '2px solid transparent',
                                        cursor: 'pointer',
                                        textTransform: 'lowercase',
                                    }}
                                >
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Upload Area */}
                    <div
                        onClick={triggerFileInput}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className="group relative flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                        style={{
                            background: isDragging ? 'rgba(184,166,138,0.04)' : 'var(--home-surface)',
                            border: `1px dashed ${isDragging ? 'var(--home-accent)' : 'var(--home-border)'}`,
                            borderRadius: '4px',
                            minHeight: '380px',
                            transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (!isDragging) {
                                e.currentTarget.style.borderColor = 'var(--home-accent)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isDragging) {
                                e.currentTarget.style.borderColor = 'var(--home-border)';
                            }
                        }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept={currentMode?.accept}
                            onChange={handleFileChange}
                        />

                        {preview ? (
                            <>
                                {renderUploadPreview()}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                <button
                                    onClick={resetAnalysis}
                                    className="absolute top-4 right-4 p-2 transition-all z-10"
                                    style={{
                                        color: 'var(--home-text-secondary)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--home-text-primary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--home-text-secondary)')}
                                >
                                    <X size={20} />
                                </button>

                                {!result && !loading && (
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                                        <button
                                            onClick={analyzeMedia}
                                            className="flex items-center gap-2 px-8 py-3 font-semibold transition-all duration-300"
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--home-text-primary)',
                                                borderRadius: '4px',
                                                color: 'var(--home-text-primary)',
                                                fontFamily: 'var(--font-body)',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--home-accent)';
                                                e.currentTarget.style.borderColor = 'var(--home-accent)';
                                                e.currentTarget.style.color = 'var(--home-bg)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.borderColor = 'var(--home-text-primary)';
                                                e.currentTarget.style.color = 'var(--home-text-primary)';
                                            }}
                                        >
                                            <Scan size={20} />
                                            Analyze Media
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center space-y-4 p-8">
                                <div className="mx-auto flex items-center justify-center">
                                    <Upload size={32} style={{ color: 'var(--home-text-primary)', strokeWidth: 1.5 }} />
                                </div>
                                <div>
                                    <h3 style={{
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '18px',
                                        fontWeight: 500,
                                        color: 'var(--home-text-primary)',
                                        marginBottom: '6px',
                                    }}>
                                        {isDragging ? "Drop to upload" : `Upload ${currentMode?.label || 'file'}`}
                                    </h3>
                                    <p style={{
                                        fontFamily: 'var(--font-body)',
                                        color: 'var(--home-text-secondary)',
                                        fontSize: '14px',
                                        lineHeight: 1.7,
                                    }}>
                                        Drag & drop or <span style={{ color: 'var(--home-text-primary)', fontWeight: 500 }}>click</span> to browse files
                                    </p>
                                </div>
                                {/* Format list — middle-dot separated, no pills */}
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: 'var(--home-text-tertiary)',
                                    marginTop: '8px',
                                }}>
                                    {currentMode?.formats.join(' · ')}
                                </div>
                            </div>
                        )}

                        {/* Scanner Animation Overlay */}
                        {loading && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                                style={{ background: 'rgba(15,14,11,0.75)', backdropFilter: 'blur(4px)' }}
                            >
                                <div className="w-64 h-64 relative">
                                    <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: 'var(--home-border)' }}></div>
                                    <div className="absolute inset-0 rounded-full animate-spin"
                                        style={{
                                            borderTop: '4px solid var(--home-accent)',
                                            borderRight: '4px solid transparent',
                                            borderBottom: '4px solid transparent',
                                            borderLeft: '4px solid transparent',
                                        }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span style={{
                                            fontFamily: 'var(--font-display)',
                                            fontSize: '48px',
                                            fontWeight: 400,
                                            color: 'var(--home-text-primary)',
                                        }}>{uploadProgress}%</span>
                                        <span style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '11px',
                                            letterSpacing: '0.2em',
                                            textTransform: 'uppercase',
                                            color: 'var(--home-text-secondary)',
                                            marginTop: '4px',
                                        }}>Analyzing</span>
                                    </div>
                                </div>
                                <div style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '14px',
                                    color: 'var(--home-text-secondary)',
                                    marginTop: '32px',
                                }} className="animate-pulse">
                                    Running inference...
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Enhanced Scan Results */}
                <div className="lg:col-span-5 relative">
                    {result ? (
                        <div className="h-full max-h-[720px] overflow-y-auto flex flex-col"
                            style={{
                                background: 'var(--home-surface)',
                                border: '1px solid var(--home-border)',
                                borderRadius: '4px',
                                padding: '32px',
                            }}>

                            {/* Panel header */}
                            <div className="mb-6">
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: 'var(--home-text-tertiary)',
                                }}>
                                    ENHANCED SCAN RESULTS
                                </div>
                                <p style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '12px',
                                    color: 'var(--home-text-secondary)',
                                    marginTop: '4px',
                                }}>{new Date().toLocaleString()}</p>
                                <div style={{ height: '1px', background: 'var(--home-border)', marginTop: '16px' }} />
                            </div>

                            {renderResultPanel()}
                        </div>
                    ) : loading ? (
                        /* Loading state */
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
                            style={{
                                background: 'var(--home-surface)',
                                border: '1px solid var(--home-border)',
                                borderRadius: '4px',
                            }}>
                            {/* Progress bar top */}
                            <div className="absolute top-0 left-0 right-0" style={{ height: '2px', background: 'var(--home-border)' }}>
                                <div style={{
                                    width: '40%',
                                    height: '2px',
                                    background: 'var(--home-accent)',
                                    animation: 'scan-line-horizontal 1.5s linear infinite',
                                }} />
                            </div>
                            <div className="w-12 h-12 border-4 rounded-full animate-spin mb-4"
                                style={{ borderColor: 'var(--home-border)', borderTopColor: 'var(--home-accent)' }} />
                            <h3 style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: 'var(--home-text-primary)',
                                marginBottom: '4px',
                            }}>
                                Analysis in Progress
                            </h3>
                            <p style={{
                                fontFamily: 'var(--font-body)',
                                color: 'var(--home-text-secondary)',
                                fontSize: '12px',
                            }}>
                                Scanning for deepfake signatures...
                            </p>
                        </div>
                    ) : (
                        // Empty State — editorial "Awaiting media upload"
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
                            style={{
                                background: 'var(--home-surface)',
                                border: '1px solid var(--home-border)',
                                borderRadius: '4px',
                            }}>
                            <h3 style={{
                                fontFamily: 'var(--font-display)',
                                fontStyle: 'italic',
                                fontSize: '40px',
                                fontWeight: 400,
                                color: 'var(--home-text-secondary)',
                                marginBottom: '12px',
                                lineHeight: 1.1,
                            }}>
                                Awaiting media upload.
                            </h3>
                            <p style={{
                                fontFamily: 'var(--font-body)',
                                color: 'var(--home-text-tertiary)',
                                fontSize: '14px',
                                maxWidth: '260px',
                            }}>
                                Results will appear here once analysis begins.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Detector;
