import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "../../track.js";
import "./LockScreen.css";

/*
  TRACE-VM: a just-for-fun virtual machine shown after the visitor badge signs
  out, laid out like a VM window in a hypervisor. Nothing on the site is
  protected by it: the guest password is printed on screen on purpose.

  guest screen states:
    cover       lock screen with the clock; any key, click or ctrl+alt+del opens login
    login       LAB\guest password prompt (correct password resumes the site)
    welcome     signing-in spinner, then back to the top of the site
    signingOut  signing-out spinner, then powered off
    off         powered off, with power on
    booting     startup text, then the lock screen again
*/
const GUEST_PASSWORD = "trace2026";
const BOOT_LINES = [
  "trace-vm firmware 1.0 · lab.ammakwarteng.com",
  "memory test · 4096 MB ok",
  "detecting disks · disk 0 · 60 GB",
  "booting from disk 0…",
  "starting trace os",
  "applying computer settings…",
];

const Mark = (props) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
    <circle cx="16" cy="16" r="9" />
    <path d="M16 3v7M16 22v7M3 16h7M22 16h7" />
    <path d="M4 9V4h5M23 4h5v5M28 23v5h-5M9 28H4v-5" />
  </svg>
);
const PowerIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M7 6.3A7.5 7.5 0 1 0 17 6.3" /></svg>
);

export default function LockScreen({ onResume }) {
  const [screen, setScreen] = useState("cover");
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const [bootLine, setBootLine] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const inputRef = useRef(null);
  const timers = useRef([]);

  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  useEffect(() => {
    document.documentElement.classList.add("is-locked");
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => {
      document.documentElement.classList.remove("is-locked");
      clearInterval(t);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const openLogin = useCallback(() => {
    setScreen("login");
    setWrong(false);
    later(() => inputRef.current?.focus(), 350);
  }, []);

  // cover: any key (including ctrl+alt+del / ctrl+alt+insert) opens the login
  useEffect(() => {
    const onKey = (e) => {
      if (screen === "cover") { e.preventDefault(); openLogin(); }
      else if (screen === "login" && e.key === "Escape") setScreen("cover");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, openLogin]);

  const submit = (e) => {
    e.preventDefault();
    if (value.trim().toLowerCase() === GUEST_PASSWORD) {
      track("trace-vm-unlocked", "TRACE-VM unlocked with the guest password");
      setScreen("welcome");
      later(onResume, 1700);
    } else {
      setWrong(true);
      setValue("");
      inputRef.current?.focus();
    }
  };

  const signOut = () => {
    track("trace-vm-signed-out", "TRACE-VM signed out");
    setScreen("signingOut");
    later(() => setScreen("off"), 2200);
  };

  const powerOn = () => {
    setValue("");
    setWrong(false);
    setBootLine(0);
    setScreen("booting");
    BOOT_LINES.forEach((_, i) => later(() => setBootLine(i + 1), 380 * (i + 1)));
    later(() => setScreen("cover"), 380 * (BOOT_LINES.length + 2));
  };

  const isOff = screen === "off";
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }).toLowerCase();

  return createPortal(
    <div className="vmw" role="dialog" aria-modal="true" aria-label="TRACE-VM virtual machine">
      {/* hypervisor window chrome */}
      <div className="vmw__menu" aria-hidden="true">
        <span className="vmw__menu-words">file&nbsp;&nbsp;edit&nbsp;&nbsp;view&nbsp;&nbsp;vm&nbsp;&nbsp;tabs&nbsp;&nbsp;help</span>
        <span className="vmw__tools">
          <span className={`vmw__pause ${isOff ? "is-off" : ""}`}><i /><i /></span>
          <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6.5" /><path d="M10 6.5V10l2.5 1.5" /></svg>
          <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6.5" /><path d="M6 10h8" /></svg>
          <svg viewBox="0 0 20 20"><rect x="3.5" y="4.5" width="13" height="11" rx="1.5" /><path d="M3.5 8h13" /></svg>
          <svg viewBox="0 0 20 20"><path d="M4 8V4h4M16 12v4h-4M4 4l5 5M16 16l-5-5" /></svg>
        </span>
      </div>
      <div className="vmw__tabs" aria-hidden="true">
        <span className="vmw__tab">home</span>
        <span className="vmw__tab is-active"><Mark className="vmw__tab-icon" />trace-vm<span className="vmw__tab-x">×</span></span>
      </div>

      {/* the guest's screen */}
      <div className={`vmw__screen is-${screen}`}>
        {screen === "cover" && (
          <button type="button" className="vm-cover" onClick={openLogin} aria-label="Unlock: press any key or tap">
            <span className="vm-cover__clock">
              <span className="vm-cover__time">{time}</span>
              <span className="vm-cover__date">{date}</span>
            </span>
            <span className="vm-cover__hint mono">press ctrl + alt + delete to unlock · or tap</span>
          </button>
        )}

        {screen === "login" && (
          <form className="vm-login" onSubmit={submit}>
            <Mark className="vm-login__avatar" />
            <p className="vm-login__user">LAB\guest</p>
            <div className="vm-login__field">
              <input
                ref={inputRef}
                id="vm-password"
                type="password"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
                placeholder="password"
                aria-label="Guest password"
                aria-describedby="vm-msg vm-hint"
                value={value}
                onChange={(e) => { setValue(e.target.value); setWrong(false); }}
              />
              <button type="submit" aria-label="Sign in">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" /></svg>
              </button>
            </div>
            <p id="vm-msg" className={`vm-login__msg mono ${wrong ? "is-wrong" : ""}`} role="status" aria-live="polite">
              {wrong ? "the password is incorrect. try again." : " "}
            </p>
            <p id="vm-hint" className="vm-login__hint mono">guest password hint: <code>{GUEST_PASSWORD}</code></p>
          </form>
        )}

        {(screen === "welcome" || screen === "signingOut") && (
          <div className="vm-busy" role="status" aria-live="polite">
            <span className="vm-busy__spin" aria-hidden="true" />
            <p>{screen === "welcome" ? "welcome" : "signing out…"}</p>
          </div>
        )}

        {screen === "booting" && (
          <div className="vm-boot mono" role="status" aria-live="polite">
            {BOOT_LINES.slice(0, bootLine).map((l) => <p key={l}>{l}</p>)}
            <span className="vm-boot__cursor" aria-hidden="true" />
          </div>
        )}

        {isOff && (
          <div className="vm-off">
            <p className="mono">trace-vm · powered off</p>
            <button type="button" onClick={powerOn} autoFocus><PowerIcon />power on</button>
          </div>
        )}

        {/* guest status icons, bottom right (only while the guest is running) */}
        {(screen === "cover" || screen === "login") && (
          <div className="vm-tray">
            <span className="mono" aria-hidden="true">ENG</span>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8a10 10 0 0 1 14 0M5.5 10.5a6.5 6.5 0 0 1 9 0M8 13a3 3 0 0 1 4 0" /><circle cx="10" cy="15.5" r="0.8" /></svg>
            <button type="button" className="vm-tray__power" onClick={signOut} aria-label="Sign out of TRACE-VM">
              <PowerIcon /><span className="mono">sign out</span>
            </button>
          </div>
        )}
      </div>

      <div className="vmw__status mono" aria-hidden="true">
        <span>to direct input to this VM, click inside or press ctrl+g.</span>
        <span className="vmw__status-icons"><i /><i /><i /></span>
      </div>
    </div>,
    document.body
  );
}
