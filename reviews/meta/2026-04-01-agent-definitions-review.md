# QA Agent Definitions Review Report

**Reviewer:** Document Reviewer
**Date:** 2026-04-01
**Scope:** All 9 agents in `.claude/agents/`

---

## Systemic Issues (ALL 9 AGENTS)

### 1. [CRITICAL] Bash Tool Grants Write Access -- Violates READ-ONLY Principle
Every agent has `tools: ... Bash` which allows arbitrary writes, deletions, git operations. CLAUDE.md states "Reviewers have READ-ONLY access to all repos." No deny-list constrains Bash.

**Fix:** Remove Bash from all agents (rely on Read/Glob/Grep), or create per-agent deny rules blocking write commands.

### 2. [MAJOR] Inconsistent Verdict Terminology (7 of 9 agents)
CLAUDE.md specifies `SHIP IT / NEEDS FIXES / BLOCK`. Only code-reviewer matches exactly.

| Agent | Verdict Used | Match? |
|-------|-------------|--------|
| code-reviewer | SHIP IT / NEEDS FIXES / BLOCK | YES |
| architecture-reviewer | APPROVED / CONDITIONAL / REJECTED | NO |
| security-auditor | SECURE / CONDITIONAL / VULNERABLE | NO |
| gamedev-reviewer | VERTICAL SLICE READY / NEEDS WORK / NOT SHIPPABLE | NO |
| document-reviewer | PUBLISH / REVISE / BLOCK | Partial |
| process-reviewer | STUDIO GRADE: A/B/C/D/F | NO |
| financial-reviewer | CERTIFIED / REVISE / BLOCK | Partial |
| ui-reviewer | SHIP / FIX / BLOCK | Close |
| claude-usage-reviewer | CLAUDE USAGE GRADE: A/B/C/D/F | NO |

**Fix:** Standardize all to `SHIP IT / NEEDS FIXES / BLOCK` as final verdict.

### 3. [MINOR] Responsibility Overlap (4 agents)
code-reviewer, architecture-reviewer, security-auditor, gamedev-reviewer all cover UE5 conventions, security, architecture, and performance.

**Fix:** Add "Defer to [agent] for [topic]" boundaries.

---

## Per-Agent Scores

| Agent | Score | Issues |
|-------|-------|--------|
| code-reviewer | 6/10 | Overlap with arch + security; premature network section |
| architecture-reviewer | 6/10 | Wrong verdicts; no report path reference |
| security-auditor | 6/10 | Wrong verdicts; CWE refs but no lookup tool |
| gamedev-reviewer | 5/10 | Heavy overlap; wrong verdicts |
| document-reviewer | 7/10 | Close verdicts; WebFetch correctly scoped |
| process-reviewer | 5/10 | Wrong verdicts; overlap with claude-usage-reviewer |
| financial-reviewer | 6/10 | WebSearch tool may not work; wrong verdicts |
| ui-reviewer | 5/10 | No Playwright tool; wrong verdicts; hardcoded URLs |
| claude-usage-reviewer | 7/10 | Wrong verdicts; "Haiku" reference mismatches CLAUDE.md |

**Overall Collection Score: 5.9/10**

---

## Verdict: NEEDS FIXES

Priority actions:
1. **[P0]** Remove or constrain Bash tool to enforce READ-ONLY
2. **[P0]** Standardize verdict terminology to match CLAUDE.md protocol
3. **[P1]** Add responsibility boundaries between overlapping agents
4. **[P2]** Add Playwright MCP to ui-reviewer tools
5. **[P2]** Verify financial-reviewer WebSearch tool availability
