import { useEffect, useState } from "react";

/*
  A small running page marker in the corner ("03 / projects"), like the folio of a printed
  publication. It shows the section being read (each section carries data-folio), and stays
  hidden over the hero. Decorative: screen readers get the real headings.
*/
export default function Folio() {
  const [text, setText] = useState("");
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = innerHeight * 0.4;
      let current = "";
      const about = document.querySelector(".stage__anchor");
      if (about && about.getBoundingClientRect().top <= 1) current = "01 / about";
      document.querySelectorAll("[data-folio]").forEach((s) => { if (s.getBoundingClientRect().top <= line) current = s.dataset.folio; });
      setText(current);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, []);
  return <p className={`folio mono ${text ? "is-on" : ""}`} aria-hidden="true">{text}</p>;
}
