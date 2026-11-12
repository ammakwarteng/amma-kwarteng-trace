import { useEffect, useState } from "react";

// "click" on laptops and desktops (a mouse or trackpad), "tap" on phones and tablets,
// so the little hints on the page talk about the device in the visitor's hand.
const FINE = "(hover: hover) and (pointer: fine)";
export function usePointerVerb() {
  const [fine, setFine] = useState(() => typeof matchMedia !== "undefined" && matchMedia(FINE).matches);
  useEffect(() => {
    const m = matchMedia(FINE);
    const on = () => setFine(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return { fine, verb: fine ? "click" : "tap" };
}
