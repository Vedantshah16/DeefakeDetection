import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Download, RefreshCw, Plus } from 'lucide-react';
import HistoryStats from './history/HistoryStats';
import HistoryCharts from './history/HistoryCharts';
import HistoryFilters from './history/HistoryFilters';
import HistoryTable from './history/HistoryTable';
import HistoryGrid from './history/HistoryGrid';
import * as XLSX from 'xlsx';

const API_URL = "http://127.0.0.1:8000";

const DetectionHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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

        // Build worksheet data
        const wsData = history.map(item => ({
            'Timestamp': new Date(item.created_at).toLocaleString(),
            'File Name': item.file_name,
            'Type': item.media_type,
            'Verdict': item.result_label,
            'Confidence (%)': item.confidence || 0,
            'Synthetic Likelihood (%)': item.synthetic_likelihood || 0,
            'Human Likelihood (%)': item.human_likelihood || 0,
            'Confidence Band': item.confidence_band || '',
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(wsData);

        // Auto-size columns
        const colWidths = Object.keys(wsData[0]).map(key => ({
            wch: Math.max(key.length, ...wsData.map(row => String(row[key]).length)) + 2
        }));
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Detection Report');

        // Generate and download .xlsx file
        XLSX.writeFile(wb, `TrueSight_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 animate-slide-up">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="flex items-center gap-2" style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#f1f5f9',
                        letterSpacing: '-0.03em',
                    }}>
                        <BarChart3 size={20} style={{ color: '#A78BFA' }} />
                        Analysis Analytics
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                        Track, analyze, and manage your deepfake detection history.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchHistory}
                        className="p-2 rounded-lg transition-all"
                        style={{ color: '#64748b', border: '1px solid transparent' }}
                        title="Refresh Data"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#A78BFA';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#64748b';
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 transition-all"
                        style={{
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.04)',
                            color: '#94a3b8',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }}
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                    <button
                        onClick={() => navigate('/scanner')}
                        className="flex items-center gap-2 transition-all"
                        style={{
                            background: '#8B5CF6',
                            color: '#fff',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 2px 12px rgba(139,92,246,0.3)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#7C3AED';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#8B5CF6';
                            e.currentTarget.style.boxShadow = '0 2px 12px rgba(139,92,246,0.3)';
                        }}
                    >
                        <Plus size={16} />
                        New Analysis
                    </button>
                </div>
            </div>

            {/* KPI Stats Cards */}
            <HistoryStats history={history} />

            {/* Analytics Charts — always visible */}
            <HistoryCharts history={history} />

            {/* Main Content Area */}
            <div className="space-y-6">
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
                    <div style={{
                        background: 'rgba(20, 20, 28, 0.6)',
                        backdropFilter: 'blur(12px)',
                        padding: '24px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        textAlign: 'center',
                    }}>
                        <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '13px' }}>Detailed analytics view active.</p>
                        <button onClick={() => setViewMode('table')} className="font-bold hover:underline" style={{ color: '#A78BFA', background: 'none', border: 'none', cursor: 'pointer' }}>
                            View All Records
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetectionHistory;
