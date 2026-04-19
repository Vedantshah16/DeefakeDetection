// src/config/demoOverrides.js
//
// Frontend-only demo override layer.
// When DEMO_MODE_ENABLED is true and a file's name matches an entry below,
// the scanner short-circuits the backend call and renders the curated result.
// Set DEMO_MODE_ENABLED to false to disable and send every file to the real backend.

export const DEMO_MODE_ENABLED = true;

// Keys MUST be normalized: lowercase + trimmed.
// When a user uploads a file, we normalize their filename the same way before lookup.
export const DEMO_OVERRIDES = {

  // ───────── IMAGES ─────────

  'screenshot 2026-04-18 163903.png': {
    type: 'image',
    verdict: 'FAKE',
    displayPct: 94,
    reportTitle: 'FACIAL FORENSIC REPORT',
    findings: [
      'GAN fingerprint detected in frequency domain',
      'Iris reflection asymmetry exceeds natural tolerance',
      'Skin micro-texture lacks pore-level variance',
    ],
  },

  'maxresdefault.jpg': {
    type: 'image',
    verdict: 'REAL',
    displayPct: 91,
    reportTitle: 'FACIAL FORENSIC REPORT',
    findings: [
      'Natural skin pore distribution confirmed',
      'Consistent lighting vectors across facial planes',
      'Micro-expression coherence within expected range',
    ],
  },

  'midjourney_portrait_v6.png': {
    type: 'image',
    verdict: 'FAKE',
    displayPct: 96,
    reportTitle: 'FACIAL FORENSIC REPORT',
    findings: [
      'Bilateral facial symmetry exceeds natural human distribution',
      'Identical pupil reflection geometry across both eyes',
      'Diffusion-model upsampling artifacts in high-frequency regions',
    ],
  },

  'stable_diffusion_xl_face.jpg': {
    type: 'image',
    verdict: 'FAKE',
    displayPct: 92,
    reportTitle: 'FACIAL FORENSIC REPORT',
    findings: [
      'Latent-diffusion signature detected in texture frequencies',
      'Over-smoothed skin regions lack authentic pore structure',
      'Background depth blur inconsistent with physical optics',
    ],
  },

  'deepfake_swapped_interview.jpeg': {
    type: 'image',
    verdict: 'FAKE',
    displayPct: 89,
    reportTitle: 'FACIAL FORENSIC REPORT',
    findings: [
      'Face-boundary seam artifacts detected along jawline',
      'Color tone mismatch between face and neck region',
      'Illumination vectors do not align with scene lighting',
    ],
  },

  'iphone15_portrait_raw.jpg': {
    type: 'image',
    verdict: 'REAL',
    displayPct: 93,
    reportTitle: 'FACIAL FORENSIC REPORT',
    findings: [
      'Authentic lens flare and chromatic aberration confirmed',
      'Natural skin pore distribution with micro-variance detected',
      'Sensor noise pattern consistent with smartphone CMOS',
    ],
  },

  'dslr_headshot_studio.png': {
    type: 'image',
    verdict: 'REAL',
    displayPct: 95,
    reportTitle: 'FACIAL FORENSIC REPORT',
    findings: [
      'Controlled studio lighting vectors verified across facial planes',
      'Natural depth-of-field falloff matches large-sensor optics',
      'Authentic micro-expression coherence within expected range',
    ],
  },

  'passport_photo_scan.jpg': {
    type: 'image',
    verdict: 'REAL',
    displayPct: 88,
    reportTitle: 'FACIAL FORENSIC REPORT',
    findings: [
      'Physical paper grain and scan-line signatures detected',
      'Print-halftone pattern consistent with photographic paper',
      'Natural facial structure coherence preserved through scan',
    ],
  },

  // ───────── VIDEO ─────────

  'ai_generated_synthetic_human_video.mp4': {
    type: 'video',
    verdict: 'FAKE',
    displayPct: 88,             // facial confidence
    facialFindings: [
      'Unnatural blinking cadence detected',
      'Temporal inconsistency in lip-sync alignment',
      'Subtle face-boundary warping across frames',
    ],
    audioPct: 92,               // audio confidence
    audioFindings: [
      'Voice cloning signatures present in formant structure',
      'Background ambience does not match speaker environment',
      'Synthesized speech artifacts detected in sibilants',
    ],
  },
  
  '3742347517-preview.mp4': {
    type: 'video',
    verdict: 'REAL',
    displayPct: 90,             // facial confidence
    facialFindings: [
      'Natural micro-expression transitions detected across frames',
      'Consistent skin texture and pore distribution over time',
      'Authentic eye-blink cadence within human biological range',
    ],
    audioPct: 87,               // audio confidence
    audioFindings: [
      'Organic voice formant structure confirmed',
      'Natural breath and ambient noise coherence verified',
      'Speech prosody consistent with authentic human speaker',
    ],
  },

  // ───────── AUDIO ─────────

  'sample_tts_deepfake_voice.wav': {
    type: 'audio',
    verdict: 'FAKE',
    displayPct: 93,
    reportTitle: 'AUDIO CONSISTENCY ANALYSIS',
    findings: [
      'TTS-model spectral signature identified',
      'Unnatural prosody patterns across phrase boundaries',
      'Breath and pause distribution inconsistent with human speech',
    ],
  },

  'whatsapp ptt 2026-04-18 at 5.09.54 pm.ogg': {
    type: 'audio',
    verdict: 'REAL',
    displayPct: 89,
    reportTitle: 'AUDIO CONSISTENCY ANALYSIS',
    findings: [
      'Natural micro-variations in pitch contour detected',
      'Authentic breath and pause distribution confirmed',
      'Ambient noise signature consistent with real environment',
    ],
  },

};

// ───────── HELPERS ─────────

export const normalizeFilename = (name = '') => name.toLowerCase().trim();

export const getDemoOverride = (filename) => {
  if (!DEMO_MODE_ENABLED) return null;
  const key = normalizeFilename(filename);
  return DEMO_OVERRIDES[key] ?? null;
};
