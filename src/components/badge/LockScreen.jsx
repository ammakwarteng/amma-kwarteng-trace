import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "../../track.js";
import "./LockScreen.css";

/*
  TRACE-VM: a just-for-fun "session locked" screen shown after the visitor
  badge signs out. Nothing on the site is protected by it. The guest password
  is printed on screen on purpose; it's an easter egg, not access control.
  - correct password: back to the top of the site
  - sign out: a VM sign-out sequence, then "powered off" with a power-on button
*/
const GUEST_PASSWORD = "trace2026";

export default function LockScreen({ onResume }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [power, setPower] = useState("on"); // on | signing-out | off
  const [now, setNow] = useState(() => new Date());
  const inputRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add("is-locked");
    const t = setInterval(() => setNow(new Date()), 15000);
    const focus = setTimeout(() => inputRef.current?.focus(), 450);
    return () => {
      document.documentElement.classList.remove("is-locked");
      clearInterval(t);
      clearTimeout(focus);
    };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (value.trim().toLowerCase() === GUEST_PASSWORD) {
      track("trace-vm-unlocked", "TRACE-VM unlocked with the guest password");
      setLeaving(true);
      setTimeout(onResume, 450);
    } else {
      setWrong(true);
      setValue("");
      inputRef.current?.focus();
    }
  };

  const signOut = () => {
    track("trace-vm-signed-out", "TRACE-VM signed out");
    setPower("signing-out");
    setTimeout(() => setPower("off"), 2200);
  };
  const powerOn = () => {
    setPower("on");
    setValue("");
    setWrong(false);
    setTimeout(() => inputRef.current?.focus(), 400);
  };

  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  if (power !== "on") {
    return createPortal(
      <div className={`vm vm--power is-${power}`} role="dialog" aria-modal="true" aria-label="TRACE-VM">
        {power === "signing-out" ? (
          <div className="vm__power" role="status" aria-live="polite">
            <span className="vm__spinner" aria-hidden="true" />
            <p>signing out…</p>
          </div>
        ) : (
          <div className="vm__power">
            <p className="vm__off mono">trace-vm · powered off</p>
            <button type="button" className="vm__poweron" onClick={powerOn} autoFocus>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M7 6.3A7.5 7.5 0 1 0 17 6.3" /></svg>
              power on
            </button>
          </div>
        )}
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className={`vm ${leaving ? "is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="TRACE-VM session locked">
      <header className="vm__bar mono">
        <span>trace-vm · lab.ammakwarteng.com</span>
        <span>{time}</span>
      </header>

      <div className="vm__clock" aria-hidden="true">
        <p className="vm__time">{time}</p>
        <p className="vm__date">{date.toLowerCase()}</p>
      </div>

      <form className="vm__login" onSubmit={submit}>
        <svg className="vm__avatar" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="9" />
          <path d="M16 3v7M16 22v7M3 16h7M22 16h7" />
          <path d="M4 9V4h5M23 4h5v5M28 23v5h-5M9 28H4v-5" />
        </svg>
        <p className="vm__user">LAB\guest</p>
        <p className="vm__status mono">session locked · enter the password to resume the trace</p>
        <div className="vm__field">
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
        <p id="vm-msg" className={`vm__msg mono ${wrong ? "is-wrong" : ""}`} role="status" aria-live="polite">
          {wrong ? "the password is incorrect. try again." : " "}
        </p>
      </form>

      <footer className="vm__foot mono">
        <p id="vm-hint">guest password hint: <code>{GUEST_PASSWORD}</code></p>
        <button type="button" onClick={signOut}>sign out</button>
      </footer>
    </div>,
    document.body
  );
}
