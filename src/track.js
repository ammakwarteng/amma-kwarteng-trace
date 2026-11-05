// Count a visitor action in GoatCounter (private dashboard, no cookies, no
// personal data). Does nothing if the counter is blocked or not loaded yet.
export function track(path, title) {
  try {
    window.goatcounter?.count?.({ path, title, event: true });
  } catch {
    /* counter unavailable: ignore */
  }
}
