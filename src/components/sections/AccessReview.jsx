import { useEffect, useRef, useState } from "react";
import { leaveTrace } from "../../trace.js";
import "./AccessReview.css";

/*
  Access request review: a compact, interactive IAM case study.
  The visitor acts as the access reviewer for three fictional requests. Each shows the requester,
  their role baseline, the requested permission, the business justification and a policy check
  (least privilege, privilege level, separation of duties). They approve, deny or escalate, see
  whether that matches policy and why, and a simulated audit event is written.
  Every record here is fictional; no real systems are involved.
*/
const REQUESTS = [
  {
    id: "REQ-3107", who: "Daniel Osei", initials: "DO", dept: "Internal Audit", role: "IT Auditor", manager: "R. Mensah", tenure: "2 years",
    perm: "audit-share", level: "read", system: "Evidence file share", risk: "low",
    baseline: ["audit-share · read", "grc-tool · read", "email", "vpn"],
    current: ["grc-tool · read", "email", "vpn"],
    why: "Collecting evidence for the Q4 access review. Read-only, until the audit closes on Dec 15.",
    checks: [["in role baseline", true], ["least privilege (read only)", true], ["privileged access", false, "no"], ["separation of duties conflict", false, "none"], ["time-bound", true]],
    correct: "approve",
    outcome: {
      approve: "Correct. The permission is part of the IT Auditor role, read-only and time-bound. Approving it follows least privilege.",
      deny: "Too strict. This access is in the auditor's role baseline. Denying it blocks legitimate work with no reduction in risk.",
      escalate: "Not needed. Low-risk, in-role, read-only access can be approved by the reviewer. Escalating slows the business down without cause.",
    },
  },
  {
    id: "REQ-3108", who: "Priya Nair", initials: "PN", dept: "Sales", role: "Account Executive", manager: "J. Boateng", tenure: "8 months",
    perm: "finance-ledger", level: "write", system: "Finance ledger", risk: "high",
    baseline: ["crm · edit", "sales-drive · edit", "email", "vpn"],
    current: ["crm · edit", "sales-drive · edit", "email", "vpn"],
    why: "I need to fix an incorrect invoice for a customer before month end.",
    checks: [["in role baseline", false], ["least privilege", false], ["privileged access", false, "no"], ["separation of duties conflict", true, "sales can't post to the ledger"], ["time-bound", false]],
    correct: "deny",
    outcome: {
      deny: "Correct. Ledger write access is outside the Sales role and breaks separation of duties: the person who sells shouldn't also post to the books. The right path is a ticket to Finance to correct the invoice.",
      approve: "Policy violation. Giving Sales write access to the ledger breaks separation of duties and least privilege, and this is how fraud and errors slip through.",
      escalate: "Not quite. There's no legitimate version of this access for the role. Deny it and route the invoice fix to Finance.",
    },
  },
  {
    id: "REQ-3109", who: "Maya Chen", initials: "MC", dept: "Engineering", role: "Software Engineer", manager: "K. Asante", tenure: "3 weeks",
    perm: "prod-database", level: "admin", system: "Production database", risk: "critical",
    baseline: ["github · eng-dev", "jira", "staging-db · read", "email", "vpn"],
    current: ["github · eng-dev", "jira", "staging-db · read", "email", "vpn"],
    why: "Investigating incident INC-2207 (orders failing in production). Needed for 48 hours.",
    checks: [["in role baseline", false], ["least privilege", false, "admin is broader than needed"], ["privileged access", true, "yes"], ["separation of duties conflict", false, "none"], ["time-bound", true, "48 h"]],
    correct: "escalate",
    outcome: {
      escalate: "Correct. There's a real business need, but production admin is privileged access outside the role. It goes to the system owner and security for approval, time-limited through PAM, ideally narrowed to read access, and monitored.",
      approve: "Too risky. Production admin is privileged access outside the role. A reviewer shouldn't grant it alone, even for a real incident.",
      deny: "Too blunt. The incident is real, so a flat denial stops the fix. Escalate it so the system owner can grant narrow, time-limited access.",
    },
  },
];
const now = () => new Date().toTimeString().slice(0, 8);

export default function AccessReview() {
  const [i, setI] = useState(0);
  const [decisions, setDecisions] = useState({});
  const [log, setLog] = useState([]);
  const r = REQUESTS[i], d = decisions[r.id];
  const decide = (choice) => {
    if (d) return;
    const ok = choice === r.correct;
    setDecisions((x) => ({ ...x, [r.id]: choice }));
    const ev = { t: now(), id: `IAM-7${r.id.slice(-3)}`, text: `access.request.${choice === "approve" ? "approved" : choice === "deny" ? "denied" : "escalated"} · ${r.id} · ${r.perm}:${r.level} · ${r.who}`, ok };
    setLog((l) => [...l, ev]);
    leaveTrace("access.decision", `${r.id} ${choice}d · ${ok ? "policy-aligned" : "outside policy"}`, choice === "deny" ? "denied" : choice === "escalate" ? "escalated" : "granted");
  };
  const done = Object.keys(decisions).length;
  const aligned = REQUESTS.filter((x) => decisions[x.id] === x.correct).length;
  const reset = () => { setI(0); setDecisions({}); setLog([]); };

  return (
    <div className="ar">
      <header className="ar__bar">
        <span>access requests · review queue</span>
        <span>{done} / {REQUESTS.length} reviewed</span>
      </header>
      <nav className="ar__queue" aria-label="Requests">
        {REQUESTS.map((x, n) => (
          <button key={x.id} type="button" className={`ar__q ${n === i ? "is-on" : ""}`} onClick={() => setI(n)} aria-current={n === i}>
            <span className="ar__qid">{x.id}</span>
            <span>{x.who}</span>
            <span className={`ar__state ${decisions[x.id] ? "is-done" : ""}`}>{decisions[x.id] ? `${decisions[x.id]}d` : "pending"}</span>
          </button>
        ))}
      </nav>

      <div className="ar__body">
        <section className="ar__col" aria-label="Requester">
          <div className="ar__person"><span className="ar__av">{r.initials}</span><div><b>{r.who}</b><small>{r.role} · {r.dept}</small></div></div>
          <dl className="ar__kv"><div><dt>manager</dt><dd>{r.manager}</dd></div><div><dt>tenure</dt><dd>{r.tenure}</dd></div></dl>
          <p className="ar__h">role baseline</p>
          <ul className="ar__list">{r.baseline.map((b) => <li key={b}>{b}</li>)}</ul>
          <p className="ar__h">current access</p>
          <ul className="ar__list ar__list--dim">{r.current.map((b) => <li key={b}>{b}</li>)}</ul>
        </section>

        <section className="ar__col ar__col--main" aria-label="Request">
          <p className="ar__h">requested permission</p>
          <div className="ar__perm"><b>{r.perm}</b><span>{r.level}</span><em className={`ar__risk is-${r.risk}`}>{r.risk} risk</em></div>
          <small className="ar__sys">{r.system}</small>
          <p className="ar__h">business justification</p>
          <blockquote className="ar__why">"{r.why}"</blockquote>
          <p className="ar__h">policy check</p>
          <ul className="ar__checks">
            {r.checks.map(([k, v, note]) => {
              const bad = k.startsWith("privileged") || k.startsWith("separation") ? v : !v;
              return <li key={k} className={bad ? "is-bad" : "is-good"}><i aria-hidden="true" />{k}{note ? <span>· {note}</span> : ""}</li>;
            })}
          </ul>

          <div className="ar__actions" role="group" aria-label="Decision">
            {["approve", "deny", "escalate"].map((c) => (
              <button key={c} type="button" className={`ar__btn ${d === c ? "is-picked" : ""}`} onClick={() => decide(c)} disabled={!!d}>{c}</button>
            ))}
          </div>
          {d && (
            <div className={`ar__outcome ${d === r.correct ? "is-ok" : "is-off"}`} role="status">
              <b>{d === r.correct ? "policy-aligned decision" : "outside policy"}</b>
              <p>{r.outcome[d]}</p>
              {i < REQUESTS.length - 1 && <button type="button" className="ar__next" onClick={() => setI(i + 1)}>next request →</button>}
            </div>
          )}
        </section>
      </div>

      <footer className="ar__log" aria-label="Audit events">
        <p className="ar__h">audit trail</p>
        {log.length === 0 && <p className="ar__empty">no decisions yet</p>}
        {log.map((e) => <p key={e.id} className="ar__ev"><span>{e.t}</span><span>{e.id}</span><span>{e.text}</span><span className={e.ok ? "is-ok" : "is-off"}>{e.ok ? "aligned" : "flagged"}</span></p>)}
        {done === REQUESTS.length && (
          <div className="ar__done"><b>review complete · {aligned} / {REQUESTS.length} policy-aligned</b><button type="button" className="ar__next" onClick={reset}>reset the queue</button></div>
        )}
      </footer>
    </div>
  );
}
