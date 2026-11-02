import { useEffect, useState } from "react";
import { email } from "../data/site.js";
import "./EmailLink.css";

/*
  Amma's email, assembled in the browser from its parts so the full address
  never sits in the page source for scraper bots to collect.
  variant "link": a plain "email" link that opens the visitor's mail app.
  variant "full": the address as text plus a copy button.
*/
export default function EmailLink({ variant = "link" }) {
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setAddress(`${email.user}@${email.domain}`); }, []);
  if (!address) return null;

  if (variant === "link") {
    return <a href={`mailto:${address}`}>email</a>;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked: select the text so it can be copied by hand
      const el = document.getElementById("email-address");
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  return (
    <span className="email">
      <a id="email-address" href={`mailto:${address}`}>{address}</a>
      <button type="button" className="email__copy mono" onClick={copy} aria-live="polite">
        {copied ? "copied" : "copy"}
      </button>
    </span>
  );
}
