import React from 'react';
import { FileImage, FileVideo, FileAudio, Radio, Calendar, HardDrive, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

const HistoryGrid = ({ history, loading }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'video': return <FileVideo size={24} className="text-indigo-400" />;
            case 'audio': return <FileAudio size={24} className="text-violet-400" />;
            case 'image': return <FileImage size={24} className="text-emerald-400" />;
            default: return <Radio size={24} className="text-slate-500" />;
        }
    };

    const getResultBadge = (label) => {
        if (label === 'FAKE') return <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-black/40 backdrop-blur-sm text-rose-400 border border-rose-500/20"><AlertCircle size={12} /> SYNTHETIC</span>;
        if (label === 'REAL') return <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-black/40 backdrop-blur-sm text-emerald-400 border border-emerald-500/20"><CheckCircle size={12} /> AUTHENTIC</span>;
        return <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-black/40 backdrop-blur-sm text-amber-400 border border-amber-500/20"><HelpCircle size={12} /> UNCERTAIN</span>;
    };

    if (loading) {
        return <div className="p-12 text-center text-slate-500 font-mono text-sm">Loading grid view...</div>;
    }

    if (history.length === 0) {
        return <div className="p-12 text-center text-slate-500 text-sm">No analysis history found.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {history.map((item) => (
                <div key={item.id} className="group bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all overflow-hidden relative">

                    {/* Card Header / Visual Area */}
                    <div className="h-32 bg-white/[0.02] border-b border-white/[0.04] relative flex items-center justify-center">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]"></div>

                        {/* Icon */}
                        <div className="bg-white/[0.06] p-3 rounded-2xl border border-white/[0.1] z-10 group-hover:scale-110 transition-transform duration-300">
                            {getIcon(item.media_type)}
                        </div>

                        {/* Verdict Badge */}
                        {getResultBadge(item.result_label)}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-white text-sm truncate" title={item.file_name}>{item.file_name}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                                    <Calendar size={10} />
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Analysis Score */}
                        <div className="mt-4">
                            <div className="flex justify-between items-end text-[10px] mb-1.5">
                                <span className="text-slate-500 font-medium uppercase tracking-wider">Confidence</span>
                                <span className="font-mono font-bold text-white">{item.confidence.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${item.result_label === 'FAKE' ? 'bg-rose-500' : item.result_label === 'REAL' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${item.confidence}%` }}
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
