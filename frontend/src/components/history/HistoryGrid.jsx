import React from 'react';
import { FileImage, FileVideo, FileAudio, Radio, Calendar, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

const HistoryGrid = ({ history, loading }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'video': return <FileVideo size={24} className="text-violet-400" />;
            case 'audio': return <FileAudio size={24} className="text-amber-400" />;
            case 'image': return <FileImage size={24} className="text-emerald-400" />;
            default: return <Radio size={24} className="text-slate-500" />;
        }
    };

    const getResultBadge = (label) => {
        if (label === 'FAKE') return (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 backdrop-blur-sm"
                style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    background: 'rgba(239,68,68,0.15)',
                    color: '#F87171',
                    border: '1px solid rgba(239,68,68,0.25)',
                    letterSpacing: '0.05em',
                }}>
                <AlertCircle size={11} /> FAKE
            </span>
        );
        if (label === 'REAL') return (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 backdrop-blur-sm"
                style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    background: 'rgba(16,185,129,0.15)',
                    color: '#34D399',
                    border: '1px solid rgba(16,185,129,0.25)',
                    letterSpacing: '0.05em',
                }}>
                <CheckCircle size={11} /> REAL
            </span>
        );
        return (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 backdrop-blur-sm"
                style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    background: 'rgba(245,158,11,0.15)',
                    color: '#FBBF24',
                    border: '1px solid rgba(245,158,11,0.25)',
                }}>
                <HelpCircle size={11} /> UNCERTAIN
            </span>
        );
    };

    if (loading) {
        return <div className="p-12 text-center font-mono" style={{ color: '#475569', fontSize: '13px' }}>Loading grid view...</div>;
    }

    if (history.length === 0) {
        return <div className="p-12 text-center" style={{ color: '#475569', fontSize: '13px' }}>No analysis history found.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {history.map((item) => (
                <div key={item.id}
                    className="group relative overflow-hidden transition-all"
                    style={{
                        background: 'rgba(20, 20, 28, 0.6)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.06)',
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
                    {/* Card Header / Visual Area */}
                    <div className="h-32 relative flex items-center justify-center"
                        style={{
                            background: 'rgba(255,255,255,0.015)',
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                        }}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]"></div>

                        {/* Icon */}
                        <div className="z-10 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center"
                            style={{
                                padding: '12px',
                                borderRadius: '14px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                            {getIcon(item.media_type)}
                        </div>

                        {/* Verdict Badge */}
                        {getResultBadge(item.result_label)}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="overflow-hidden">
                                <h4 className="truncate" title={item.file_name}
                                    style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>
                                    {item.file_name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1" style={{ fontSize: '11px', color: '#475569' }}>
                                    <Calendar size={10} />
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Analysis Score */}
                        <div className="mt-4">
                            <div className="flex justify-between items-end mb-1.5">
                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Confidence
                                </span>
                                <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>
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
                                    style={{
                                        height: '100%',
                                        borderRadius: '4px',
                                        width: `${item.confidence}%`,
                                        background: item.result_label === 'FAKE' ? '#EF4444' : item.result_label === 'REAL' ? '#10B981' : '#F59E0B',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HistoryGrid;
