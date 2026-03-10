import React from 'react';
import { FileImage, FileVideo, FileAudio, Radio, AlertCircle, CheckCircle, HelpCircle, HardDrive, Calendar } from 'lucide-react';

const HistoryTable = ({ history, loading }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'video': return <FileVideo size={16} className="text-indigo-400" />;
            case 'audio': return <FileAudio size={16} className="text-violet-400" />;
            case 'image': return <FileImage size={16} className="text-emerald-400" />;
            default: return <Radio size={16} className="text-slate-500" />;
        }
    };

    const getResultBadge = (label) => {
        if (label === 'FAKE') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><AlertCircle size={12} /> SYNTHETIC</span>;
        if (label === 'REAL') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle size={12} /> AUTHENTIC</span>;
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><HelpCircle size={12} /> UNCERTAIN</span>;
    };

    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/[0.02] text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-white/[0.06]">
                            <th className="px-5 py-4">Timestamp</th>
                            <th className="px-5 py-4">File Name</th>
                            <th className="px-5 py-4">Type</th>
                            <th className="px-5 py-4">Verdict</th>
                            <th className="px-5 py-4">Confidence</th>
                            <th className="px-5 py-4 text-right">Metadata</th>
                            <th className="px-5 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {loading ? (
                            <tr><td colSpan="7" className="px-5 py-12 text-center text-slate-500 font-mono text-xs">Loading records...</td></tr>
                        ) : history.length === 0 ? (
                            <tr><td colSpan="7" className="px-5 py-12 text-center text-slate-500 text-sm">No analysis history found.</td></tr>
                        ) : (
                            history.map((item) => (
                                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                                    <td className="px-5 py-4 text-slate-500 text-xs font-mono whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-slate-600" />
                                            {new Date(item.created_at).toLocaleDateString()}
                                            <span className="text-slate-700">|</span>
                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300 max-w-[200px]" title={item.file_name}>
                                            <HardDrive size={14} className="text-slate-600 shrink-0" />
                                            <span className="truncate">{item.file_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            {getIcon(item.media_type)}
                                            {item.media_type}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {getResultBadge(item.result_label)}
                                    </td>
                                    <td className="px-5 py-4 w-[180px]">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-end text-[10px]">
                                                <span className="text-slate-600">Score</span>
                                                <span className="font-mono font-medium text-white">{item.confidence.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${item.result_label === 'FAKE' ? 'bg-rose-500' : item.result_label === 'REAL' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${item.confidence}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            {item.media_type === 'video' && item.frames_analyzed > 1 && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                    {item.frames_analyzed} FRAMES
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button className="text-slate-600 hover:text-indigo-400 transition-colors">
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
