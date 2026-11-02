import { useEffect, useRef, useState } from "react";
import { playlist } from "../../data/playlist.js";
import { loadSpotifyIframeApi } from "./spotifyEmbed.js";
import "./MusicPlayer.css";

/*
  TRACE mini player.

  Songs come from src/data/playlist.js. A song is either:
  - an audio file (played by the browser: play/pause, seek, volume all work), or
  - a Spotify link (played by Spotify's official embed, which appears below
    the mini player while that song is on; Spotify controls its own volume).

  Never autoplays. Shuffle and repeat are handled here, so they work for both.
*/

const asset = (path) => (path && !/^https?:/.test(path) ? `${import.meta.env.BASE_URL}${path}` : path);
const spotifyId = (url = "") => (url.match(/track\/([A-Za-z0-9]+)/) || [])[1] || null;
const fmt = (s) => `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, "0")}`;

const Icon = {
  play: <path d="M6 4v12l10-6z" fill="currentColor" stroke="none" />,
  pause: <path d="M7 4v12M13 4v12" />,
  prev: <path d="M5 4v12M15 4 7.5 10 15 16z" />,
  next: <path d="M15 4v12M5 4l7.5 6L5 16z" />,
  shuffle: <path d="M3 6h3.5c4 0 5 8 9 8H17M3 14h3.5c1.4 0 2.4-1 3.2-2.2M12.3 8.2C13.1 7 14.1 6 15.5 6H17M15 4l2 2-2 2M15 12l2 2-2 2" />,
  repeat: <path d="M4 9V8a3 3 0 0 1 3-3h9M14 3l2 2-2 2M16 11v1a3 3 0 0 1-3 3H4M6 17l-2-2 2-2" />,
  volume: <path d="M3 8h3l4-3v10l-4-3H3zM13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" />,
  mute: <path d="M3 8h3l4-3v10l-4-3H3zM13 8l4 4M17 8l-4 4" />,
};
const Svg = ({ name }) => <svg viewBox="0 0 20 20" aria-hidden="true">{Icon[name]}</svg>;

export default function MusicPlayer() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [embedState, setEmbedState] = useState("idle"); // idle | loading | ready | error
  const audioRef = useRef(null);
  const embedHostRef = useRef(null);
  const embedRef = useRef(null);
  const wantPlay = useRef(false);

  const track = playlist[index];
  const sid = track ? spotifyId(track.spotify) : null;
  const isSpotify = Boolean(sid);

  // When the song changes, load it and keep playing if we were playing.
  useEffect(() => {
    setTime(0);
    setDur(0);
    if (!track) return;
    if (isSpotify) {
      audioRef.current?.pause();
      if (wantPlay.current) startSpotify(sid);
    } else {
      embedRef.current?.pause?.();
      const audio = audioRef.current;
      if (audio && wantPlay.current) audio.play().catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted, index]);

  useEffect(() => () => embedRef.current?.destroy?.(), []);

  async function startSpotify(id) {
    const uri = `spotify:track:${id}`;
    if (embedRef.current) { embedRef.current.loadUri(uri); embedRef.current.play(); return; }
    setEmbedState("loading");
    try {
      const IFrameAPI = await loadSpotifyIframeApi();
      // Spotify replaces the element it is given, so hand it one React doesn't manage.
      const mount = document.createElement("div");
      embedHostRef.current.replaceChildren(mount);
      IFrameAPI.createController(mount, { uri, width: "100%", height: 80, theme: "dark" }, (c) => {
        embedRef.current = c;
        c.addListener("ready", () => { setEmbedState("ready"); c.play(); });
        c.addListener("playback_update", (e) => {
          setPlaying(!e.data.isPaused);
          setTime(e.data.position / 1000);
          setDur(e.data.duration / 1000);
        });
      });
    } catch {
      setEmbedState("error");
    }
  }

  function toggle() {
    if (!track) return;
    if (isSpotify) {
      wantPlay.current = true;
      if (embedRef.current) embedRef.current.togglePlay();
      else startSpotify(sid);
      return;
    }
    const audio = audioRef.current;
    if (audio.paused) { wantPlay.current = true; audio.play().catch(() => setPlaying(false)); }
    else { wantPlay.current = false; audio.pause(); }
  }

  function step(dir) {
    if (playlist.length < 2) { seekTo(0); return; }
    if (shuffle) {
      let n = index;
      while (n === index) n = Math.floor(Math.random() * playlist.length);
      setIndex(n);
    } else {
      setIndex((index + dir + playlist.length) % playlist.length);
    }
  }

  function onEnded() {
    if (repeat) { seekTo(0); audioRef.current?.play(); return; }
    step(1);
  }

  function seekTo(sec) {
    if (isSpotify) embedRef.current?.seek(sec);
    else if (audioRef.current) audioRef.current.currentTime = sec;
    setTime(sec);
  }

  if (!track) {
    return <p className="mini mini--empty mono">add songs in src/data/playlist.js</p>;
  }

  const pct = dur ? Math.min(100, (time / dur) * 100) : 0;

  return (
    <section className="mini" aria-label="Music player">
      {!isSpotify && (
        <audio
          ref={audioRef}
          src={asset(track.src)}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
          onEnded={onEnded}
        />
      )}

      <div className="mini__top">
        <div className="mini__cover">
          {track.cover ? <img src={asset(track.cover)} alt="" width="34" height="34" loading="lazy" /> : <span aria-hidden="true" />}
        </div>
        <div className="mini__meta">
          <p className="mini__title">{track.title}</p>
          <p className="mini__artist">{track.artist}</p>
        </div>
        <button
          type="button"
          className="mini__icon"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          aria-pressed={muted}
          disabled={isSpotify}
          title={isSpotify ? "Use Spotify's player or your device for volume" : undefined}
        >
          <Svg name={muted ? "mute" : "volume"} />
        </button>
      </div>

      <input
        id="mini-seek"
        className="mini__seek"
        type="range"
        min="0"
        max={Math.max(1, Math.floor(dur))}
        step="1"
        value={Math.floor(time)}
        onChange={(e) => seekTo(Number(e.target.value))}
        disabled={!dur}
        aria-label="Seek"
        aria-valuetext={`${fmt(time)} of ${fmt(dur)}`}
        style={{ "--pct": `${pct}%` }}
      />

      <div className="mini__row mono">
        <span className={playing ? "mini__live is-on" : "mini__live"}>{playing ? "playing" : "paused"}</span>
        <span>{fmt(time)} / {fmt(dur)}</span>
      </div>

      <div className="mini__controls">
        <button type="button" className="mini__icon" onClick={() => setShuffle((v) => !v)} aria-label="Shuffle" aria-pressed={shuffle}><Svg name="shuffle" /></button>
        <button type="button" className="mini__icon" onClick={() => step(-1)} aria-label="Previous song"><Svg name="prev" /></button>
        <button type="button" className="mini__play" onClick={toggle} aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`} disabled={embedState === "loading"}>
          <Svg name={playing ? "pause" : "play"} />
        </button>
        <button type="button" className="mini__icon" onClick={() => step(1)} aria-label="Next song"><Svg name="next" /></button>
        <button type="button" className="mini__icon" onClick={() => setRepeat((v) => !v)} aria-label="Repeat song" aria-pressed={repeat}><Svg name="repeat" /></button>
      </div>

      {!isSpotify && (
        <label className="mini__volume" htmlFor="mini-volume">
          <span className="visually-hidden">Volume</span>
          <input id="mini-volume" type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
            onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
            style={{ "--pct": `${(muted ? 0 : volume) * 100}%` }} />
        </label>
      )}

      {embedState === "error" && isSpotify && (
        <p className="mini__note mono">Spotify didn't load. <a href={track.spotify} target="_blank" rel="noopener noreferrer">Open song in Spotify</a></p>
      )}
      <div ref={embedHostRef} className={`mini__embed ${isSpotify && embedState !== "idle" ? "is-open" : ""}`} />
    </section>
  );
}
