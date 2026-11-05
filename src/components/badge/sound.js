// Tiny sound effects for the visitor badge, generated with the Web Audio API
// (no audio files). Browsers only allow sound after a user action, and these
// only ever play right after a swipe. Quiet by design.
let ctx = null;
const audio = () => {
  try {
    // iPhone: play like media, so the silent switch doesn't mute it (Safari 16.4+)
    if (navigator.audioSession && navigator.audioSession.type !== "playback") navigator.audioSession.type = "playback";
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

// Call from inside a touch/click handler before any sound: iPhones and some
// browsers only start audio during a real user gesture.
export function unlockAudio() {
  const a = audio();
  if (!a) return;
  try {
    const src = a.createBufferSource();
    src.buffer = a.createBuffer(1, 1, 22050);
    src.connect(a.destination);
    src.start(0);
  } catch { /* ignore */ }
}

// Two short high beeps, like a card reader accepting a badge.
export function beep() {
  const a = audio();
  if (!a) return;
  [0, 0.13].forEach((delay) => {
    const t = a.currentTime + delay;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = "square";
    osc.frequency.value = 1760;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.085);
    osc.connect(gain).connect(a.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  });
}

// A soft swoosh: filtered noise sweeping up as the card leaves.
export function swoosh(delay = 0.18) {
  const a = audio();
  if (!a) return;
  const len = 0.45;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  const gain = a.createGain();
  const t = a.currentTime + delay;
  filter.frequency.setValueAtTime(500, t);
  filter.frequency.exponentialRampToValueAtTime(3200, t + len);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.16, t + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(t);
  src.stop(t + len);
}

// A small buzz on phones that support it (not iPhone).
export function buzz() {
  try { navigator.vibrate?.([18, 40, 18]); } catch { /* not supported */ }
}
