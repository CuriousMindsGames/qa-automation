# Security Audit — server.js & Codebase — 2026-04-01

## Reviewer: QA Review Lead (supplemented by security-auditor agent)
## Scope: server.js, C++ secrets scan, .gitignore audit

---

## Overall Verdict: WARN (with 2 HIGH-severity items)

---

## 1. C++ Secrets Scan — PASS

| Check | Result | Verdict |
|-------|--------|---------|
| Hardcoded IPs | None found | PASS |
| Hardcoded API keys/tokens | None found (token refs are string tokenization) | PASS |
| Hardcoded URLs | None found | PASS |
| Hardcoded passwords | None — "password" refs are game logic (debug console, server browser) | PASS |

**Notes:**
- Debug console (`UTSDebugConsoleManager.cpp:345`) has password auth but `AuthPassword` is a UPROPERTY, not hardcoded
- Server browser has `bPasswordProtected` flag — boolean, not a credential
- MedalSystem `bIsSecret` is a gameplay flag, not a secret

---

## 2. .gitignore Audit — WARN

### TacticalStrike (.gitignore)
| Item | Excluded? | Verdict |
|------|-----------|---------|
| Binaries/ | Yes | PASS |
| Intermediate/ | Yes | PASS |
| Saved/ | Yes | PASS |
| .vs/ | Yes | PASS |
| .env files | **NO** | WARN |
| *.pem / *.key | **NO** | WARN |
| credentials files | **NO** | WARN |

**Recommendation:** Add `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `credentials.json` to TacticalStrike .gitignore.

### CuriousMinds-Gaming-Studio (.gitignore)
| Item | Excluded? | Verdict |
|------|-----------|---------|
| *.env | Yes (line 68) | PASS |
| *.env.* | Yes (line 69) | PASS |
| .env.example | Allowed (line 73) | PASS |
| .env files on disk | Exist but NOT tracked | PASS |

---

## 3. server.js Security Audit — WARN

**File:** `CuriousMinds-Gaming-Studio/ops/agent-hub/server.js`

### CRITICAL/HIGH Findings

| # | Finding | Severity | Location | Verdict |
|---|---------|----------|----------|---------|
| 1 | **No authentication on any endpoint** | HIGH | All routes (lines 25-372) | FAIL |
| 2 | **No CORS configuration** | HIGH | Missing (defaults to allow-all) | FAIL |
| 3 | **Arbitrary file write via POST /api/state** | HIGH | Line 27: `fs.writeFileSync(STATE_FILE, JSON.stringify(req.body))` | FAIL |
| 4 | **No input validation** | MEDIUM | Lines 25-32, 357-372 | WARN |
| 5 | **No rate limiting** | MEDIUM | All endpoints | WARN |
| 6 | **Error messages leak internals** | LOW | Lines 30, 54, 65, 142 | WARN |
| 7 | **execSync with hardcoded paths** | LOW | Lines 166-276 | WARN |
| 8 | **Hardcoded KPI values** | LOW | Line 290: `jiraTickets: 244` (static, not computed) | WARN |
| 9 | **No HTTPS** | LOW | HTTP only (localhost use case) | PASS (acceptable for local dev) |

### Detailed Analysis

**Finding 1 — No Authentication (HIGH)**
- Any process on the machine (or network if exposed) can POST to `/api/state` and overwrite all dashboard state
- `/api/approve/:id` allows unauthenticated approval/rejection of Chairman decisions
- **Exploit scenario:** Malicious local process auto-approves all pending decisions

**Finding 2 — No CORS (HIGH)**
- Any webpage opened in the browser can make requests to localhost:3000
- **Exploit scenario:** Malicious webpage reads dashboard state via XSS

**Finding 3 — Arbitrary File Write (HIGH)**
- POST `/api/state` accepts any JSON body and writes it to state.json
- No schema validation — could write massive payloads (DoS via disk fill)
- **Mitigated by:** localhost-only access assumption

**Finding 8 — Hardcoded KPIs (LOW but misleading)**
- Line 290: `jiraTickets: 244` — This is a static number, not computed from Jira API
- Line 291: `confluencePages: 11` — Also static
- Line 293: `qaReviewers: 9` — Static
- Line 294: `slackChannels: 11` — Static
- These fake KPIs undermine dashboard trustworthiness

---

## 4. Recommendations

1. **HIGH:** Add basic auth or API key to server.js endpoints
2. **HIGH:** Configure CORS to only allow localhost origins
3. **HIGH:** Validate POST body schema before writing to state.json
4. **MEDIUM:** Add rate limiting (express-rate-limit)
5. **MEDIUM:** Add .env/.pem/.key to TacticalStrike .gitignore
6. **LOW:** Replace hardcoded KPIs with actual API calls or remove them
7. **LOW:** Sanitize error messages in production
