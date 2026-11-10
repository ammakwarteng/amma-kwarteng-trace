// The visitor's trace: a small, in-memory record of what they did on the site during this visit
// (sections opened, imprints left on the wordmark, resume attempts, doodles pinned). It is shown back
// to them in the session audit log when they sign out. It never leaves the browser and is not stored:
// a reload or "start a new session" clears it.
const ledger = [];
export function leaveTrace(ev, detail, res = "success", key) {
  ledger.push({ t: Date.now(), ev, detail, res, key });
}
export const readTrace = () => ledger.slice();
export function clearTrace() { ledger.length = 0; }
