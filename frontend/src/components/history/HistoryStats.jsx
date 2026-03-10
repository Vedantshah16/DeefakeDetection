import React from 'react';
import { TrendingUp, Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const HistoryStats = ({ history }) => {
    const totalScans = history.length;
    const fakeScans = history.filter(item => item.result_label === 'FAKE').length;
    const realScans = history.filter(item => item.result_label === 'REAL').length;

    const avgConfidence = totalScans > 0
        ? (history.reduce((acc, item) => acc + item.confidence, 0) / totalScans).toFixed(1)
        : 0;

    const fakePercentage = totalScans > 0
        ? ((fakeScans / totalScans) * 100).toFixed(1)
        : 0;

    const stats = [
        {
            title: "Total Analyses",
            value: totalScans,
            icon: <Activity size={20} className="text-indigo-400" />,
            trend: "+12% this week",
            trendColor: "text-emerald-400",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        },
        {
            title: "Deepfakes Detected",
            value: fakeScans,
            subtext: `${fakePercentage}% of total`,
            icon: <AlertTriangle size={20} className="text-rose-400" />,
            trend: "High Risk",
            trendColor: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
        },
        {
            title: "Authentic Media",
            value: realScans,
            icon: <CheckCircle size={20} className="text-emerald-400" />,
            trend: "Safe",
            trendColor: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            title: "Avg. Confidence",
            value: `${avgConfidence}%`,
            icon: <TrendingUp size={20} className="text-amber-400" />,
            trend: "Model Accuracy",
            trendColor: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white/[0.03] p-5 rounded-xl border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border`}>
                            {stat.icon}
                        </div>
                        {stat.trend && (
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] ${stat.trendColor}`}>
                                {stat.trend}
                            </span>
                        )}
                    </div>
                    <div>
                        <h4 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
                            {stat.title}
                        </h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">
                                {stat.value}
                            </span>
                            {stat.subtext && (
                                <span className="text-xs text-slate-600 font-mono">
                                    {stat.subtext}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HistoryStats;
