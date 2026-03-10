import React from 'react';
import { FileText, AlignLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
                        <FileText size={32} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">Terms of Service</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Please read these terms carefully before using our services.
                    </p>
                    <div className="flex justify-center gap-4 text-sm font-mono text-slate-600 mt-4">
                        <span>Effective Date: January 14, 2026</span>
                    </div>
                </div>

                <div className="space-y-8 text-slate-400 leading-relaxed">
                    <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/[0.06] hover:border-white/[0.1] transition-all">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the TrueSight AI Deepfake Detection platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </div>

                    <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/[0.06] hover:border-white/[0.1] transition-all">
                        <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                        <p className="mb-4">Permission is granted to temporarily use TrueSight AI's services for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-slate-500">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose, or for any public display;</li>
                            <li>Attempt to decompile or reverse engineer any software contained on TrueSight AI's website;</li>
                            <li>Remove any copyright or other proprietary notations from the materials;</li>
                        </ul>
                    </div>

                    <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/[0.06] hover:border-white/[0.1] transition-all">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <AlertCircle className="text-indigo-400" />
                            3. Disclaimer
                        </h2>
                        <p>
                            The materials on TrueSight AI's website are provided on an 'as is' basis. TrueSight AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                        <p className="mt-4 text-sm text-slate-600 italic">
                            While our AI models achieve high accuracy, no detection system is 100% perfect. Results should be used as an indicator, not absolute proof.
                        </p>
                    </div>

                    <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/[0.06] hover:border-white/[0.1] transition-all">
                        <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
                        <p>
                            In no event shall TrueSight AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TrueSight AI's website.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
