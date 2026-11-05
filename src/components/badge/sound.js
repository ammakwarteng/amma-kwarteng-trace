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
export function swoosh(delay = 0.12) {
  const a = audio();
  if (!a) return;
  const len = 0.7;
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
  filter.frequency.setValueAtTime(400, t);
  filter.frequency.exponentialRampToValueAtTime(4200, t + len * 0.8);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.3, t + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(t);
  src.stop(t + len);
}

// A small buzz on phones that support it (not iPhone).
export function buzz() {
  try { navigator.vibrate?.([18, 40, 18]); } catch { /* not supported */ }
}

// Continuous "zzzip" of a magnetic stripe dragged through a reader head.
// startScrape() while dragging, setScrapeSpeed(px per frame) as it moves,
// stopScrape() on release. Louder the faster the card moves.
let scrape = null;
export function startScrape() {
  const a = audio();
  if (!a || scrape) return;
  const len = 1;
  const buf = a.createBuffer(1, a.sampleRate * len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const band = a.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2200;
  band.Q.value = 0.9;
  // a fast tremolo gives the gritty "zip" texture of a real swipe
  const grit = a.createGain();
  grit.gain.value = 0.6;
  const lfo = a.createOscillator();
  lfo.frequency.value = 55;
  const lfoDepth = a.createGain();
  lfoDepth.gain.value = 0.4;
  lfo.connect(lfoDepth).connect(grit.gain);
  const vol = a.createGain();
  vol.gain.value = 0.0001;
  src.connect(band).connect(grit).connect(vol).connect(a.destination);
  src.start();
  lfo.start();
  scrape = { src, lfo, vol, band, a };
}
export function setScrapeSpeed(speed) {
  if (!scrape) return;
  const { vol, band, a } = scrape;
  const s = Math.min(1, Math.abs(speed) / 18);
  const t = a.currentTime;
  vol.gain.setTargetAtTime(0.0001 + s * 0.22, t, 0.03);
  band.frequency.setTargetAtTime(1600 + s * 2400, t, 0.05);
}
export function stopScrape() {
  if (!scrape) return;
  const { src, lfo, vol, a } = scrape;
  const t = a.currentTime;
  vol.gain.setTargetAtTime(0.0001, t, 0.03);
  src.stop(t + 0.2);
  lfo.stop(t + 0.2);
  scrape = null;
}
