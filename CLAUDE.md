# QA Automation — CuriousMinds Gaming Studio

## Purpose
Independent quality assurance and review infrastructure. This repo is deliberately
separate from game code to ensure review objectivity.

## Review Team (3rd-Party Independent)

### Agents
- `code-reviewer` (Opus) — Code quality, UE5 conventions, performance, maintainability
- `architecture-reviewer` (Opus) — System design, dependencies, scalability, tech debt
- `security-auditor` (Opus) — Vulnerabilities, anti-cheat vectors, data protection, memory safety

### Review Protocol
1. Every wave of C++ systems gets reviewed by ALL 3 agents
2. Reviewers have READ-ONLY access to TacticalStrike repo
3. Reviewers produce verdicts: SHIP IT / NEEDS FIXES / BLOCK
4. Blocking issues must be resolved before next wave ships
5. Review reports stored in `reviews/` directory with date stamps

### Independence Rules
- Review agents NEVER write code in TacticalStrike repo
- Review agents NEVER approve their own suggestions
- Review findings are logged, not auto-applied
- Chairman has final override authority

## Directory Structure
```
.claude/agents/     — Review agent definitions
reviews/            — Review reports by wave/date
test-suites/        — Automated test configurations
load-tests/         — Performance/load test scripts
quality-gates/      — CI/CD quality gate definitions
```
