# Coachiles – Product One-Pager (Draft)

## 1. Elevator Pitch

For independent and small-team coaches who juggle scattered tools for leads, client onboarding, scheduling, and subscription billing, Coachiles is a unified coaching operating layer that centralizes lead intake, subscription management, and service packaging. Unlike duct‑taped spreadsheets + Stripe + email threads, it provides an integrated, policy‑safe data model with automated subscription + entitlement logic so coaches focus on delivering outcomes, not admin.

## 2. Target Users

Primary: Professional coaches (business, career, wellness) 1–10 active clients who are moving from informal tooling toward a scalable workflow.
Secondary: Prospective coachees discovering and evaluating coaches; platform admins (internal) overseeing quality & safety.

## 3. Core Problem

Coaches lose time and revenue because:

- Lead capture and qualification are manual and inconsistent.
- Subscription tiers, renewals, and proration edge cases create billing errors.
- Client service entitlements (sessions, message access, materials) are not transparently tracked.
- Switching between tools (forms, email, Stripe dashboard, sheets) creates friction + data drift.

## 4. Solution Summary

A cohesive platform that: captures leads, routes them through a structured multi‑step qualification flow, converts them into managed subscriptions, and enforces entitlements + access policies automatically (via Supabase RLS + functions). Built for correctness and auditability first; grows into marketplace discovery and analytics.

## 5. Key Capabilities (Current / In Progress)

- Lead intake & multi‑step progression (start timeframe, status, internal notes).
- Coach service packaging (service definitions, availability foundations; RLS‑hardened).
- Subscription engine (plans, status lifecycle, cleanup + migration scripts to ensure integrity).
- Automatic data syncing & migration scripts (robust SQL migration + fix utilities).
- Secure Role-Based Access via RLS policies (coach, client, admin delineation).
- Account deletion safety path (soft deletion & staged cleanup).
- Early marketplace endpoints & test scripts (coach discovery / search prototypes).

## 6. Differentiators

- Data integrity focus: Extensive SQL fix / cleanup scripts ensuring subscription + leads consistency.
- Security baked in early (RLS policies iteratively hardened; deletion safety process documented).
- Transparent operations: Rich diagnostic SQL (debug\_\* scripts) for fast incident triage.
- Extensible domain schema (services, availability, subscriptions decoupled for future bundling / marketplace use).

## 7. How It Works (Happy Path)

1. Lead submits initial interest (lead record created with timeframe + stage).
2. Coach qualifies lead (status progresses; internal notes captured).
3. Lead converts → subscription (plan selection; service entitlements enforced).
4. Subscription state transitions propagate to access (RLS + functions enforce visibility + actions).
5. Admin / system scripts reconcile anomalies (scheduled or manual diagnostics).

## 8. Current State / Maturity (Draft)

- Backend schema: v1 with multiple corrective migrations and cleanup reports.
- RLS: Hardened across leads, services, subscriptions (see fix-\* policy scripts).
- Test scripts: Manual Node test files hitting RPCs + marketplace endpoints.
- UI: Early components (e.g., CoachHeader) + scaffolding; not yet polished for public.

## 9. Immediate Feedback Objectives (This Round)

We want to validate:

- Clarity: Can a target user articulate value in one sentence after 60s?
- Comprehension of workflow: Do leads → subscription steps feel logical?
- Perceived uniqueness: Do users identify a differentiator unprompted?
- Friction: Top 3 confusion points in current UI / mental model.
- Trust & readiness: Do coaches feel safe putting first paying client through?

Success Signals (exit criteria for this iteration):

- ≥70% testers describe product value & target correctly.
- ≤2 recurring high‑severity confusion clusters after 5 sessions.
- At least one unprompted “Can I also do X?” expansion question per session (pull signal).

## 10. Near-Term Roadmap (Draft)

| Horizon | Focus                         | Outcome                                     |
| ------- | ----------------------------- | ------------------------------------------- |
| 0–30d   | UX polish + guided onboarding | Reduced friction in first coach setup       |
| 30–60d  | Marketplace discovery MVP     | Basic coach search + profile consumption    |
| 60–90d  | Analytics & session tracking  | Coaches see usage & client progress metrics |

(Parallel): Hardening deletion + audit events; reliability instrumentation.

## 11. Business / Monetization (Exploration)

Initial wedge: Low-friction per‑coach subscription (flat monthly) including lead funnel + subscription engine.
Future vectors: Transaction fee on marketplace matches; premium analytics; session recording / artifact storage add‑on.
Pricing Validation Needed: Willingness to pay thresholds, perceived must-have vs. nice-to-have features.

## 12. Key Metrics (Prospective)

Activation: % of new coaches who publish at least 1 service + convert 1 lead in 14 days.
Cycle Time: Median hours from lead creation → subscription start.
Retention: % active subscriptions renewing at least once.
Data Integrity: Weekly count of reconciliation anomalies (target: <3 after hardening).
Referral Intent: NPS-like “recommend to another coach” score.

## 13. Risks & Mitigations

| Risk                                  | Impact                 | Mitigation                                                         |
| ------------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| Complexity of subscription edge cases | Billing errors / churn | Scripted migrations + invariant checks + test harness              |
| RLS misconfiguration                  | Data leakage           | Layered policies + explicit test scripts + least privilege review  |
| Marketplace cold start                | Low discovery value    | Start with invitation-only coach cohort + curated profiles         |
| Scope creep pre-PMF                   | Delayed launch         | Strict feedback-driven backlog; limit per sprint to 3 core changes |

## 14. Known Limitations (To Preempt Noise)

- Visual polish & responsive design incomplete.
- Limited availability scheduling UI (backend groundwork only).
- No production-grade observability yet (logs + basic SQL diagnostics only).
- Manual test scripts instead of automated CI test suite.

## 15. Feedback Request (What We Want From You)

Please:

1. Narrate your understanding after skim.
2. Attempt core task (convert sample lead) while thinking aloud.
3. List top 3 friction points or confusions.
4. Rate (1–5) your confidence you could onboard a real client today.
5. Suggest one feature to drop, one to accelerate.

## 16. What Not To Focus On (Yet)

- Pixel-perfect UI styling.
- Advanced scheduling heuristics.
- Internationalization.
- Deep analytics dashboards.

## 17. Strategic Vision (12–18 mo Glimpse)

Unified coaching marketplace & operating spine: lead acquisition → structured programs → tracked outcomes → longitudinal coach reputation graph powering matching & premium insights.

## 18. Appendix / Reference

- Security & RLS overview: `SECURITY-ASSESSMENT.md`
- Subscription migration reports: `SUBSCRIPTION-CLEANUP-COMPLETION-REPORT.md`
- Account deletion system: `docs/ACCOUNT_DELETION_SYSTEM.md`

---

Status: Draft (feedback round #1). Update this after synthesis.

<!-- End of One-Pager Draft -->
