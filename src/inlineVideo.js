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
// play on the first tap/click if autoplay was refused
export function playOnFirstGesture(v, then) {
  const go = () => { playInline(v).then(() => then?.()).catch(() => {}); off(); };
  const off = () => ["touchend", "click", "keydown"].forEach((e) => removeEventListener(e, go, true));
  ["touchend", "click", "keydown"].forEach((e) => addEventListener(e, go, { capture: true, passive: true, once: true }));
  return off;
}
