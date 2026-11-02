import { useEffect, useState } from "react";
import { owner } from "../data/site.js";

function timeNow() {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: owner.timeZone,
    }).format(new Date());
  } catch {
    return "";
  }
}

// A small, honest status line: the dot and "secure" are decorative brand
// language, and the clock is Amma's real local time in Ontario.
export default function SystemStatus({ className = "" }) {
  const [time, setTime] = useState(timeNow);

  useEffect(() => {
    const id = setInterval(() => setTime(timeNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className={`status mono ${className}`}>
      <span className="status__dot" aria-hidden="true" />
      <span>Sys · Secure</span>
      {time && (
        <span className="status__time">
          <span className="visually-hidden">Local time in Ontario: </span>
          ON {time}
        </span>
      )}
    </p>
  );
}
