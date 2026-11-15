// Cinematic Sound Engine using Browser Web Audio API
// 100% Self-Contained: Zero external MP3 files, zero latency, offline-ready

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// User preference: Sound enabled/muted
export function isSoundEnabled() {
  try {
    const val = localStorage.getItem('aayush_sound_effects');
    return val !== 'false'; // Default to enabled
  } catch (e) {
    return true;
  }
}

export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem('aayush_sound_effects', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('aayush_sound_setting_changed'));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Iconic Deep Bass Cinematic "Ta-Dum" Sound
 * Synthesized with sub-bass sine sweep and a resonant warm harmonic swell
 */
export function playCinematicIntroSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Sub-bass drop (Impact thump: 120Hz -> 38Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(130, now);
  osc1.frequency.exponentialRampToValueAtTime(36, now + 0.55);

  gain1.gain.setValueAtTime(0.7, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.95);

  // 2. Cinematic Chord Swell (Warm orchestral analog synth: D minor chord)
  const frequencies = [146.83, 174.61, 220.0, 293.66]; // D3, F3, A3, D4
  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.45);
    filter.frequency.exponentialRampToValueAtTime(250, now + 1.2);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08 / (idx + 1), now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + 0.08);
    osc.stop(now + 1.3);
  });
}

/**
 * High-Tech Roulette Click Sound (Ticking wheel)
 */
export function playRouletteClickSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800 + Math.random() * 300, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.045);
}

/**
 * Victory / Winner Fanfare for Roulette Selection
 */
export function playWinnerChimeSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.09);

    gain.gain.setValueAtTime(0.001, now + idx * 0.09);
    gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.09 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.09);
    osc.stop(now + idx * 0.09 + 0.65);
  });
}
