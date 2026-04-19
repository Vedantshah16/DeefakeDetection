// src/utils/deriveVerdict.js
//
// Single source of truth for verdict + display percentage derivation.
// The backend's `label` field uses an internal threshold that produces
// counter-intuitive results (e.g. "FAKE" with 67% real probability).
// The frontend ignores `label` and re-derives the verdict from the
// `human_likelihood` field (probability of REAL, 0..100) using our
// own 0.70 threshold.

export const FAKE_THRESHOLD = 0.70;  // fake if fakeProb >= 0.70

/**
 * Derives the verdict and display percentage from a raw backend response.
 *
 * Backend shape (from /ai-detect and /detect):
 *   {
 *     label: "REAL" | "FAKE",              // IGNORED — not reliable
 *     confidence: number (0..100),          // IGNORED — verdict-dependent, misleading
 *     human_likelihood: number (0..100),   // USED — probability of REAL
 *     synthetic_likelihood: number (0..100), // (= 100 - human_likelihood)
 *     ...other fields passed through unchanged
 *   }
 *
 * Returns:
 *   { verdict: 'FAKE' | 'REAL', displayPct: number (0..100), displayLabel: string }
 */
export const deriveDisplay = (raw = {}) => {
  const human = Number(raw.human_likelihood);
  const synthetic = Number(raw.synthetic_likelihood);

  // If neither likelihood is valid, fall back gracefully
  if (!Number.isFinite(human) && !Number.isFinite(synthetic)) {
    return { verdict: 'REAL', displayPct: 0, displayLabel: 'REAL' };
  }

  // Prefer human_likelihood; derive synthetic from it if missing
  const humanProb = Number.isFinite(human)
    ? human / 100
    : 1 - synthetic / 100;

  const fakeProb = 1 - humanProb;
  const isFake = fakeProb >= FAKE_THRESHOLD;

  const displayPct = Math.round((isFake ? fakeProb : humanProb) * 100);

  return {
    verdict: isFake ? 'FAKE' : 'REAL',
    displayPct,
    displayLabel: isFake ? 'FAKE' : 'REAL',
  };
};
