import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, Camera, AlertTriangle, CheckCircle, Activity, Zap, Scan, Image, Film, Mic, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardStats from './DashboardStats';

const API_URL = "http://127.0.0.1:8000";

/* ─── SVG Confidence Ring (Dark Theme) ─── */
function ConfidenceRing({ percent, isReal, size = 140 }) {
    const r = (size - 10) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (c * Math.min(percent, 100)) / 100;
    const color = isReal ? '#34d399' : '#fb7185'; // Emerald-400 : Rose-400
    const glow = isReal ? 'rgba(52, 211, 153, 0.3)' : 'rgba(251, 113, 133, 0.3)';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
                {/* Background Track */}
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                {/* Progress Arc */}
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={8} strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={offset}
                    className="confidence-ring transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 8px ${glow})` }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tracking-tighter" style={{ color, textShadow: `0 0 20px ${glow}` }}>
                    {Math.round(percent)}<span className="text-lg align-top">%</span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">confidence</span>
            </div>
        </div>
    );
}

/* ─── Mode tab config ─── */
const MODES = [
    { key: 'image', label: 'Image', icon: Image, accept: 'image/*' },
    { key: 'video', label: 'Video', icon: Film, accept: 'video/*' },
    { key: 'audio', label: 'Audio', icon: Mic, accept: 'audio/*' },
    { key: 'live', label: 'Live', icon: Zap, accept: '*/*' },
];

const Detector = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);
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

    return (
        <div className="max-w-6xl mx-auto px-6 py-6 animate-slide-up">

            {/* Stats Dashboard */}
            <div className="mb-8">
                <DashboardStats stats={stats} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Panel: Upload & Controls */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Mode Selection Tabs */}
                    <div className="surface p-1.5 flex gap-1 items-center justify-between">
                        {MODES.map((m) => {
                            const Icon = m.icon;
                            const isActive = mode === m.key;
                            return (
                                <button
                                    key={m.key}
                                    onClick={() => setMode(m.key)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-500 hover:bg-white/[0.04] hover:text-white'
                                        }`}
                                >
                                    <Icon size={16} />
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
                        className={`group relative surface-elevated aspect-[4/3] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 ${isDragging
                            ? 'border-indigo-500/50 bg-indigo-500/5 scale-[1.01]'
                            : 'hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/5'
                            }`}
                        style={{ borderStyle: isDragging ? 'dashed' : 'solid', borderWidth: isDragging ? 2 : 1 }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept={MODES.find(m => m.key === mode)?.accept}
                            onChange={handleFileChange}
                        />

                        {preview ? (
                            <>
                                <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                <button
                                    onClick={resetAnalysis}
                                    className="absolute top-4 right-4 p-2 bg-white/[0.08] backdrop-blur rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.1] transition-all z-10"
                                >
                                    <X size={20} />
                                </button>

                                {!result && !loading && (
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                                        <button
                                            onClick={analyzeMedia}
                                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transform hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <Scan size={20} />
                                            Analyze Media
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center space-y-4 p-8">
                                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging ? 'bg-indigo-500/15 text-indigo-400' : 'bg-white/[0.04] text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400'
                                    }`}>
                                    <Upload size={32} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {isDragging ? "Drop to upload" : "Upload Image"}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 max-w-[200px] mx-auto">
                                        Drag & drop or click to browse files
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Scanner Animation Overlay */}
                        {loading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                                <div className="w-64 h-64 relative">
                                    <div className="absolute inset-0 border-4 border-white/[0.06] rounded-full"></div>
                                    <div className="absolute inset-0 border-t-4 border-indigo-400 rounded-full animate-spin" style={{ filter: 'drop-shadow(0 0 8px rgba(129,140,248,0.5))' }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-4xl font-bold text-indigo-400 text-glow">{uploadProgress}%</span>
                                        <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mt-1">Analyzing</span>
                                    </div>
                                </div>
                                <div className="mt-8 text-slate-400 font-medium animate-pulse">
                                    Detecting anomalies...
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Results */}
                <div className="lg:col-span-5 relative">
                    {result ? (
                        <div className="surface-elevated p-8 h-full min-h-[500px] flex flex-col animate-slide-up relative overflow-hidden">
                            {/* Decorative background bloom */}
                            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br rounded-full blur-[80px] opacity-20 -z-10 ${result.label === 'REAL' ? 'from-emerald-500 to-teal-400' : 'from-rose-500 to-orange-400'
                                }`} />

                            <div className="flex items-center gap-3 mb-8">
                                <div className={`p-2.5 rounded-lg ${result.label === 'REAL' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                                    }`}>
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Analysis Report</h3>
                                    <p className="text-xs text-slate-600">{new Date().toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                <ConfidenceRing percent={result.confidence} isReal={result.label === 'REAL'} size={180} />

                                <div>
                                    <h2 className="text-4xl font-bold tracking-tight mb-2 text-white">
                                        {result.label === 'REAL' ? 'Authentic' : 'Deepfake'}
                                    </h2>
                                    <p className="text-slate-400 font-medium">
                                        {result.message}
                                    </p>
                                </div>

                                {/* Risk Gauge UI */}
                                {(result.probability !== undefined || result.synthetic_likelihood !== undefined) && (
                                    <div className="w-full pt-6 border-t border-white/[0.06] mt-6">
                                        {(() => {
                                            const riskScore = result.probability !== undefined
                                                ? (1 - result.probability) * 100
                                                : (result.synthetic_likelihood || 0);

                                            const isDeepfake = result.label === 'FAKE';
                                            const bannerColor = isDeepfake ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                                            const bannerIcon = isDeepfake ? <AlertTriangle size={18} /> : <CheckCircle size={18} />;
                                            const bannerText = isDeepfake ? "HIGH RISK DETECTED" : "NO ANOMALIES FOUND";
                                            const rotation = (riskScore / 100) * 180 - 90;

                                            return (
                                                <div className="flex flex-col items-center w-full">
                                                    {/* Status Banner */}
                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold mb-6 ${bannerColor}`}>
                                                        {bannerIcon}
                                                        {bannerText}
                                                    </div>

                                                    {/* Gauge */}
                                                    <div className="relative w-48 h-24 mb-2">
                                                        <svg viewBox="0 0 200 110" className="w-full h-full">
                                                            <defs>
                                                                <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                    <stop offset="0%" stopColor="#94a3b8" />
                                                                    <stop offset="100%" stopColor="#e2e8f0" />
                                                                </linearGradient>
                                                            </defs>
                                                            <g fill="none" strokeWidth="16" transform="translate(0,10)" strokeLinecap="round">
                                                                <path d="M 20 90 A 80 80 0 0 1 61.2 36.5" stroke="#34d399" />
                                                                <path d="M 68 30 A 80 80 0 0 1 132 30" stroke="#fbbf24" />
                                                                <path d="M 138.8 36.5 A 80 80 0 0 1 180 90" stroke="#fb7185" />
                                                            </g>
                                                            <g transform={`translate(100, 100) rotate(${rotation})`} className="transition-transform duration-1000 ease-out">
                                                                <circle cx="0" cy="0" r="6" fill="#e2e8f0" />
                                                                <path d="M -4 0 L 0 -75 L 4 0 Z" fill="#e2e8f0" />
                                                            </g>
                                                        </svg>
                                                        <div className="absolute bottom-0 w-full flex justify-between px-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                                            <span>Safe</span>
                                                            <span>Risk</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Empty State Placeholder
                        <div className="h-full min-h-[500px] surface border-dashed border-2 border-white/[0.08] flex flex-col items-center justify-center text-center p-8 opacity-60">
                            <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center text-slate-600 mb-4">
                                <Activity size={32} />
                            </div>
                            <h3 className="text-white font-semibold mb-1">Ready for Analysis</h3>
                            <p className="text-sm text-slate-500 max-w-[200px]">
                                Upload media to generate a detailed deepfake detection report.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Detector;
