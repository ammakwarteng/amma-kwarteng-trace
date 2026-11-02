import { useEffect, useRef, useState } from "react";
import { navItems, owner } from "../data/site.js";
import SystemStatus from "./SystemStatus.jsx";
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  // Close the mobile menu with Escape and return focus to the toggle.
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
      <a className="header__brand" href="#top">
        {owner.brand}
        <span className="header__mark" aria-hidden="true" />
      </a>

      <nav className="header__nav" aria-label="Main">
        <ul>
          {navItems.map((item, i) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
              {i < navItems.length - 1 && <span aria-hidden="true">,</span>}
            </li>
          ))}
        </ul>
      </nav>

      <SystemStatus className="header__status" />

      <button
        ref={toggleRef}
        className="header__toggle mono"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>

      <div
        id="mobile-menu"
        ref={panelRef}
        className={`menu ${open ? "is-open" : ""}`}
        hidden={!open}
      >
        <nav aria-label="Main mobile">
          <ol>
            {navItems.map((item, i) => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={() => setOpen(false)}>
                  <span className="mono">{String(i + 1).padStart(2, "0")}</span>
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
