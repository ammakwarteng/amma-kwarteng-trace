// Sound effects for the visitor badge (no audio files: everything is
// generated in the browser).
//
// Phones are strict about website audio, iPhones especially:
//  - sound may only start during a real tap/click, so we "unlock" audio on
//    the first tap anywhere on the page and again on the card itself;
//  - the Web Audio API can be muted by the iPhone silent switch, so the beep
//    and swoosh are pre-rendered into short WAV clips and played through
//    normal <audio> elements, which play like media.
// The live "zzzip" while dragging needs real-time control, so it stays on
// Web Audio (and asks Safari to treat it as media playback).

let ctx = null;
const audio = () => {
  try {
    if (navigator.audioSession && navigator.audioSession.type !== "playback") navigator.audioSession.type = "playback";
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

// ---------- pre-rendered clips ----------
const clips = { beep: null, swoosh: null };

function toWav(buffer) {
  const data = buffer.getChannelData(0);
  const rate = buffer.sampleRate;
  const out = new DataView(new ArrayBuffer(44 + data.length * 2));
  const str = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF"); out.setUint32(4, 36 + data.length * 2, true); str(8, "WAVE");
  str(12, "fmt "); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
  out.setUint32(24, rate, true); out.setUint32(28, rate * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true);
  str(36, "data"); out.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i])) * 0x7fff, true);
  return URL.createObjectURL(new Blob([out], { type: "audio/wav" }));
}

function render(seconds, build) {
  const Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!Off) return Promise.resolve(null);
  try {
    const off = new Off(1, Math.ceil(44100 * seconds), 44100);
    build(off);
    return new Promise((resolve) => {
      off.oncomplete = (e) => resolve(e.renderedBuffer);
      const p = off.startRendering();
      if (p && p.then) p.then(resolve).catch(() => resolve(null));
    });
  } catch {
    return Promise.resolve(null);
  }
}

function buildBeep(a) {
  [0, 0.13].forEach((t) => {
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = "square";
    osc.frequency.value = 1760;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.085);
    osc.connect(gain).connect(a.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  });
}

function buildSwoosh(a) {
  const len = 0.7;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(400, 0);
  filter.frequency.exponentialRampToValueAtTime(4200, len * 0.8);
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, 0);
  gain.gain.exponentialRampToValueAtTime(0.55, 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, len);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(0);
}

let prepared = false;
function prepareClips() {
  if (prepared) return;
  prepared = true;
  render(0.3, buildBeep).then((b) => { if (b) { clips.beep = new Audio(toWav(b)); clips.beep.preload = "auto"; } });
  render(0.75, buildSwoosh).then((b) => { if (b) { clips.swoosh = new Audio(toWav(b)); clips.swoosh.preload = "auto"; } });
}

// Play a clip; if it isn't ready (or the browser refuses), fall back to live Web Audio.
function playClip(el, fallback, delayMs = 0) {
  const go = () => {
    if (el) {
      try {
        el.muted = false;
        el.currentTime = 0;
        const p = el.play();
        if (p && p.catch) p.catch(() => fallback());
        return;
      } catch { /* fall through */ }
    }
    fallback();
  };
  delayMs ? setTimeout(go, delayMs) : go();
}

// ---------- unlocking ----------
// Call during any tap/click/key press. Resumes Web Audio and "primes" the
// <audio> clips (a muted play/pause), which iPhones remember for later.
let primed = false;
export function unlockAudio() {
  prepareClips();
  const a = audio();
  if (a) {
    try {
      const src = a.createBufferSource();
      src.buffer = a.createBuffer(1, 1, 22050);
      src.connect(a.destination);
      src.start(0);
    } catch { /* ignore */ }
  }
  if (!primed && clips.beep && clips.swoosh) {
    primed = true;
    [clips.beep, clips.swoosh].forEach((el) => {
      try {
        el.muted = true;
        const p = el.play();
        const done = () => { el.pause(); el.currentTime = 0; el.muted = false; };
        if (p && p.then) p.then(done).catch(() => { el.muted = false; primed = false; });
        else done();
      } catch { primed = false; }
    });
  }
}

// Unlock on the first taps anywhere on the page (opening sections, the menu,
// etc.), so audio is ready before the visitor reaches the card.
let installed = false;
export function installAudioUnlock() {
  if (installed) return;
  installed = true;
  prepareClips();
  const opts = { capture: true, passive: true };
  ["touchend", "click", "keydown"].forEach((ev) => document.addEventListener(ev, unlockAudio, opts));
}

// ---------- the sounds ----------
function liveBeep() {
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
function liveSwoosh() {
  const a = audio();
  if (!a) return;
  const len = 0.7;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  const gain = a.createGain();
  const t = a.currentTime;
  filter.frequency.setValueAtTime(400, t);
  filter.frequency.exponentialRampToValueAtTime(4200, t + len * 0.8);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.3, t + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(t);
  src.stop(t + len);
}

// Two short high beeps, like a card reader accepting a badge.
export function beep() { playClip(clips.beep, liveBeep); }

// The card swooshing away after the beep.
export function swoosh() { playClip(clips.swoosh, liveSwoosh, 120); }

// A soft, smooth "shhh" of the card sliding through the reader (no buzz).
// Louder and brighter the faster the card moves; silent when it stops.
let scrape = null;
export function startScrape() {
  const a = audio();
  if (!a || scrape) return;
  const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
  const d = buf.getChannelData(0);
  // soft "pink-ish" noise: smoother than plain white noise
  let last = 0;
  for (let i = 0; i < d.length; i++) { last = 0.97 * last + 0.03 * (Math.random() * 2 - 1); d[i] = last * 6; }
  const src = a.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const band = a.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 900;
  band.Q.value = 0.6;
  const vol = a.createGain();
  vol.gain.value = 0.0001;
  src.connect(band).connect(vol).connect(a.destination);
  src.start();
  scrape = { src, vol, band, a };
}
export function setScrapeSpeed(speed) {
  if (!scrape) return;
  const { vol, band, a } = scrape;
  const s = Math.min(1, Math.abs(speed) / 18);
  const t = a.currentTime;
  vol.gain.setTargetAtTime(0.0001 + s * 0.16, t, 0.05);
  band.frequency.setTargetAtTime(700 + s * 1300, t, 0.08);
}
export function stopScrape() {
  if (!scrape) return;
  const { src, vol, a } = scrape;
  const t = a.currentTime;
  vol.gain.setTargetAtTime(0.0001, t, 0.05);
  try { src.stop(t + 0.3); } catch { /* already stopped */ }
  scrape = null;
}

// A small buzz on phones that support it (not iPhone).
export function buzz() {
  try { navigator.vibrate?.([18, 40, 18]); } catch { /* not supported */ }
}
