# Claude Code Usage Efficiency Audit Report

**Date:** 2026-04-01
**Reviewer:** claude-usage-reviewer (Opus)
**Scope:** All CuriousMinds Gaming Studio workspaces

---

## 1. CLAUDE.md Files -- GOOD

### Findings
1. **[Minor] Contradiction on investment recommendations.** Root CLAUDE.md states "NEVER recommend buy/sell/hold." Memory file `feedback_recommendations.md` overrides: "Give clear BUY/SELL/HOLD recommendations." Behavior depends on read order.
2. **[Minor] Duplication between global and project CLAUDE.md.** `~/.claude/CLAUDE.md` and studio repo copy are nearly identical -- burns context tokens loading twice.
3. **[Good] QA repo CLAUDE.md is well-scoped** (~80 lines, focused, clear trigger table).

---

## 2. Settings and Permissions -- GOOD

### Findings
1. **[Good] `Bash(*)` wildcard enabled** -- matches Chairman's "zero prompts" preference.
2. **[Good] Zerodha trade execution correctly denied** in all settings.
3. **[Good] Destructive git/filesystem operations denied.**
4. **[Major] QA repo has NO settings.json.** No hooks, no deny rules, no status line.
5. **[Minor] TacticalStrike deny list more thorough than global** (blocks sudo, chmod 777, .env). Inconsistency.

---

## 3. Hooks -- NEEDS IMPROVEMENT

### Findings
1. **[Good] TacticalStrike: comprehensive** -- 6 lifecycle events, commit/push validation, asset validation.
2. **[Good] Global: functional but sparse** -- 3 hooks (SessionStart .env load, PostCompact reminder, Agent telemetry).
3. **[Major] QA repo: zero hooks.** No session-start, no post-compact, no activity logging.
4. **[Minor] Dashboard telemetry hook silently fails if Agent Hub is down.** No fallback logging.

---

## 4. Agent Definitions -- NEEDS IMPROVEMENT

### Findings
1. **[Major] 39 agents in TacticalStrike** -- sprawl for solo Month 1 project. Includes localization-lead, community-manager, live-ops-designer.
2. **[Good] QA repo: exactly 9 focused agents** matching CLAUDE.md spec.
3. **[Major] All 9 QA agents use `model: opus`** -- document-reviewer, process-reviewer, ui-reviewer could use Sonnet.
4. **[Major] All 9 QA agents have `maxTurns: 30`** -- excessive. Code review needs ~15, doc review ~10.
5. **[Minor] Overlap between code-reviewer and security-auditor** (security section in both).
6. **[Minor] Overlap between code-reviewer and architecture-reviewer** (architecture section in both).
7. **[Minor] ui-reviewer lacks Playwright MCP in tools list** despite "Playwright mandatory" instruction.

---

## 5. Memory System -- GOOD

### Findings
1. **[Good] Memory indexes well under 200-line limit.** Global: 6 lines. Studio: 21 lines.
2. **[Good] Files well-organized with YAML frontmatter, context, "How to apply."**
3. **[Minor] Duplicate "Playwright Validation" entry in studio MEMORY.md.**
4. **[Warning] `~/.claude/dashboard.key` contains plaintext credential.** Should be in .env or secrets manager.
5. **[Good] Total: 22 memory files, 373 lines. Not bloated.**

---

## 6. Context Management -- NEEDS IMPROVEMENT

### Findings
1. **[Major] 298 MB of session logs** in projects directory (318 .jsonl files). No cleanup policy.
2. **[Good] Worktree isolation in use** (qa-session, ts-session-1, ts-session-2).
3. **[Good] `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` enabled.**
4. **[Minor] TacticalStrike has 38 skills** -- many irrelevant for Month 1 (launch-checklist, release-checklist, localize).

---

## Summary Scorecard

| Area | Rating | Key Issue |
|------|--------|-----------|
| CLAUDE.md Files | GOOD | Recommendation contradiction |
| Settings & Permissions | GOOD | QA repo missing settings.json |
| Hooks | NEEDS IMPROVEMENT | QA repo has zero hooks |
| Agent Definitions | NEEDS IMPROVEMENT | 39 agents sprawl; uniform Opus/30-turns |
| Memory System | GOOD | Plaintext credential in dashboard.key |
| Context Management | NEEDS IMPROVEMENT | 298 MB session logs; skill bloat |

---

## CLAUDE USAGE GRADE: B

## Top 5 Action Items

1. **[P0] Create QA repo `settings.json`** with deny rules, hooks, status line
2. **[P1] Prune TacticalStrike agents from 39 to ~15** for Month 1
3. **[P1] Resolve investment recommendation contradiction** between CLAUDE.md and memory
4. **[P2] Differentiate QA agent model tiers** (Sonnet for doc/process/ui review)
5. **[P2] Clean up 298 MB session logs** and implement retention policy
