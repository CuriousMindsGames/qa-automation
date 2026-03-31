# Agent Hub Dashboard Review — 2026-04-01

## Reviewer: QA Review Lead
## Scope: localhost:3000 — KPI accuracy, API endpoints, security

---

## Overall Verdict: WARN

---

## 1. Dashboard Availability — PASS
- Server running on localhost:3000
- HTML served correctly (glassmorphism UI, Inter + JetBrains Mono fonts)
- WebSocket heartbeat active (5s interval)

## 2. KPI Accuracy Audit

| KPI | Displayed Value | Actual Value | Source | Verdict |
|-----|----------------|--------------|--------|---------|
| Systems | 193 | 193 (verified) | Computed from filesystem | PASS |
| C++ Files | 545 | 545 (verified) | Computed from filesystem | PASS |
| LOC | 37K | 37K (Source/TacticalStrike only) | Computed via `find + wc` | WARN |
| Commits | 122 | 122 (verified) | Computed from git | PASS |
| Org Repos | 9 | Not independently verified | `gh repo list` (with 9 fallback) | WARN |
| Jira Tickets | 244 | **HARDCODED** (server.js:290) | Static value, not from Jira API | FAIL |
| Confluence Pages | 11 | **HARDCODED** (server.js:291) | Static value | FAIL |
| MCPs Active | 15/15 | **HARDCODED** (server.js:292) | Static value | FAIL |
| QA Reviewers | 9 | **HARDCODED** (server.js:293) | Static value (happens to match .claude/agents/) | WARN |
| Slack Channels | 11 | **HARDCODED** (server.js:294) | Static value | FAIL |
| Active Sessions | 5 | **HARDCODED** (server.js:295) | Static value | FAIL |

**Summary:** 5 of 11 KPIs are hardcoded lies. Only systems, C++ files, LOC, and commits are computed from real data.

## 3. LOC Discrepancy

The `/api/kpis` endpoint reports `37K` LOC but a full `find Source -name "*.cpp" -o -name "*.h" -exec cat {} + | wc -l` returns `74,609`. The discrepancy is because the KPI endpoint uses `find Source/TacticalStrike` (subdirectory only) while the full count includes the parent Source/ dir. Both are significantly lower than PROGRESS.md's claim of 314K.

## 4. Sessions Endpoint — PASS
- `/api/sessions` correctly reports 5 sessions with live git data
- Branch names, last commits, and timestamps are all dynamically computed
- All sessions showing "active" status

## 5. API Security — See security audit report
- No auth, no CORS, no rate limiting (detailed in security report)

---

## Recommendations

1. **HIGH:** Replace hardcoded KPIs with actual API integrations (Jira REST API, Confluence API, Slack API)
2. **HIGH:** Fix LOC counting to be consistent (use same method everywhere)
3. **MEDIUM:** Add "last refreshed" timestamp visible on dashboard for each KPI
4. **LOW:** Add data source indicator (computed vs static) on each KPI card
