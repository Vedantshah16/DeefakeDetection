import React from 'react';
import { Search, Filter, Calendar, Grid, List, BarChart2 } from 'lucide-react';

const HistoryFilters = ({ filters, setFilters, viewMode, setViewMode }) => {
    return (
        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">

            {/* Search and Filters */}
            <div className="flex flex-1 gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input
                        type="text"
                        placeholder="Search by filename..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 outline-none transition-all placeholder:text-slate-600"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={filters.verdict}
                        onChange={(e) => setFilters({ ...filters, verdict: e.target.value })}
                        className="px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-300 focus:border-indigo-500/40 outline-none cursor-pointer"
                    >
                        <option value="all">All Verdicts</option>
                        <option value="REAL">Authentic</option>
                        <option value="FAKE">Deepfake</option>
                    </select>

                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-slate-300 focus:border-indigo-500/40 outline-none cursor-pointer"
                    >
                        <option value="all">All Types</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="audio">Audio</option>
                    </select>

                    <button className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-white/[0.04] rounded-lg transition-colors border border-transparent hover:border-white/[0.08]">
                        <Calendar size={18} />
                    </button>
                </div>
            </div>

            {/* View Toggles */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/[0.06]">
                <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Table View"
                >
                    <List size={18} />
                </button>
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Grid View"
                >
                    <Grid size={18} />
                </button>
                <button
                    onClick={() => setViewMode('analytics')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'analytics' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Analytics View"
                >
                    <BarChart2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default HistoryFilters;
