import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const TIME_RANGES = [
    { key: '7D', days: 7 },
    { key: '30D', days: 30 },
    { key: '90D', days: 90 },
];

const darkTooltipStyle = {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    padding: '8px 12px',
};

const chartCardStyle = {
    background: 'rgba(20, 20, 28, 0.6)',
    backdropFilter: 'blur(12px)',
    padding: '24px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.06)',
};

const HistoryCharts = ({ history }) => {
    const [timeRange, setTimeRange] = useState('30D');

    const { trendData, pieData, avgConfidence, realPct, fakePct } = useMemo(() => {
        const range = TIME_RANGES.find(r => r.key === timeRange);
        const now = new Date();
        const cutoff = new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000);

        const filtered = history.filter(h => new Date(h.created_at) >= cutoff);

        // Build daily buckets
        const dateMap = {};
        for (let i = 0; i < range.days; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - (range.days - 1 - i));
            const key = d.toISOString().split('T')[0];
            dateMap[key] = { date: key, total: 0, fake: 0 };
        }

        filtered.forEach(h => {
            const key = new Date(h.created_at).toISOString().split('T')[0];
            if (dateMap[key]) {
                dateMap[key].total++;
                if (h.result_label === 'FAKE') dateMap[key].fake++;
            }
        });

        const trendData = Object.values(dateMap).map(d => ({
            ...d,
            dateLabel: new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        }));

        const totalScans = filtered.length;
        const fakeScans = filtered.filter(h => h.result_label === 'FAKE').length;
        const realScans = filtered.filter(h => h.result_label === 'REAL').length;

        const pieData = [
            { name: 'Real Samples', value: realScans, color: '#34D399' },
            { name: 'Fake Samples', value: fakeScans, color: '#F87171' },
        ];

        const avgConfidence = totalScans > 0
            ? (filtered.reduce((acc, h) => acc + h.confidence, 0) / totalScans).toFixed(1)
            : '0.0';

        const realPct = totalScans > 0 ? ((realScans / totalScans) * 100).toFixed(1) : '0.0';
        const fakePct = totalScans > 0 ? ((fakeScans / totalScans) * 100).toFixed(1) : '0.0';

        return { trendData, pieData, avgConfidence, realPct, fakePct };
    }, [history, timeRange]);

    // Thin out X-axis labels for longer ranges
    const tickInterval = timeRange === '7D' ? 0 : timeRange === '30D' ? 4 : 13;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* ── Threat Trends Over Time (2/3 width) ── */}
            <div style={chartCardStyle} className="lg:col-span-2 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase mb-2" style={{ color: '#64748b', letterSpacing: '0.08em' }}>
                            Threat Trends Over Time
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} />
                                <span className="text-[10px] text-slate-500 uppercase font-semibold" style={{ letterSpacing: '0.05em' }}>Critical Threats</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: '#34D399' }} />
                                <span className="text-[10px] text-slate-500 uppercase font-semibold" style={{ letterSpacing: '0.05em' }}>System Loads</span>
                            </div>
                        </div>
                    </div>

                    {/* Time range pills */}
                    <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {TIME_RANGES.map(r => (
                            <button
                                key={r.key}
                                onClick={() => setTimeRange(r.key)}
                                className="px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all"
                                style={{
                                    background: timeRange === r.key ? '#8B5CF6' : 'transparent',
                                    color: timeRange === r.key ? '#fff' : '#64748b',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    border: 'none',
                                }}
                            >
                                {r.key}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Line Chart */}
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <defs>
                                <linearGradient id="gradFake" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="dateLabel"
                                tick={{ fill: '#475569', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                interval={tickInterval}
                            />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={darkTooltipStyle}
                                itemStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="fake"
                                name="Fake Detections"
                                stroke="#8B5CF6"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 4, fill: '#8B5CF6', stroke: '#1a1a2e', strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                name="Total Scans"
                                stroke="#34D399"
                                strokeWidth={1.5}
                                strokeDasharray="6 3"
                                dot={false}
                                activeDot={{ r: 4, fill: '#34D399', stroke: '#1a1a2e', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Detection Distribution (1/3 width) ── */}
            <div style={chartCardStyle} className="relative overflow-hidden">
                <h3 className="text-[10px] font-bold uppercase mb-6" style={{ color: '#64748b', letterSpacing: '0.08em' }}>
                    Detection Distribution
                </h3>

                {/* Donut Chart */}
                <div className="h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={4}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={darkTooltipStyle}
                                itemStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block" style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
                                {avgConfidence}
                            </span>
                            <span style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                                Avg Conf.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Legend rows */}
                <div className="space-y-3 mt-4 pt-4 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#34D399' }} />
                            <span className="text-[11px] text-slate-400">Real Samples</span>
                        </div>
                        <span className="text-[11px] text-slate-300 font-bold">{realPct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F87171' }} />
                            <span className="text-[11px] text-slate-400">Fake Samples</span>
                        </div>
                        <span className="text-[11px] text-slate-300 font-bold">{fakePct}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryCharts;
