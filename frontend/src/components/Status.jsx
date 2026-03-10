import React from 'react';
import { Activity, CheckCircle, Server, Shield, Wifi, Cpu, Database, Clock } from 'lucide-react';

const Status = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 animate-slide-up">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        All Systems Operational
                    </div>
                    <h1 className="text-4xl font-bold text-white">System Status</h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Real-time performance metrics and operational status of the TrueSight AI platform.
                    </p>
                </div>

                {/* Overall Status Card */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8"
                    style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatusMetric
                            icon={Activity}
                            label="API Uptime"
                            value="99.99%"
                            subtext="Last 30 days"
                            color="text-emerald-400"
                            bg="bg-emerald-500/10"
                        />
                        <StatusMetric
                            icon={Clock}
                            label="Avg. Latency"
                            value="42ms"
                            subtext="Global average"
                            color="text-indigo-400"
                            bg="bg-indigo-500/10"
                        />
                        <StatusMetric
                            icon={CheckCircle}
                            label="Error Rate"
                            value="0.001%"
                            subtext="Stable"
                            color="text-blue-400"
                            bg="bg-blue-500/10"
                        />
                    </div>
                </div>

                {/* Component Status List */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
                    style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
                    <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] flex justify-between items-center">
                        <h3 className="font-semibold text-white">Component Status</h3>
                        <span className="text-xs text-slate-600">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        <StatusItem name="Authentication Service" status="Operational" icon={Shield} />
                        <StatusItem name="Deepfake Detection Engine (Image)" status="Operational" icon={Cpu} />
                        <StatusItem name="Deepfake Detection Engine (Video)" status="Operational" icon={Cpu} />
                        <StatusItem name="Deepfake Detection Engine (Audio)" status="Operational" icon={Cpu} />
                        <StatusItem name="Database Clusters" status="Operational" icon={Database} />
                        <StatusItem name="API Gateway" status="Operational" icon={Server} />
                        <StatusItem name="CDN & Asset Delivery" status="Operational" icon={Wifi} />
                    </div>
                </div>

                {/* Scheduled Maintenance */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
                    style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
                    <h3 className="font-semibold text-white mb-4">Scheduled Maintenance</h3>
                    <div className="text-slate-500 text-sm">
                        No maintenance is currently scheduled.
                    </div>
                </div>

            </div>
        </div>
    );
};

const StatusMetric = ({ icon: Icon, label, value, subtext, color, bg }) => (
    <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-4 border border-white/[0.06]`}>
            <Icon size={24} />
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm font-medium text-slate-300">{label}</div>
        <div className="text-xs text-slate-600 mt-1">{subtext}</div>
    </div>
);

const StatusItem = ({ name, status, icon: Icon }) => (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
            <div className="text-slate-500">
                <Icon size={18} />
            </div>
            <span className="font-medium text-slate-300">{name}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.5)' }}></span>
            <span className="text-sm text-emerald-400 font-medium">{status}</span>
        </div>
    </div>
);

export default Status;
