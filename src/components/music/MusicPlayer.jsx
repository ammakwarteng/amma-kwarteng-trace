import { useEffect, useRef, useState } from "react";
import data from "../../data/tracks.json";
import { loadSpotifyIframeApi } from "./spotifyEmbed.js";
import "./MusicPlayer.css";

/*
  TRACE music player.

  The track list is Amma's real Spotify top tracks, saved to tracks.json by a
  daily GitHub Action. No Spotify credentials ever reach the browser.

  Playback goes through Spotify's official embed (loaded only after the
  visitor presses play, never autoplay). Spotify plays a preview for visitors
  who are signed out and the full song for those signed in. The embed has no
  volume control, so volume is left to the visitor's device.
*/

const SAMPLE = [
  { id: null, name: "Sample track one", artists: ["Artist name"], album: "", image: null, url: null, durationMs: 0 },
  { id: null, name: "Sample track two", artists: ["Artist name"], album: "", image: null, url: null, durationMs: 0 },
  { id: null, name: "Sample track three", artists: ["Artist name"], album: "", image: null, url: null, durationMs: 0 },
];

const fmtTime = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function MusicPlayer() {
  const isSample = data.tracks.length === 0 && typeof window !== "undefined" && window.location.hash === "#sample-tracks";
  const tracks = data.tracks.length ? data.tracks : isSample ? SAMPLE : [];

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);          // embed mounted
  const [state, setState] = useState("idle");        // idle | loading | ready | error
  const [paused, setPaused] = useState(true);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const hostRef = useRef(null);
  const ctrlRef = useRef(null);

  const track = tracks[index];
  const playable = Boolean(track?.id);

  useEffect(() => () => ctrlRef.current?.destroy?.(), []);

  async function start() {
    if (!playable) return;
    if (ctrlRef.current) { ctrlRef.current.togglePlay(); return; }
    setOpen(true);
    setState("loading");
    try {
      const IFrameAPI = await loadSpotifyIframeApi();
      // wait a tick so the host element is in the DOM
      await new Promise((r) => requestAnimationFrame(r));
      // Spotify replaces the element it is given, so hand it a child React doesn't manage.
      const mount = document.createElement("div");
      hostRef.current.replaceChildren(mount);
      IFrameAPI.createController(
        mount,
        { uri: `spotify:track:${track.id}`, width: "100%", height: 80, theme: "dark" },
        (controller) => {
          ctrlRef.current = controller;
          controller.addListener("ready", () => { setState("ready"); controller.play(); });
          controller.addListener("playback_update", (e) => {
            setPaused(e.data.isPaused);
            setPos(e.data.position);
            setDur(e.data.duration);
          });
        }
      );
    } catch {
      setState("error");
    }
  }

  function go(step) {
    const next = (index + step + tracks.length) % tracks.length;
    setIndex(next);
    setPos(0);
    const c = ctrlRef.current;
    const t = tracks[next];
    if (c && t?.id) {
      c.loadUri(`spotify:track:${t.id}`);
      c.play();
    }
  }

  function seek(e) {
    const c = ctrlRef.current;
    if (!c || !dur) return;
    c.seek((Number(e.target.value) / 1000));
    setPos(Number(e.target.value));
  }

  if (!tracks.length) {
    return (
      <div className="player player--empty mono" role="note">
        <span className="player__eyebrow">On repeat</span>
        <span>Connects to Spotify after setup</span>
      </div>
    );
  }

  const total = dur || track.durationMs || 0;
  return (
    <section className="player" aria-label="Music player">
      <div className="player__head mono">
        <span className="player__eyebrow">
          {isSample ? "sample data" : "on repeat"} · {String(index + 1).padStart(2, "0")}/{String(tracks.length).padStart(2, "0")}
        </span>
        <span className="player__via">{isSample ? "not your music" : "via spotify"}</span>
      </div>

      <div className="player__main">
        <div className="player__art">
          {track.image ? (
            <img src={track.image} alt={`Album cover: ${track.album}`} width="56" height="56" loading="lazy" />
          ) : (
            <span aria-hidden="true" />
          )}
        </div>

        <div className="player__meta">
          <p className="player__title">{track.name}</p>
          <p className="player__artist">{track.artists.join(", ")}</p>
        </div>

        <div className="player__controls">
          {tracks.length > 1 && (
            <button type="button" className="player__btn" onClick={() => go(-1)} aria-label="Previous track">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 3v10M13 3 6 8l7 5z" /></svg>
            </button>
          )}
          <button
            type="button"
            className="player__btn player__btn--play"
            onClick={start}
            disabled={!playable || state === "loading"}
            aria-label={paused ? `Play ${track.name}` : `Pause ${track.name}`}
          >
            {paused ? (
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10l8-5z" /></svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" /></svg>
            )}
          </button>
          {tracks.length > 1 && (
            <button type="button" className="player__btn" onClick={() => go(1)} aria-label="Next track">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M12 3v10M3 3l7 5-7 5z" /></svg>
            </button>
          )}
        </div>
      </div>

      <div className="player__progress">
        <span className="mono">{fmtTime(pos)}</span>
        <input
          id="player-seek"
          type="range"
          min="0"
          max={Math.max(1, total)}
          step="1000"
          value={Math.min(pos, total)}
          onChange={seek}
          disabled={state !== "ready"}
          aria-label="Seek"
          style={{ "--pct": `${total ? (Math.min(pos, total) / total) * 100 : 0}%` }}
        />
        <span className="mono">{fmtTime(total)}</span>
      </div>

      {isSample && <p className="player__note mono">Sample data. Your top tracks appear once Spotify is connected.</p>}
      {state === "error" && (
        <p className="player__note mono">
          Spotify didn't load.{" "}
          {track.url && <a href={track.url} target="_blank" rel="noopener noreferrer">Open in Spotify ↗</a>}
        </p>
      )}

      {open && <div className={`player__embed ${state === "ready" ? "is-ready" : ""}`} ref={hostRef} />}
    </section>
  );
}
