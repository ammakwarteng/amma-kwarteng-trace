// Loads Spotify's official iFrame API once, on demand (only after the visitor
// presses play), and resolves with the IFrameAPI object.
// Docs: https://developer.spotify.com/documentation/embeds/references/iframe-api

let pending = null;

export function loadSpotifyIframeApi(timeoutMs = 10000) {
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending = null;
      reject(new Error("Spotify player did not load"));
    }, timeoutMs);
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      clearTimeout(timer);
      resolve(IFrameAPI);
    };
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => {
      clearTimeout(timer);
      pending = null;
      reject(new Error("Spotify player could not be reached"));
    };
    document.head.appendChild(script);
  });
  return pending;
}
