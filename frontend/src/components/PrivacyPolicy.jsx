import React from 'react';
import { Shield, Lock, Eye, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-full h-[500px] bg-violet-600/8 blur-[150px] rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
                >
                    ← Back to Home
                </button>

                <div className="mb-12 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">Privacy Policy</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Your privacy is our priority. We are transparent about how we collect, use, and protect your data.
                    </p>
                    <div className="flex justify-center gap-4 text-sm font-mono text-slate-600 mt-4">
                        <span>Last Updated: January 14, 2026</span>
                        <span>•</span>
                        <span>Version 2.0</span>
                    </div>
                </div>

                <div className="space-y-12">
                    <section className="bg-white/[0.03] p-8 rounded-3xl border border-white/[0.06] hover:border-white/[0.1] transition-all">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">1</span>
                            Data We Collect
                        </h2>
                        <div className="space-y-4 text-slate-400 leading-relaxed">
                            <p>We collect information that you strictly provide to us for the purpose of Deepfake Detection analysis. This includes:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-500">
                                <li>Media files (Images, Videos, Audio) uploaded for analysis.</li>
                                <li>Device information and IP address for security logging.</li>
                                <li>Usage data to improve our detection algorithms.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="bg-white/[0.03] p-8 rounded-3xl border border-white/[0.06] hover:border-white/[0.1] transition-all">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400">2</span>
                            How We Use Your Data
                        </h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            The media you upload is processed strictly for forensic analysis. We use temporary storage to process files and generate reports.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <h3 className="font-bold text-white mb-2">Forensic Analysis</h3>
                                <p className="text-sm text-slate-500">Processing media through our AI models to detect manipulation.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <h3 className="font-bold text-white mb-2">Service Improvement</h3>
                                <p className="text-sm text-slate-500">Anonymized metadata is used to refine detection accuracy.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/[0.03] p-8 rounded-3xl border border-white/[0.06] hover:border-white/[0.1] transition-all">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">3</span>
                            Data Retention & Security
                        </h2>
                        <div className="space-y-6">
                            <p className="text-slate-400 leading-relaxed">
                                We employ enterprise-grade security measures. All uploaded media is automatically deleted from our servers after analysis is complete (typically within 24 hours).
                            </p>
                            <div className="flex gap-4 items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                                <Shield size={24} />
                                <span className="font-bold">Your data is encrypted at rest and in transit.</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/[0.03] p-8 rounded-3xl border border-white/[0.06] hover:border-white/[0.1] transition-all">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">4</span>
                            Contact Us
                        </h2>
                        <p className="text-slate-400 leading-relaxed">
                            For any privacy-related concerns or data deletion requests, please contact our Data Protection Officer at:
                            <br /><br />
                            <a href="mailto:privacy@truesight.ai" className="text-indigo-400 hover:text-indigo-300 font-bold underline decoration-indigo-500/30 underline-offset-4">privacy@truesight.ai</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
