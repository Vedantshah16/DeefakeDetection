import React from 'react';
import { FileImage, FileVideo, FileAudio, Radio, AlertCircle, CheckCircle, HelpCircle, HardDrive, Calendar } from 'lucide-react';

const HistoryTable = ({ history, loading }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'video': return <FileVideo size={16} className="text-violet-400" />;
            case 'audio': return <FileAudio size={16} className="text-amber-400" />;
            case 'image': return <FileImage size={16} className="text-emerald-400" />;
            default: return <Radio size={16} className="text-slate-500" />;
        }
    };

    const getTypeBadge = (type) => {
        const styles = {
            image: { bg: 'rgba(16,185,129,0.08)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' },
            audio: { bg: 'rgba(245,158,11,0.08)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.2)' },
            video: { bg: 'rgba(139,92,246,0.08)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' },
        };
        const s = styles[type] || styles.image;
        return (
            <span className="inline-flex items-center gap-1.5"
                style={{
                    background: s.bg,
                    color: s.color,
                    border: s.border,
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                {getIcon(type)}
                {type}
            </span>
        );
    };

    const getResultBadge = (label) => {
        if (label === 'FAKE') return (
            <span className="inline-flex items-center gap-1.5"
                style={{
                    background: 'rgba(239,68,68,0.1)',
                    color: '#F87171',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '3px 8px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                }}>
                <AlertCircle size={12} /> FAKE
            </span>
        );
        if (label === 'REAL') return (
            <span className="inline-flex items-center gap-1.5"
                style={{
                    background: 'rgba(16,185,129,0.1)',
                    color: '#34D399',
                    border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '3px 8px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                }}>
                <CheckCircle size={12} /> REAL
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1.5"
                style={{
                    background: 'rgba(245,158,11,0.1)',
                    color: '#FBBF24',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '3px 8px',
                    fontWeight: 600,
                }}>
                <HelpCircle size={12} /> UNCERTAIN
            </span>
        );
    };

    return (
        <div style={{
            background: 'rgba(20, 20, 28, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
            overflow: 'hidden',
        }}>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            {['Timestamp', 'File Name', 'Type', 'Verdict', 'Confidence', 'Metadata', ''].map((h, i) => (
                                <th key={i} className="px-5 py-4" style={{
                                    fontSize: '10px',
                                    letterSpacing: '0.08em',
                                    color: '#475569',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    textAlign: h === 'Metadata' ? 'right' : 'left',
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="px-5 py-12 text-center font-mono" style={{ color: '#475569', fontSize: '12px' }}>Loading records...</td></tr>
                        ) : history.length === 0 ? (
                            <tr><td colSpan="7" className="px-5 py-12 text-center" style={{ color: '#475569', fontSize: '13px' }}>No analysis history found.</td></tr>
                        ) : (
                            history.map((item) => (
                                <tr key={item.id}
                                    className="group cursor-pointer transition-colors"
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td className="px-5 py-4 whitespace-nowrap" style={{ color: '#475569', fontSize: '12px' }}>
                                        <div className="flex items-center gap-2 font-mono">
                                            <Calendar size={12} style={{ color: '#475569' }} />
                                            {new Date(item.created_at).toLocaleDateString()}
                                            <span style={{ color: '#334155' }}>|</span>
                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 max-w-[200px]" title={item.file_name}
                                            style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
                                            <HardDrive size={14} style={{ color: '#475569', flexShrink: 0 }} />
                                            <span className="truncate">{item.file_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {getTypeBadge(item.media_type)}
                                    </td>
                                    <td className="px-5 py-4">
                                        {getResultBadge(item.result_label)}
                                    </td>
                                    <td className="px-5 py-4 w-[180px]">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-end">
                                                <span style={{ fontSize: '11px', color: '#64748b' }}>Score</span>
                                                <span className="font-mono" style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>
                                                    {item.confidence.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div style={{
                                                height: '3px',
                                                width: '100%',
                                                background: 'rgba(255,255,255,0.06)',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                            }}>
                                                <div
                                                    className="transition-all duration-500"
                                                    style={{
                                                        height: '100%',
                                                        borderRadius: '4px',
                                                        width: `${item.confidence}%`,
                                                        background: item.result_label === 'FAKE' ? '#EF4444' : item.result_label === 'REAL' ? '#10B981' : '#F59E0B',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            {item.media_type === 'video' && item.frames_analyzed > 1 && (
                                                <span className="inline-flex items-center gap-1"
                                                    style={{
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontSize: '9px',
                                                        fontWeight: 600,
                                                        background: 'rgba(139,92,246,0.1)',
                                                        color: '#A78BFA',
                                                        border: '1px solid rgba(139,92,246,0.2)',
                                                        letterSpacing: '0.05em',
                                                    }}>
                                                    {item.frames_analyzed} FRAMES
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button className="text-slate-600 hover:text-violet-400 transition-colors">
                                            ...
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryTable;
