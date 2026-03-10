import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { History, Download, RefreshCw } from 'lucide-react';
import HistoryStats from './history/HistoryStats';
import HistoryCharts from './history/HistoryCharts';
import HistoryFilters from './history/HistoryFilters';
import HistoryTable from './history/HistoryTable';
import HistoryGrid from './history/HistoryGrid';

const API_URL = "http://127.0.0.1:8000";

const DetectionHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table', 'grid', 'analytics'

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        verdict: 'all',
        type: 'all',
        dateRange: 'all'
    });

    useEffect(() => {
        fetchHistory();
    }, [user, filters]); // Reload when user or filters change

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const token = user?.token;
            // Only send auth header if token exists
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await axios.get(`${API_URL}/detections/history?limit=100`, {
                headers: headers
            });
            console.log("Fetched history:", response.data);
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredHistory = history.filter(item => {
        const matchesSearch = item.file_name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesVerdict = filters.verdict === 'all' || item.result_label === filters.verdict;
        const matchesType = filters.type === 'all' || item.media_type === filters.type;
        return matchesSearch && matchesVerdict && matchesType;
    });

    const handleExport = () => {
        if (!history || history.length === 0) {
            alert("No data to export");
            return;
        }

        // CSV Headers
        const headers = ["Timestamp,File Name,Type,Verdict,Confidence,Message\n"];

        // CSV Rows
        const rows = history.map(item => {
            const date = new Date(item.created_at).toLocaleString().replace(',', '');
            const fileName = `"${item.file_name.replace(/"/g, '""')}"`;
            const message = `"${(item.message || '').replace(/"/g, '""')}"`;

            return `${date},${fileName},${item.media_type},${item.result_label},${item.confidence},${message}`;
        });

        // Combine and Create Blob
        const csvContent = headers.concat(rows).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Trigger Download
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `true_sight_history_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="surface-elevated min-h-full p-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <History className="text-indigo-400" />
                        Analysis Analytics
                    </h1>
                    <p className="text-slate-500 mt-1">Track, analyze, and manage your deepfake detection history.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchHistory}
                        className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-white/[0.04] rounded-lg border border-transparent hover:border-white/[0.08] transition-all"
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-slate-300 text-sm font-bold rounded-lg hover:bg-white/[0.06] hover:text-indigo-400 transition-all"
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <HistoryStats history={history} />

            {/* Main Content Area */}
            <div className="space-y-6">
                {/* Visualizations */}
                {viewMode === 'analytics' && (
                    <HistoryCharts history={filteredHistory} />
                )}

                {/* Filters & Controls */}
                <HistoryFilters
                    filters={filters}
                    setFilters={setFilters}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                {/* Data Display */}
                {viewMode === 'table' && (
                    <HistoryTable history={filteredHistory} loading={loading} />
                )}

                {viewMode === 'grid' && (
                    <HistoryGrid history={filteredHistory} loading={loading} />
                )}

                {viewMode === 'analytics' && (
                    <div className="bg-white/[0.03] p-6 rounded-xl border border-white/[0.06] text-center">
                        <p className="text-slate-500 mb-4">Detailed analytics view active.</p>
                        <button onClick={() => setViewMode('table')} className="text-indigo-400 font-bold hover:underline">View All Records</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetectionHistory;
