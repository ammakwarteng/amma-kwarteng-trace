import { useEffect, useState } from "react";
import { supabase, checkOwner, STAGES } from "./data.js";

/*
  Owner sign-in (unlisted address: /owner). Password first, then a code from an authenticator
  app (TOTP). The first time, it shows a QR code to set the app up. Nothing here grants access
  by itself: the database only accepts writes from the owner's MFA-verified session.
*/
export default function OwnerPage() {
  const [step, setStep] = useState("loading");   // loading | signin | enroll | verify | owner | notowner
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factor, setFactor] = useState(null);     // { id, qr, secret }
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "owner · TRACE";
    const robots = document.createElement("meta");
    robots.name = "robots"; robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    next();
    return () => robots.remove();
  }, []);

  // Work out the next step from the current session.
  async function next() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return setStep("signin");
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal2") return setStep((await checkOwner()) ? "owner" : "notowner");
    const { data: f } = await supabase.auth.mfa.listFactors();
    const totp = f?.totp?.find((x) => x.status === "verified");
    if (totp) { setFactor({ id: totp.id }); return setStep("verify"); }
    // first time: set up the authenticator app (clear any half-finished attempt first)
    for (const old of f?.all?.filter((x) => x.status !== "verified") || []) await supabase.auth.mfa.unenroll({ factorId: old.id });
    const { data, error: e } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "TRACE owner" });
    if (e) { setError(e.message); return setStep("signin"); }
    setFactor({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    setStep("enroll");
  }

  const run = (fn) => async (e) => {
    e?.preventDefault(); setBusy(true); setError("");
    try { await fn(); } catch (err) { setError(err.message || String(err)); }
    setBusy(false);
  };
  const signIn = run(async () => {
    const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setPassword("");
    if (e) throw new Error("That email and password didn't work.");
    await next();
  });
  const verify = run(async () => {
    const { error: e } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.replace(/\s/g, "") });
    setCode("");
    if (e) throw new Error("That code didn't work. Codes change every 30 seconds; try the current one.");
    await next();
  });
  const signOut = run(async () => { await supabase.auth.signOut(); setFactor(null); setStep("signin"); });

  return (
    <main className="rm rm-owner" id="main">
      <header className="rm-head">
        <p className="rm-kicker mono">owner access · restricted</p>
        <h1 className="rm-title">owner</h1>
      </header>

      {step === "loading" && <p className="rm-note mono">checking…</p>}

      {step === "signin" && (
        <form className="rm-form" onSubmit={signIn}>
          <label><span className="mono">email</span><input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label><span className="mono">password</span><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button type="submit" className="rm-btn rm-btn--solid" disabled={busy}>{busy ? "signing in…" : "sign in"}</button>
        </form>
      )}

      {step === "enroll" && factor && (
        <form className="rm-form" onSubmit={verify}>
          <p className="rm-goal">Set up your authenticator app. Scan this code with it (Google Authenticator, Microsoft Authenticator, 1Password…), then type the 6-digit code it shows.</p>
          <img className="rm-qr" src={factor.qr} alt="QR code for your authenticator app" width="200" height="200" />
          <p className="rm-secret mono">can't scan? enter this key: <code>{factor.secret}</code></p>
          <label><span className="mono">6-digit code</span><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" value={code} onChange={(e) => setCode(e.target.value)} required /></label>
          <button type="submit" className="rm-btn rm-btn--solid" disabled={busy}>{busy ? "checking…" : "verify and finish"}</button>
        </form>
      )}

      {step === "verify" && (
        <form className="rm-form" onSubmit={verify}>
          <p className="rm-goal">Enter the 6-digit code from your authenticator app.</p>
          <label><span className="mono">6-digit code</span><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" value={code} onChange={(e) => setCode(e.target.value)} required autoFocus /></label>
          <button type="submit" className="rm-btn rm-btn--solid" disabled={busy}>{busy ? "checking…" : "verify"}</button>
        </form>
      )}

      {step === "owner" && (
        <section className="rm-sec">
          <p className="rm-goal">Owner mode is on for this browser. Open a stage, unlock it, make your changes, then Save &amp; Lock.</p>
          <ul className="rm-owner__stages">
            {STAGES.map((s) => <li key={s.slug}><a href={`/roadmap/${s.slug}`}>{s.title}</a></li>)}
          </ul>
          <button type="button" className="rm-btn rm-btn--quiet" onClick={signOut}>sign out</button>
        </section>
      )}

      {step === "notowner" && (
        <section className="rm-sec">
          <p className="rm-goal">This account isn't the owner of this roadmap.</p>
          <button type="button" className="rm-btn" onClick={signOut}>sign out</button>
        </section>
      )}

      {error && <p className="rm-lock__error" role="alert">{error}</p>}
    </main>
  );
}
