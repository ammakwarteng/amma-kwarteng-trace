import { useEffect, useRef, useState } from "react";
import { navItems, owner } from "../data/site.js";
import SystemStatus from "./SystemStatus.jsx";
import "./Header.css";

// Small reticle mark used as the logo.
function Mark() {
  return (
    <svg className="header__mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="9" />
      <path d="M16 3v7M16 22v7M3 16h7M22 16h7" />
      <path d="M4 9V4h5M23 4h5v5M28 23v5h-5M9 28H4v-5" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("a")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="header">
      <a className="header__brand" href="#top" aria-label={`${owner.name}, home`}>
        <Mark />
        <span>{owner.brand}</span>
      </a>

      <SystemStatus className="header__status" />

      <button
        ref={toggleRef}
        className="header__toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {/* sections menu: a full-screen sheet on phones, a side panel on laptops */}
      <div className="menu-scrim" hidden={!open} onClick={() => setOpen(false)} aria-hidden="true" />
      <div id="site-menu" ref={panelRef} className="menu" hidden={!open}>
        <p className="menu__label mono" aria-hidden="true">sections · {String(navItems.length).padStart(2, "0")}</p>
        <nav aria-label="Main">
          <ol>
            {navItems.map((item, i) => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={() => setOpen(false)}>
                  <span className="menu__no mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <SystemStatus />
      </div>
    </header>
  );
}
