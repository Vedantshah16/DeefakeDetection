import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ═══════════════════════════════════════════════════════════════════
   Home — Editorial Research Lab
   Warm-black, serif headlines, monospace readouts, zero SaaS clichés.
   ═══════════════════════════════════════════════════════════════════ */

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const goScan = () => {
        if (user) navigate('/detect');
        else navigate('/login');
    };

    return (
        <div
            className="home-editorial"
            style={{
                backgroundColor: 'var(--home-bg)',
                color: 'var(--home-text-primary)',
                fontFamily: 'var(--font-body)',
                minHeight: '100vh',
            }}
        >
            {/* ─── HERO ─── */}
            <section
                style={{
                    minHeight: '85vh',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '120px 32px 80px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '64px',
                    alignItems: 'center',
                }}
                className="home-hero-grid"
            >
                {/* Left — Headline + prose */}
                <div>
                    <h1
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(56px, 7vw, 108px)',
                            fontWeight: 400,
                            lineHeight: 1.0,
                            letterSpacing: '-0.02em',
                            color: 'var(--home-text-primary)',
                            margin: 0,
                        }}
                    >
                        Forensic tools for synthetic media.
                    </h1>

                    <p
                        style={{
                            marginTop: '40px',
                            fontSize: '18px',
                            lineHeight: 1.6,
                            color: 'var(--home-text-secondary)',
                            maxWidth: '520px',
                        }}
                    >
                        Advanced methodologies for the{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            detection and analysis
                        </strong>{' '}
                        of AI-generated audio and visual content in critical sectors like{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            healthcare and media
                        </strong>
                        . We build rigorously{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            validated systems for truth
                        </strong>
                        .
                    </p>

                    <div style={{ marginTop: '32px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <a
                            onClick={(e) => { e.preventDefault(); goScan(); }}
                            href="/detect"
                            style={{
                                color: 'var(--home-text-primary)',
                                fontSize: '14px',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-body)',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                            onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                        >
                            Start a scan →
                        </a>
                        <a
                            href="#methodology"
                            style={{
                                color: 'var(--home-text-primary)',
                                fontSize: '14px',
                                textDecoration: 'underline',
                                textUnderlineOffset: '4px',
                                fontFamily: 'var(--font-body)',
                            }}
                        >
                            Read the technical note
                        </a>
                    </div>
                </div>

                {/* Right — Forensic readout card */}
                <div
                    style={{
                        background: 'var(--home-surface)',
                        border: '1px solid var(--home-border)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}
                >
                    {/* Visual — headshot with heatmap overlay */}
                    <div style={{ position: 'relative', height: '280px', overflow: 'hidden', background: '#111' }}>
                        <img
                            src="/forensic-headshot.png"
                            alt="Subject under analysis"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'grayscale(60%) contrast(1.1)',
                                opacity: 0.85,
                            }}
                        />
                        {/* Heatmap overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background:
                                    'radial-gradient(ellipse 45% 50% at 50% 38%, rgba(220, 80, 40, 0.45) 0%, rgba(220, 120, 50, 0.2) 40%, transparent 70%), ' +
                                    'radial-gradient(ellipse 25% 20% at 42% 62%, rgba(210, 90, 50, 0.35) 0%, transparent 60%), ' +
                                    'radial-gradient(ellipse 20% 15% at 58% 62%, rgba(210, 90, 50, 0.3) 0%, transparent 55%)',
                                mixBlendMode: 'screen',
                                pointerEvents: 'none',
                            }}
                        />
                        {/* Corner brackets */}
                        <div style={{ position: 'absolute', inset: '12%', pointerEvents: 'none' }}>
                            {/* Top-left */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTop: '2px solid var(--home-text-primary)', borderLeft: '2px solid var(--home-text-primary)', opacity: 0.6 }} />
                            {/* Top-right */}
                            <div style={{ position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTop: '2px solid var(--home-text-primary)', borderRight: '2px solid var(--home-text-primary)', opacity: 0.6 }} />
                            {/* Bottom-left */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottom: '2px solid var(--home-text-primary)', borderLeft: '2px solid var(--home-text-primary)', opacity: 0.6 }} />
                            {/* Bottom-right */}
                            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottom: '2px solid var(--home-text-primary)', borderRight: '2px solid var(--home-text-primary)', opacity: 0.6 }} />
                        </div>
                    </div>

                    {/* Data readout — inverted cream */}
                    <div style={{ background: '#E8E3D6', padding: '16px 20px' }}>
                        <div
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                color: '#0F0E0B',
                                lineHeight: 1.9,
                                letterSpacing: '0.04em',
                            }}
                        >
                            <ReadoutRow label="ANALYSIS ID" value="TS-2024-094-A" />
                            <ReadoutRow label="MEDIA TYPE" value="VIDEO" />
                            <ReadoutRow label="FRAME COUNT" value="1248" />
                            <ReadoutRow label="DETECTION STATUS" value="SYNTHETIC" valueColor="var(--home-fake)" />
                        </div>
                    </div>

                    {/* Verdict band */}
                    <div style={{ background: '#DDD6C4', padding: '16px 20px' }}>
                        <span
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '36px',
                                fontWeight: 400,
                                color: 'var(--home-fake)',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            0.94 FAKE
                        </span>
                    </div>

                    {/* Probability readout */}
                    <div style={{ background: '#E8E3D6', padding: '14px 20px 18px' }}>
                        <div
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                color: '#0F0E0B',
                                lineHeight: 1.9,
                                letterSpacing: '0.04em',
                            }}
                        >
                            <ReadoutRow label="FACE SWAP PROBABILITY" value="89%" />
                            <ReadoutRow label="VOICE CLONE PROBABILITY" value="92%" />
                            <ReadoutRow label="LIP SYNC INCONSISTENCY" value="HIGH" valueColor="var(--home-fake)" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── TECHNICAL NOTE ─── */}
            <section
                id="technical-note"
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '120px 32px',
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                    gap: '80px',
                }}
                className="home-tech-grid"
            >
                {/* Left — sticky heading */}
                <div className="home-sticky-heading" style={{ position: 'sticky', top: '120px', alignSelf: 'start' }}>
                    <h2
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '40px',
                            fontWeight: 400,
                            lineHeight: 1.05,
                            color: 'var(--home-text-primary)',
                            margin: 0,
                        }}
                    >
                        How TrueSight detects synthetic media
                    </h2>
                </div>

                {/* Right — prose */}
                <div style={{ maxWidth: '720px' }}>
                    <p
                        style={{
                            fontSize: '17px',
                            lineHeight: 1.7,
                            color: 'var(--home-text-secondary)',
                            marginBottom: '28px',
                        }}
                    >
                        TrueSight AI leverages an ensemble of deep learning models specialized in identifying
                        digital forgeries. Our approach moves beyond single-frame analysis, incorporating{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            temporal consistency
                        </strong>{' '}
                        checks that examine{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            frame-by-frame transitions for artifacts
                        </strong>
                        . This includes scrutinizing{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            subtle anomalies in blinking patterns, gaze direction
                        </strong>
                        , and{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            facial muscle movements
                        </strong>{' '}
                        that are challenging for current{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            generative AI
                        </strong>{' '}
                        to replicate accurately.
                    </p>

                    <p
                        style={{
                            fontSize: '17px',
                            lineHeight: 1.7,
                            color: 'var(--home-text-secondary)',
                            marginBottom: '28px',
                        }}
                    >
                        For audio, we utilize{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            spectral analysis
                        </strong>{' '}
                        and{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            voiceprints
                        </strong>{' '}
                        to detect{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            robotic vocal patterns
                        </strong>{' '}
                        and{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            background noise inconsistencies
                        </strong>
                        .
                    </p>

                    <p
                        style={{
                            fontSize: '17px',
                            lineHeight: 1.7,
                            color: 'var(--home-text-secondary)',
                        }}
                    >
                        Our systems are trained on a diverse and constantly updated dataset, including proprietary
                        synthetic media, ensuring high-fidelity detection against evolving threats. Our validation
                        process achieves an{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            87.6% accuracy
                        </strong>{' '}
                        on challenging benchmarks like{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            FaceForensics++ and DFDC
                        </strong>
                        . Data handling is governed by strict privacy protocols.
                    </p>
                </div>
            </section>

            {/* ─── CASE STUDY ─── */}
            <section
                style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '120px 32px',
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--home-text-tertiary)',
                        display: 'block',
                        marginBottom: '20px',
                    }}
                >
                    Case Study · 2024
                </span>

                <h2
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(32px, 4vw, 48px)',
                        fontWeight: 400,
                        lineHeight: 1.1,
                        color: 'var(--home-text-primary)',
                        maxWidth: '780px',
                        margin: '0 0 40px 0',
                    }}
                >
                    The Hyderabad voice-clone incident: why clinics should care
                </h2>

                {/* Blockquote */}
                <div
                    style={{
                        borderLeft: '2px solid var(--home-accent)',
                        paddingLeft: '24px',
                        maxWidth: '680px',
                        marginBottom: '16px',
                    }}
                >
                    <p
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontStyle: 'italic',
                            fontSize: '24px',
                            lineHeight: 1.4,
                            color: 'var(--home-text-secondary)',
                            margin: 0,
                        }}
                    >
                        "A woman lost approximately ₹1,38,000 to a scammer using AI to mimic her nephew's voice,
                        claiming an emergency. The audio was convincing enough that standard verification failed."
                    </p>
                </div>

                <p
                    style={{
                        fontSize: '13px',
                        color: 'var(--home-text-tertiary)',
                        fontFamily: 'var(--font-body)',
                        paddingLeft: '26px',
                        marginBottom: '32px',
                    }}
                >
                    — Times of India, 2024
                </p>

                <a
                    href="/research/voice-clone-hyderabad"
                    onClick={(e) => {
                        e.preventDefault();
                        // Stub route — "Coming soon" page can be added later
                        alert('Research article coming soon.');
                    }}
                    style={{
                        color: 'var(--home-text-primary)',
                        fontSize: '14px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                >
                    Read the full analysis →
                </a>
            </section>

            {/* ─── SECTION DIVIDER ─── */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}>
                <div style={{ height: '1px', background: 'var(--home-border)' }} />
            </div>

            {/* ─── PERFORMANCE ─── */}
            <section
                id="performance"
                style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    padding: '120px 48px 80px',
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                    gap: '80px',
                }}
                className="home-perf-grid"
            >
                {/* Left — heading */}
                <div>
                    <span
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--home-text-tertiary)',
                            display: 'block',
                            marginBottom: '20px',
                        }}
                    >
                        Performance
                    </span>
                    <h2
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '40px',
                            fontWeight: 400,
                            lineHeight: 1.05,
                            color: 'var(--home-text-primary)',
                            margin: 0,
                        }}
                    >
                        Validated on adversarial benchmarks.
                    </h2>
                </div>

                {/* Right — 2×2 metrics grid */}
                <div>
                    <div
                        className="home-metrics-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            borderTop: '1px solid var(--home-border)',
                            borderLeft: '1px solid var(--home-border)',
                        }}
                    >
                        {[
                            { number: '87.6%', label: 'VALIDATION ACCURACY' },
                            { number: '0.80',  label: 'F1 SCORE' },
                            { number: '0.89',  label: 'ROC-AUC' },
                            { number: '~6%',   label: 'GENERALIZATION GAP' },
                        ].map((m, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '32px',
                                    borderRight: '1px solid var(--home-border)',
                                    borderBottom: '1px solid var(--home-border)',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '56px',
                                        fontWeight: 400,
                                        color: 'var(--home-text-primary)',
                                        lineHeight: 1.0,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {m.number}
                                </div>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '11px',
                                        letterSpacing: '0.2em',
                                        textTransform: 'uppercase',
                                        color: 'var(--home-text-tertiary)',
                                        marginTop: '12px',
                                    }}
                                >
                                    {m.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            lineHeight: 1.7,
                            color: 'var(--home-text-secondary)',
                            marginTop: '24px',
                            maxWidth: '600px',
                        }}
                    >
                        Measured against standard deepfake detection benchmarks including FaceForensics++ and DFDC.
                        Generalization gap measured as the difference between training and validation performance.
                    </p>
                </div>
            </section>

            {/* ─── SECTION DIVIDER ─── */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}>
                <div style={{ height: '1px', background: 'var(--home-border)' }} />
            </div>

            {/* ─── METHODOLOGY ─── */}
            <section
                id="methodology"
                style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '120px 48px 80px',
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--home-text-tertiary)',
                        display: 'block',
                        marginBottom: '20px',
                    }}
                >
                    Methodology
                </span>
                <h2
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '48px',
                        fontWeight: 400,
                        lineHeight: 1.05,
                        color: 'var(--home-text-primary)',
                        margin: '0 0 32px 0',
                    }}
                >
                    A four-stage pipeline.
                </h2>

                {/* Pipeline stages */}
                <div>
                    {[
                        {
                            num: '01',
                            title: 'Ingestion',
                            desc: 'Media is uploaded through the web interface and read as raw bytes. Images, video, and audio are all routed through a unified entry point.',
                        },
                        {
                            num: '02',
                            title: 'Preprocessing',
                            desc: 'Images are resized to 380×380 and normalized against ImageNet statistics before conversion into tensor form. For audio and video, additional temporal and spectral features are extracted.',
                        },
                        {
                            num: '03',
                            title: 'Inference',
                            desc: 'The tensor is passed through a fine-tuned EfficientNet-B4 convolutional network with a custom classifier head (1792 → 256 → 1). The model returns a sigmoid probability.',
                        },
                        {
                            num: '04',
                            title: 'Classification',
                            desc: 'The probability is compared against a 0.70 decision threshold. The system returns a verdict, a confidence score, and supporting metadata for downstream review.',
                        },
                    ].map((stage, i, arr) => (
                        <div key={stage.num}>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '32px',
                                    padding: '48px 0',
                                }}
                                className="home-pipeline-stage"
                            >
                                <div
                                    style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '40px',
                                        fontWeight: 400,
                                        color: 'var(--home-text-tertiary)',
                                        lineHeight: 1,
                                        flexShrink: 0,
                                        width: '56px',
                                    }}
                                >
                                    {stage.num}
                                </div>
                                <div>
                                    <h3
                                        style={{
                                            fontFamily: 'var(--font-body)',
                                            fontSize: '18px',
                                            fontWeight: 500,
                                            color: 'var(--home-text-primary)',
                                            margin: '0 0 8px 0',
                                        }}
                                    >
                                        {stage.title}
                                    </h3>
                                    <p
                                        style={{
                                            fontFamily: 'var(--font-body)',
                                            fontSize: '15px',
                                            lineHeight: 1.6,
                                            color: 'var(--home-text-secondary)',
                                            maxWidth: '640px',
                                            margin: 0,
                                        }}
                                    >
                                        {stage.desc}
                                    </p>
                                </div>
                            </div>
                            {i < arr.length - 1 && (
                                <div style={{ height: '1px', background: 'var(--home-border)' }} />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── SECTION DIVIDER ─── */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}>
                <div style={{ height: '1px', background: 'var(--home-border)' }} />
            </div>

            {/* ─── CAPABILITIES ─── */}
            <section
                style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    padding: '80px 48px',
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--home-text-tertiary)',
                        display: 'block',
                        marginBottom: '16px',
                    }}
                >
                    Capabilities
                </span>
                <h2
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '32px',
                        fontWeight: 400,
                        lineHeight: 1.1,
                        color: 'var(--home-text-primary)',
                        margin: '0 0 32px 0',
                    }}
                >
                    Built for real-time forensic review.
                </h2>

                <div
                    className="home-capabilities-row"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '0',
                    }}
                >
                    {[
                        {
                            title: 'Real-time prediction',
                            desc: 'Synchronous inference with confidence scoring on every upload.',
                        },
                        {
                            title: 'Threshold-based classification',
                            desc: 'Calibrated 0.70 decision boundary informed by validation ROC analysis.',
                        },
                        {
                            title: 'Analytics dashboard',
                            desc: 'Historical verdict distribution, confidence trends, and per-model breakdowns.',
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '0 32px',
                                borderLeft: i > 0 ? '1px solid var(--home-border)' : 'none',
                            }}
                        >
                            <h3
                                style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    color: 'var(--home-text-primary)',
                                    margin: '0 0 6px 0',
                                }}
                            >
                                {item.title}
                            </h3>
                            <p
                                style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '14px',
                                    lineHeight: 1.6,
                                    color: 'var(--home-text-secondary)',
                                    margin: 0,
                                }}
                            >
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── SECTION DIVIDER ─── */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}>
                <div style={{ height: '1px', background: 'var(--home-border)' }} />
            </div>

            {/* ─── ACKNOWLEDGEMENTS ─── */}
            <section
                id="acknowledgements"
                style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    padding: '120px 48px 80px',
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                    gap: '80px',
                }}
                className="home-ack-grid"
            >
                {/* Left — heading */}
                <div>
                    <span
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--home-text-tertiary)',
                            display: 'block',
                            marginBottom: '20px',
                        }}
                    >
                        Acknowledgements
                    </span>
                    <h2
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '40px',
                            fontWeight: 400,
                            lineHeight: 1.05,
                            color: 'var(--home-text-primary)',
                            margin: 0,
                        }}
                    >
                        Research context.
                    </h2>
                </div>

                {/* Right — prose */}
                <div style={{ maxWidth: '720px' }}>
                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '16px',
                            lineHeight: 1.7,
                            color: 'var(--home-text-secondary)',
                            marginBottom: '24px',
                        }}
                    >
                        This work was developed as part of the{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            Pinnacle 6
                        </strong>{' '}
                        capstone project at the{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            Atlas SkillTech University (uGDX School of Technology)
                        </strong>
                        , Mumbai. The goal was to build and deploy an end-to-end deepfake detection system
                        that could be used in real-world clinical and media contexts.
                    </p>

                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '16px',
                            lineHeight: 1.7,
                            color: 'var(--home-text-secondary)',
                            marginBottom: '24px',
                        }}
                    >
                        Project guidance was provided by{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            Prof. Yogesh Jadhav
                        </strong>{' '}
                        and{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            Kunal Meher
                        </strong>
                        . Development was a collaborative effort between{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            Vedant Shah
                        </strong>
                        ,{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            Rashil Shah
                        </strong>
                        , and{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            Vedant Shetty
                        </strong>
                        .
                    </p>

                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '16px',
                            lineHeight: 1.7,
                            color: 'var(--home-text-secondary)',
                            marginBottom: '32px',
                        }}
                    >
                        The detection model builds on the EfficientNet-B4 architecture with custom training
                        against adversarial deepfake datasets. Source code and training notebooks are
                        available on{' '}
                        <strong style={{ color: 'var(--home-text-primary)', fontWeight: 600 }}>
                            GitHub
                        </strong>
                        .
                    </p>

                    {/* Resource line */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '32px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <a
                            href="https://github.com/Vedantshah16/DeefakeDetection"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '14px',
                                color: 'var(--home-text-primary)',
                                textDecoration: 'underline',
                                textUnderlineOffset: '4px',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.target.style.color = 'var(--home-accent)')}
                            onMouseLeave={(e) => (e.target.style.color = 'var(--home-text-primary)')}
                        >
                            GitHub repository →
                        </a>
                        <span
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                color: 'var(--home-text-tertiary)',
                                letterSpacing: '0.04em',
                            }}
                        >
                            Python · PyTorch · OpenCV · NumPy · React · FastAPI
                        </span>
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer
                style={{
                    borderTop: '1px solid var(--home-border)',
                    padding: '40px 32px',
                    maxWidth: '1200px',
                    margin: '128px auto 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                }}
                className="home-footer"
            >
                <span
                    style={{
                        fontSize: '13px',
                        color: 'var(--home-text-tertiary)',
                        fontFamily: 'var(--font-body)',
                    }}
                >
                    TrueSight AI — Built on EfficientNet-B4 · Pinnacle6 Project · 2026
                </span>

                <div style={{ display: 'flex', gap: '24px' }}>
                    {['Privacy', 'Methods', 'Contact'].map((label) => (
                        <a
                            key={label}
                            href={`/${label.toLowerCase()}`}
                            style={{
                                fontSize: '13px',
                                color: 'var(--home-text-tertiary)',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-body)',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.target.style.color = 'var(--home-text-primary)')}
                            onMouseLeave={(e) => (e.target.style.color = 'var(--home-text-tertiary)')}
                        >
                            {label}
                        </a>
                    ))}
                </div>
            </footer>

            {/* ─── Responsive overrides ─── */}
            <style>{`
                .home-editorial a { transition: opacity 0.2s ease; }
                .home-editorial strong { font-weight: 600; }

                @media (max-width: 768px) {
                    .home-hero-grid {
                        grid-template-columns: 1fr !important;
                        padding-top: 80px !important;
                        min-height: auto !important;
                        gap: 40px !important;
                    }
                    .home-tech-grid,
                    .home-perf-grid,
                    .home-ack-grid {
                        grid-template-columns: 1fr !important;
                        gap: 32px !important;
                    }
                    .home-sticky-heading {
                        position: static !important;
                    }
                    .home-metrics-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .home-capabilities-row {
                        grid-template-columns: 1fr !important;
                        gap: 24px !important;
                    }
                    .home-capabilities-row > div {
                        border-left: none !important;
                        padding-left: 0 !important;
                        padding-top: 24px;
                        border-top: 1px solid var(--home-border);
                    }
                    .home-capabilities-row > div:first-child {
                        border-top: none;
                        padding-top: 0;
                    }
                    .home-pipeline-stage {
                        gap: 16px !important;
                    }
                }

                @media (max-width: 640px) {
                    .home-footer {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 12px !important;
                    }
                }
            `}</style>
        </div>
    );
};

/* ─── Readout row helper ─── */
const ReadoutRow = ({ label, value, valueColor }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span>{label}:</span>
        <span style={{ color: valueColor || '#0F0E0B', fontWeight: 500 }}>{value}</span>
    </div>
);

export default Home;
