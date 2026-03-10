import React from 'react';
import { Terminal, Code, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApiDocs = () => {
    const navigate = useNavigate();
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText('curl -X POST https://api.truesight.ai/v1/detect -F "file=@video.mp4"');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-full h-[500px] bg-violet-600/8 blur-[150px] rounded-full"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
                >
                    ← Back to Home
                </button>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Column: Content */}
                    <div className="flex-1 space-y-12">
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20">
                                <Terminal size={32} />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">API Reference</h1>
                            <p className="text-xl text-slate-400 leading-relaxed">
                                Integrate TrueSight AI's powerful deepfake detection capabilities directly into your applications.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">Authentication</h2>
                                <p className="text-slate-400 mb-4">
                                    All API requests require an API key to be included in the header.
                                </p>
                                <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.08] font-mono text-sm text-indigo-300">
                                    Authorization: Bearer YOUR_API_KEY
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">Endpoints</h2>
                                <div className="space-y-4">
                                    <EndpointCard
                                        method="POST"
                                        path="/v1/detect/image"
                                        desc="Analyze an image file for manipulation artifacts."
                                    />
                                    <EndpointCard
                                        method="POST"
                                        path="/v1/detect/video"
                                        desc="Analyze a video file. Returns frame-by-frame analysis."
                                    />
                                    <EndpointCard
                                        method="POST"
                                        path="/v1/detect/audio"
                                        desc="Analyze an audio file for synthetic voice patterns."
                                    />
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">Rate Limits</h2>
                                <ul className="list-disc list-inside space-y-2 text-slate-400">
                                    <li>Free Tier: 100 requests / day</li>
                                    <li>Pro Tier: 10,000 requests / day</li>
                                    <li>Enterprise: Custom limits</li>
                                </ul>
                            </section>
                        </div>
                    </div>

                    {/* Right Column: Code Example */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24">
                            <div className="bg-[#0c0c14] rounded-3xl border border-white/[0.08] overflow-hidden"
                                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
                                <div className="bg-white/[0.03] px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                    </div>
                                    <span className="text-xs font-mono text-slate-600">cURL Example</span>
                                </div>
                                <div className="p-6 relative group">
                                    <button
                                        onClick={handleCopy}
                                        className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    </button>
                                    <pre className="font-mono text-sm text-indigo-300 overflow-x-auto">
                                        {`curl -X POST \\
  https://api.truesight.ai/v1/detect \\
  -H "Authorization: Bearer KEY" \\
  -F "file=@video.mp4"`}
                                    </pre>
                                </div>
                            </div>

                            <div className="mt-8 p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                                <h3 className="font-bold text-white mb-2">Need an API Key?</h3>
                                <p className="text-sm text-indigo-300 mb-4">Get started with our free tier today.</p>
                                <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg font-bold text-sm transition-all w-full shadow-lg shadow-indigo-500/20">
                                    Get API Key
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EndpointCard = ({ method, path, desc }) => (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/20 hover:bg-white/[0.05] transition-all">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 rounded-md bg-indigo-500/15 text-indigo-400 text-xs font-bold font-mono">{method}</span>
            <span className="font-mono text-slate-300 font-medium">{path}</span>
        </div>
        <p className="text-sm text-slate-500">{desc}</p>
    </div>
);

export default ApiDocs;
