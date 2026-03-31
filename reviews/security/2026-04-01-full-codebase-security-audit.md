# Security Audit: TacticalStrike + Dashboard Full Codebase

**Date:** 2026-04-01
**Auditor:** Security Auditor (Independent, Read-Only)
**Scope:** 545 source files (.h/.cpp) in TacticalStrike UE5 codebase + claude-team-dashboard Node.js codebase
**Model:** Claude Opus 4.6 (1M context)

---

## Threat Level: MEDIUM
## Vulnerabilities Found: 9

---

## Findings

### TACTICALSTRIKE UE5 CODEBASE

#### 1. [SEVERITY: HIGH] [CWE-862] Combat system lacks server authority

- **File:** Combat/UTSCombatComponent.cpp
- **Lines:** 13, 72-100
- **Evidence:** SetIsReplicatedByDefault(false) and ApplyDamage() is BlueprintCallable with no authority checks
- **Description:** The entire damage pipeline (ApplyDamage, OnKill, OnDeath, SetArmorPoints) is callable from any context without HasAuthority() or net role checks. In multiplayer, any client could call ApplyDamage() locally to kill opponents instantly.
- **Exploit scenario:** Cheater calls CombatComponent->ApplyDamage() with fabricated damage data for instant kills.
- **Mitigating factor:** Month 1 is single-player only. Documented as Phase 2 concern.
- **Fix:** Wrap state-mutating combat functions with authority checks. Expose Server RPCs with WithValidation for client damage requests.

#### 2. [SEVERITY: HIGH] [CWE-862] Economy component has no server authority

- **File:** Economy/UTSEconomyComponent.h
- **Lines:** 40-42, 59-69
- **Evidence:** Comment acknowledges no replication yet. AddMoney() and SpendMoney() are BlueprintCallable without authority gate.
- **Description:** Any client could call AddMoney(16000) to max out economy or bypass SpendMoney().
- **Mitigating factor:** Single-player Month 1. Code is architecturally ready for server authority.
- **Fix:** Add DOREPLIFETIME with COND_OwnerOnly. Wrap money operations with authority checks. Expose Server RPCs for buy requests.

#### 3. [SEVERITY: MEDIUM] [CWE-200] Debug console password stored as plaintext property

- **File:** DebugConsole/UTSDebugConsoleManager.h
- **Lines:** 286-287
- **Evidence:** UPROPERTY(EditAnywhere, BlueprintReadWrite) FString AuthPassword
- **Description:** Plaintext password visible in editor, serialized into .uasset, extractable. Direct string compare with no hashing.
- **Mitigating factor:** Debug console disabled in Shipping builds via compile-time guard.
- **Fix:** Hash the password. Remove EditAnywhere. Use config file instead of baked asset.

#### 4. [SEVERITY: MEDIUM] [CWE-284] Debug console cheat commands in Development builds

- **File:** DebugConsole/UTSDebugConsoleManager.h
- **Lines:** 296-349
- **Description:** 20 cheat commands (god, noclip, set_health, set_money, teleport) available in Development builds.
- **Mitigating factor:** UE_BUILD_SHIPPING compile-time guard is the correct approach and cannot be bypassed.
- **Fix:** Ensure CI/CD never ships Development builds. Add server authority for debug commands in Phase 2.

#### 5. [SEVERITY: MEDIUM] [CWE-287] Replication component has corrupted code -- authority checks may not execute

- **File:** Networking/UTSReplicationComponent.cpp
- **Lines:** 40, 66, 82, 108, 120
- **Evidence:** Lines contain corrupted text like t// Server authority check that compiles as comments, not code.
- **Description:** Authority checks appear present but are actually comments due to corrupted formatting. PresetToHz() is static but has a non-static authority check as a comment. An automated patching step likely went wrong.
- **Exploit scenario:** Without executing authority checks, any client can change net update frequency or relevancy settings.
- **Fix:** Audit all functions in this file. Verify authority checks are compiling and executing. Fix corrupted formatting.

#### 6. [SEVERITY: LOW] [CWE-20] RPC validation is minimal

- **File:** Networking/UTSReplicationComponent.cpp
- **Lines:** 106-116
- **Description:** ServerRPC_RequestAction_Validate only checks ActionId >= 0. No upper bound, no TargetLocation validation, no rate limiting.
- **Fix:** Add bounds checking, FMath::IsFinite validation on vectors, rate limiting per player.

#### 7. [SEVERITY: LOW] [CWE-476] LODManager raw pointer risk

- **File:** LODManager/UTSLODManager.h
- **Line:** 231
- **Description:** Raw pointer used for mesh entry lookup. PurgeStaleEntries() mitigates but TWeakObjectPtr is safer.
- **Fix:** Verify and convert to TWeakObjectPtr if using raw pointers.

---

### CLAUDE-TEAM-DASHBOARD NODE.JS CODEBASE

#### 8. [SEVERITY: MEDIUM] [CWE-79] CSP allows unsafe-inline for scripts

- **File:** config.js
- **Lines:** 35-36
- **Description:** CSP with unsafe-inline negates XSS protection for inline script injection.
- **Mitigating factor:** Localhost-only tool. No innerHTML usage found. No user-generated content.
- **Fix:** Replace unsafe-inline with nonce-based CSP.

#### 9. [SEVERITY: LOW] [CWE-352] No CSRF protection on state-changing endpoints

- **File:** server.js
- **Lines:** 208-258
- **Description:** Auth endpoints lack CSRF tokens. Own SECURITY_CHECKLIST.md has the item unchecked.
- **Mitigating factor:** Localhost-only, bearer tokens (not cookies), CORS restricted. Very low exploitability.
- **Fix:** Add CSRF token middleware.

---

## Positive Security Findings

1. **No hardcoded credentials or API keys** in 545 source files. Zero bearer tokens or connection strings.
2. **No unsafe C string operations** (sprintf, strcpy, strcat, gets, scanf). All use UE5 FString.
3. **Comprehensive anti-cheat** (UTSAntiCheatManager): 8 cheat categories with configurable thresholds and escalation.
4. **Cloud save integrity verification**: CRC32 checksums on save/load with corruption detection.
5. **Chat input validation**: Max length, flood protection, profanity filtering.
6. **Dashboard auth well-implemented**: Scrypt (OWASP params), timing-safe compare, token rotation, rate limiting.
7. **Proper security headers**: Helmet, HSTS, X-Frame-Options, nosniff, Permissions-Policy.
8. **Path traversal protection**: validatePath() with normalization and directory checks.
9. **Request size limiting**: 10kb JSON body limit.
10. **Server RPCs use WithValidation** across 8 systems.
11. **Pervasive null checks**: IsValid(), nullptr, TWeakObjectPtr throughout.
12. **No .env files committed**: Properly gitignored.

---

## Summary Table

| # | Severity | CWE | Component | Status |
|---|----------|-----|-----------|--------|
| 1 | HIGH | CWE-862 | Combat server authority | Deferred to Phase 2 |
| 2 | HIGH | CWE-862 | Economy server authority | Deferred to Phase 2 |
| 3 | MEDIUM | CWE-200 | Debug plaintext password | Fix before Dev builds ship |
| 4 | MEDIUM | CWE-284 | Debug cheat commands | Acceptable |
| 5 | MEDIUM | CWE-287 | Replication corrupted code | Investigate immediately |
| 6 | LOW | CWE-20 | RPC validation minimal | Fix before Phase 2 |
| 7 | LOW | CWE-476 | LODManager raw pointer | Verify |
| 8 | MEDIUM | CWE-79 | Dashboard CSP unsafe-inline | Fix recommended |
| 9 | LOW | CWE-352 | Dashboard no CSRF | Low risk |

---

## Verdict: CONDITIONAL

For Month 1 single-player scope, the codebase is acceptably secure. No hardcoded secrets, no unsafe C operations, no exploitable network surfaces. The two HIGH findings are documented Phase 2 work.

The codebase is NOT ready for multiplayer without addressing findings 1, 2, 5, and 6. Finding 5 (corrupted replication code) needs immediate investigation regardless of scope.

**Conditions for SECURE verdict:**
- [ ] Resolve finding 5 (corrupted replication code) immediately
- [ ] Implement server authority for combat and economy before multiplayer
- [ ] Add comprehensive RPC validation before Phase 2
- [ ] Remove unsafe-inline from dashboard CSP

---

*Report generated by Independent Security Auditor. READ-ONLY access. No code modifications made.*
