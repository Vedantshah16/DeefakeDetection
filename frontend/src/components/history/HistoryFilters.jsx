import React from 'react';
import { Search, Calendar, Grid, List, BarChart2 } from 'lucide-react';

const HistoryFilters = ({ filters, setFilters, viewMode, setViewMode }) => {
    const inputStyle = {
        background: 'rgba(20, 20, 28, 0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        color: '#e2e8f0',
        fontSize: '13px',
        backdropFilter: 'blur(12px)',
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6"
            style={{
                background: 'rgba(20, 20, 28, 0.6)',
                backdropFilter: 'blur(12px)',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.06)',
            }}>

            {/* Search and Filters */}
            <div className="flex flex-1 gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: '#475569' }} />
                    <input
                        type="text"
                        placeholder="Search by filename..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full outline-none transition-all"
                        style={{
                            ...inputStyle,
                            paddingLeft: '36px',
                            paddingRight: '14px',
                            paddingTop: '9px',
                            paddingBottom: '9px',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(139,92,246,0.4)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.06)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={filters.verdict}
                        onChange={(e) => setFilters({ ...filters, verdict: e.target.value })}
                        className="cursor-pointer outline-none"
                        style={{
                            ...inputStyle,
                            padding: '9px 12px',
                            color: '#94a3b8',
                        }}
                    >
                        <option value="all">All Verdicts</option>
                        <option value="REAL">Authentic</option>
                        <option value="FAKE">Deepfake</option>
                    </select>

                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="cursor-pointer outline-none"
                        style={{
                            ...inputStyle,
                            padding: '9px 12px',
                            color: '#94a3b8',
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="audio">Audio</option>
                    </select>

                    <button className="p-2 text-slate-500 hover:text-violet-400 hover:bg-white/[0.04] rounded-lg transition-colors border border-transparent hover:border-white/[0.08]">
                        <Calendar size={18} />
                    </button>
                </div>
            </div>

            {/* View Toggles */}
            <div className="flex items-center gap-1 p-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    style={viewMode === 'table' ? { background: 'rgba(139,92,246,0.2)', color: '#A78BFA' } : {}}
                    title="Table View"
                >
                    <List size={18} />
                </button>
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    style={viewMode === 'grid' ? { background: 'rgba(139,92,246,0.2)', color: '#A78BFA' } : {}}
                    title="Grid View"
                >
                    <Grid size={18} />
                </button>
                <button
                    onClick={() => setViewMode('analytics')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'analytics' ? 'shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    style={viewMode === 'analytics' ? { background: 'rgba(139,92,246,0.2)', color: '#A78BFA' } : {}}
                    title="Analytics View"
                >
                    <BarChart2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default HistoryFilters;
