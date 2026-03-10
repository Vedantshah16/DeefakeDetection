import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Video, Mic, ArrowRight, ScanLine, Cloud, Cpu, Activity, CheckCircle, Zap, Globe, Lock } from 'lucide-react';
import { SparklesCore } from './ui/sparkles';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeCase, setActiveCase] = useState(0);
    const [audienceTab, setAudienceTab] = useState('individuals');

    const activeCaseData = REAL_CASES[activeCase];

    const handleStartScanning = () => {
        if (user) navigate('/detect');
        else navigate('/login');
    };

    return (
        <div className="flex flex-col min-h-screen text-white overflow-hidden relative selection:bg-indigo-500/30">

            {/* ─── Background ─── */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0a0a0f]">
                <div className="absolute inset-0 w-full h-full">
                    <SparklesCore
                        id="tsparticlesfullpage"
                        background="transparent"
                        minSize={0.4}
                        maxSize={1.4}
                        particleDensity={40}
                        className="w-full h-full"
                        particleColor="#818cf8"
                    />
                </div>
                {/* Radial gradients for depth */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/15 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-violet-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* ─── HERO ─── */}
            <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] text-center px-4 space-y-8 animate-slide-up pt-20">
                <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono tracking-widest uppercase text-indigo-300 mb-2 animate-fadeIn">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        System Online V2.0
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-sm leading-[1.1]">
                        TrueSight <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">AI</span>
                    </h1>

                    <p className="text-xl md:text-2xl font-light text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Enterprise-grade deepfake detection for images, video, and audio.
                        <span className="block mt-2 text-base text-slate-500">Powered by advanced forensic neural networks.</span>
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                        <button
                            onClick={handleStartScanning}
                            className="group relative inline-flex items-center justify-center h-12 px-8 font-medium text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-500 hover:to-violet-500 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                        >
                            <span className="mr-2">Start Analysis</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => navigate('/api-docs')}
                            className="h-12 px-8 font-medium text-slate-300 bg-white/[0.04] border border-white/[0.1] rounded-lg hover:bg-white/[0.08] hover:text-white transition-all"
                        >
                            Documentation
                        </button>
                    </div>
                </div>

                {/* Hero Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8 mt-20 border-t border-white/[0.06] pt-10 w-full max-w-5xl mx-auto">
                    <StatItem value="99.2%" label="Accuracy" />
                    <StatItem value="<50ms" label="Latency" />
                    <StatItem value="30+" label="Models" />
                    <StatItem value="24/7" label="Uptime" />
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="py-24 px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader title="Forensic Workflow" subtitle="How it works" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
                        {/* Line */}
                        <div className="hidden md:block absolute top-[2.5rem] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent z-0"></div>

                        <StepCard
                            number="01"
                            title="Upload"
                            desc="Securely upload media. Files are processed in-memory and never stored permanently without consent."
                        />
                        <StepCard
                            number="02"
                            title="Analyze"
                            desc="Multi-modal inspection scans for artifacts, inconsistent lighting, and spectral anomalies."
                        />
                        <StepCard
                            number="03"
                            title="Verify"
                            desc="Receive a detailed authenticity report with confidence scores and explainable metrics."
                        />
                    </div>
                </div>
            </section>

            {/* ─── METRICS GRID ─── */}
            <section className="py-24 px-4 relative z-10 bg-white/[0.02] border-y border-white/[0.06]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-10 flex flex-col items-center text-center space-y-6 hover:border-indigo-500/30 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2 border border-indigo-500/20 group-hover:animate-glow-pulse">
                                <ScanLine size={32} />
                            </div>
                            <h3 className="text-5xl font-bold tracking-tight text-white">95%</h3>
                            <div className="space-y-2 max-w-sm">
                                <h4 className="text-lg font-medium text-slate-200">Detection Rate</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Achieved on FaceForensics++ and DFDC benchmarks using our ensemble transformer capability.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-10 flex flex-col items-center text-center space-y-6 hover:border-violet-500/30 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-2 border border-violet-500/20 group-hover:animate-glow-pulse">
                                <Cpu size={32} />
                            </div>
                            <h3 className="text-5xl font-bold tracking-tight text-white">Neural</h3>
                            <div className="space-y-2 max-w-sm">
                                <h4 className="text-lg font-medium text-slate-200">Processing Core</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Real-time analysis of spatial artifacts, temporal inconsistencies, and audio spectral patterns.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader title="Detection Capabilities" subtitle="Features" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                        <FeatureCard
                            icon={Mic}
                            title="Audio Analysis"
                            desc="Detects voice cloning, robotic artifacts, and background noise inconsistencies."
                        />
                        <FeatureCard
                            icon={Video}
                            title="Visual Forensics"
                            desc="Analyzes frame-by-frame anomalies, unnatural blinking, and face warping."
                        />
                        <FeatureCard
                            icon={Activity}
                            title="Live Monitoring"
                            desc="Real-time stream analysis API for enterprise security applications."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="API Integration"
                            desc="Restful API access for seamless integration into your existing platforms."
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Global Threat Intel"
                            desc="Continuously updated models based on the latest deepfake generation techniques."
                        />
                        <FeatureCard
                            icon={Lock}
                            title="Privacy First"
                            desc="Zero-retention policy options. Your data remains yours, always."
                        />
                    </div>
                </div>
            </section>

            {/* ─── REAL CASES ─── */}
            <section className="py-24 px-4 relative bg-white/[0.02] border-y border-white/[0.06]">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader title="Threat Landscape" subtitle="Real World Cases" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
                        {/* List */}
                        <div className="lg:col-span-4 space-y-2">
                            {REAL_CASES.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveCase(idx)}
                                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 border flex items-center gap-3 ${activeCase === idx
                                        ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-sm shadow-indigo-500/10'
                                        : 'bg-transparent border-transparent hover:bg-white/[0.03] text-slate-500 hover:text-white'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeCase === idx ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.05] text-slate-500'}`}>
                                        <item.icon size={14} />
                                    </div>
                                    <span className="font-medium text-sm line-clamp-1">{item.title}</span>
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-8">
                            <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl h-full min-h-[300px] overflow-hidden group transition-all hover:border-indigo-500/20"
                                style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
                                <div className="relative h-full p-8 flex flex-col justify-end z-10">
                                    <div className="mb-auto p-3 bg-white/[0.06] w-fit rounded-xl border border-white/[0.1]">
                                        <activeCaseData.icon size={24} className="text-indigo-400" />
                                    </div>

                                    <h3 className="text-2xl font-bold mb-3 mt-8 text-white">{activeCaseData.fullTitle}</h3>
                                    <p className="text-slate-400 leading-relaxed mb-6 border-l-2 border-indigo-500/40 pl-4">
                                        {activeCaseData.desc}
                                    </p>
                                    <a
                                        href={activeCaseData.link || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                                    >
                                        Read Analysis <ArrowRight size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FOOTER CTA ─── */}
            <section className="py-24 px-4 text-center relative overflow-hidden">
                <div className="max-w-2xl mx-auto relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-white">Ready to secure your media?</h2>
                    <p className="text-lg text-slate-400 mb-10">
                        Join thousands of organizations using TrueSight AI to detect synthetic manipulation.
                    </p>
                    <button
                        onClick={handleStartScanning}
                        className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                    >
                        Launch Detector
                    </button>
                </div>

                {/* Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="border-t border-white/[0.06] py-12 text-slate-500 text-sm">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                            <Shield size={12} className="text-white" />
                        </div>
                        <span className="font-semibold text-white tracking-wide">TrueSight AI</span>
                    </div>
                    <div className="flex gap-8">
                        {[
                            { label: 'Privacy', path: '/privacy' },
                            { label: 'Terms', path: '/terms' },
                            { label: 'API', path: '/api-docs' },
                            { label: 'Status', path: '/status' }
                        ].map(link => (
                            <Link key={link.label} to={link.path} className="hover:text-indigo-400 transition-colors">{link.label}</Link>
                        ))}
                    </div>
                    <div className="text-slate-600">© 2024 TrueSight AI</div>
                </div>
            </footer>
        </div>
    );
};

// --- Subcomponents ---

const StatItem = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-bold">{label}</span>
    </div>
);

const SectionHeader = ({ title, subtitle }) => (
    <div className="text-center space-y-3 mb-12">
        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-mono font-bold tracking-widest uppercase text-xs">{subtitle}</h3>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h2>
    </div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all duration-300 group">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/10 transition-all">
            <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">
            {desc}
        </p>
    </div>
);

const StepCard = ({ number, title, desc }) => (
    <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 flex flex-col items-center text-center space-y-4 z-10 hover:-translate-y-1 transition-all duration-300 hover:border-indigo-500/20"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-lg font-bold text-indigo-400 mb-2">
            {number}
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

// --- Data ---
const REAL_CASES = [
    {
        title: "Voice Cloning Scam",
        fullTitle: "Hydrabad Voice Clone Scam",
        desc: "A woman lost ~$1,688 USD to a scammer using AI to mimic her nephew's voice, claiming an emergency.",
        link: "https://www.indiatoday.in/technology/news/story/he-sounded-exactly-like-my-nephew-woman-loses-rs-14-lakh-in-ai-voice-scam-2463939-2023-11-17",
        icon: Mic
    },
    {
        title: "Deepfake CFO Fraud",
        fullTitle: "$25M Deepfake Conference Call",
        desc: "A multinational firm lost $25M after an employee was tricked by a deepfake video call of their CFO.",
        link: "https://www.cnn.com/2024/02/04/asia/deepfake-cfo-scam-hong-kong-intl-hnk/index.html",
        icon: Video
    },
    {
        title: "Virtual Kidnapping",
        fullTitle: "AI Virtual Kidnapping",
        desc: "Parents hearing their children's cloned voices pleading for help in terrifying extortion schemes.",
        link: "https://www.cnn.com/2023/04/29/us/ai-scam-calls-kidnapping-cec/index.html",
        icon: ScanLine
    }
];

export default Home;
