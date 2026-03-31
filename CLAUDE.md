# QA Automation — CuriousMinds Gaming Studio

## Purpose
Independent quality assurance and review infrastructure. This repo is deliberately
separate from game code to ensure review objectivity. Reviews are NON-NEGOTIABLE.

## Review Team (3rd-Party Independent)

### Agents (9 Reviewers)

#### Code & Architecture
- `code-reviewer` (Opus) — Code quality, UE5 conventions, performance, maintainability
- `architecture-reviewer` (Opus) — System design, dependencies, scalability, tech debt
- `security-auditor` (Opus) — Vulnerabilities, anti-cheat vectors, data protection, memory safety

#### Game Development
- `gamedev-reviewer` (Opus) — UE5 best practices, gameplay design, AAA standards, platform compliance

#### Documents & Process
- `document-reviewer` (Opus) — GDDs, Confluence, READMEs, PROGRESS.md accuracy
- `process-reviewer` (Opus) — SDLC compliance, git hygiene, Jira workflow, operational maturity

#### Finance & UI
- `financial-reviewer` (Opus) — Investment data verification, source citations, compliance
- `ui-reviewer` (Opus) — Dashboard validation, visual consistency, Playwright verification

#### Meta
- `claude-usage-reviewer` (Opus) — Claude Code efficiency, hooks, memory, agent scoping

### Review Protocol
1. Every wave of C++ systems gets reviewed by code-reviewer + architecture-reviewer + security-auditor
2. Every document change gets reviewed by document-reviewer
3. Every dashboard/UI change gets reviewed by ui-reviewer (Playwright mandatory)
4. Every investment report gets reviewed by financial-reviewer
5. Process review runs weekly (or on Chairman's request)
6. Game dev standards review runs every 10 waves
7. Claude usage review runs weekly
8. Reviewers have READ-ONLY access to all repos
9. Reviewers produce verdicts: SHIP IT / NEEDS FIXES / BLOCK
10. Blocking issues must be resolved before next wave ships
11. Review reports stored in `reviews/` directory with date stamps

### Auto-Trigger Rules
| Trigger | Reviewers Activated |
|---------|-------------------|
| New C++ wave committed | code-reviewer, architecture-reviewer, security-auditor |
| Document updated | document-reviewer |
| Dashboard HTML/JS changed | ui-reviewer |
| Investment report filed | financial-reviewer |
| Every 10 waves | gamedev-reviewer |
| Weekly | process-reviewer, claude-usage-reviewer |
| Chairman requests | ALL reviewers |

### Independence Rules
- Review agents NEVER write code in TacticalStrike repo
- Review agents NEVER approve their own suggestions
- Review findings are logged, not auto-applied
- Chairman has final override authority
- Reviews cannot be skipped — this is NON-NEGOTIABLE

## Directory Structure
```
.claude/agents/     — Review agent definitions (9 agents)
reviews/            — Review reports by wave/date
reviews/code/       — Code review reports
reviews/docs/       — Document review reports
reviews/process/    — Process audit reports
reviews/finance/    — Financial verification reports
reviews/ui/         — UI/dashboard validation reports
reviews/gamedev/    — Game development standards reports
reviews/security/   — Security audit reports
reviews/meta/       — Claude usage and efficiency reviews
test-suites/        — Automated test configurations
load-tests/         — Performance/load test scripts
quality-gates/      — CI/CD quality gate definitions
```
