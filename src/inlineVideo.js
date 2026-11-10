// Make a <video> autoplay-safe everywhere, including iPhone Safari:
// React doesn't write the `muted` attribute to the HTML, and Safari only allows autoplay when the
// element is muted *as an attribute* and plays inline. This sets both, then tries to play.
// If the browser still blocks it (e.g. iPhone Low Power Mode), it retries on the visitor's first touch.
export function prepareInline(v) {
  if (!v) return;
  v.muted = true; v.defaultMuted = true;
  v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");
}
export function playInline(v, { onBlocked } = {}) {
  if (!v) return Promise.reject(new Error("no video"));
  prepareInline(v);
  const p = v.play();
  return (p && p.catch ? p : Promise.resolve()).catch((err) => {
    onBlocked?.(err);
    throw err;
  });
}
// play on the visitor's first tap, click or key press if autoplay was refused (e.g. iPhone Low
// Power Mode). Keeps listening until playback really starts: a touch that turns out to be a
// scroll doesn't count as a tap on iOS, so the next gesture tries again.
const GESTURES = ["touchend", "click", "keydown"];
export function playOnFirstGesture(v, then) {
  let done = false;
  const off = () => GESTURES.forEach((e) => removeEventListener(e, go, true));
  const go = () => {
    if (done) return;
    playInline(v).then(() => { done = true; off(); then?.(); }).catch(() => {});
  };
  GESTURES.forEach((e) => addEventListener(e, go, { capture: true, passive: true }));
  return off;
}
