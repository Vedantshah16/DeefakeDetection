import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

const HistoryCharts = ({ history }) => {
    const pieData = [
        { name: 'Authentic', value: history.filter(h => h.result_label === 'REAL').length, color: '#34d399' },
        { name: 'Deepfake', value: history.filter(h => h.result_label === 'FAKE').length, color: '#fb7185' },
    ];

    const confidenceData = [
        { name: '0-50%', count: history.filter(h => h.confidence < 50).length },
        { name: '50-80%', count: history.filter(h => h.confidence >= 50 && h.confidence < 80).length },
        { name: '80-100%', count: history.filter(h => h.confidence >= 80).length },
    ];

    const timelineData = history.slice(0, 7).map((item, index) => ({
        name: new Date(item.created_at).toLocaleDateString(undefined, { weekday: 'short' }),
        confidence: item.confidence
    })).reverse();

    const darkTooltipStyle = {
        backgroundColor: 'rgba(15,15,25,0.9)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart 1: Verdict Distribution */}
            <div className="bg-white/[0.03] p-6 rounded-xl border border-white/[0.06] relative overflow-hidden">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Verdict Distribution</h3>
                <div className="h-64 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
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
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-3xl font-black text-white">{history.length}</span>
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart 2: Confidence Spread */}
            <div className="bg-white/[0.03] p-6 rounded-xl border border-white/[0.06]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Confidence Spread</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={confidenceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                contentStyle={darkTooltipStyle}
                                itemStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {confidenceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#fb7185' : index === 1 ? '#fbbf24' : '#34d399'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 3: Detection Trend */}
            <div className="bg-white/[0.03] p-6 rounded-xl border border-white/[0.06]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Recent Trend</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                            <defs>
                                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip
                                contentStyle={darkTooltipStyle}
                                itemStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="confidence"
                                stroke="#818cf8"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorConfidence)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default HistoryCharts;
