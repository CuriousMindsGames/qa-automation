# QA Session 3 — Consolidated Findings Report

**Date:** 2026-04-01
**QA Lead:** Independent QA Review Team (9 agents)
**Scope:** TacticalStrike C++ codebase (545 files), Agent Hub Dashboard, Process & Documentation

---

## Executive Summary

| Category | Verdict |
|----------|---------|
| Fisher-Yates Shuffle Fix | SHIP IT |
| FTSMedalCheckContext Refactor | SHIP IT |
| C++ Code Quality | NEEDS FIXES |
| Security | CONDITIONAL |
| Architecture | NEEDS FIXES |
| Dashboard KPIs | NEEDS FIXES |
| Process/SDLC | NEEDS FIXES |

---

## CRITICAL / HIGH Findings (9 items)

### 1. [CRITICAL] ContractSystem whitespace corruption
- **File:** `ContractSystem/TSContractSystemManager.cpp`
- **Lines:** 60, 103, 135, 167, 204, 245, 253, 262
- **Issue:** Authority checks are corrupted — `t// Server authority check` followed by code on same line with tabs. These are NOT executing as intended. The `t` prefix makes the authority check a label, and the rest compiles as unreachable or ambiguous.
- **Impact:** Authority checks silently fail to execute. All contract operations (accept, abandon, claim, update, refresh, save, load, expiry) run without server authority validation.
- **Same corruption found in:** `Networking/UTSReplicationComponent.cpp` (Security Finding #5)
- **Action:** Fix formatting immediately — separate authority checks onto proper lines with braces.

### 2. [HIGH] Combat system lacks server authority (CWE-862)
- **File:** `Combat/UTSCombatComponent.cpp`
- **Issue:** ApplyDamage() is BlueprintCallable with no HasAuthority() guard. SetIsReplicatedByDefault(false).
- **Impact:** Phase 2 multiplayer would allow instant-kill exploits.
- **Action:** Deferred to Phase 2, but architecture must be planned now.

### 3. [HIGH] Economy component has no server authority (CWE-862)
- **File:** `Economy/UTSEconomyComponent.h`
- **Issue:** AddMoney() and SpendMoney() are BlueprintCallable without authority gate.
- **Impact:** Phase 2 multiplayer money exploit.
- **Action:** Deferred to Phase 2.

### 4. [HIGH] ETSSurfaceType defined in 3 separate headers
- **Files:**
  - `Footstep/TSFootstepManager.h:11` — 10 enum values
  - `FootstepSystem/UTSFootstepSystemManager.h:17` — 12 enum values (adds Grass, Sand, Snow)
  - `EnvironmentAudio/UTSEnvironmentAudioManager.h:39` — unknown overlap
  - `ClimbSystem/UTSClimbSystemManager.h:32` — 6 enum values (Ice, Vegetation, Rock)
- **Issue:** Multiple incompatible definitions of the same enum. ODR violation. Different files have different enum values. DecalManager comments say "reused from TSFootstepManager.h" but ClimbSystem defines its own incompatible version.
- **Impact:** Linking ambiguity, potential runtime mismatches. Surface types mean different things in different systems.
- **Action:** Consolidate into a single `ETSSurfaceType` in `Core/TSTypes.h` with the union of all values.

### 5. [HIGH] Dashboard KPIs — 5 of 11 are hardcoded
- **File:** `claude-team-dashboard/server.js:290-295`
- **Issue:** Jira Tickets (244), Confluence Pages (11), MCPs Active (15/15), Slack Channels (11), Active Sessions (5) are all static values, not computed from real data.
- **Impact:** Dashboard shows fabricated data. Misleading for decision-making.
- **Action:** Replace with actual API integrations or mark clearly as "placeholder."

### 6. [HIGH] Debug console plaintext password (CWE-200)
- **File:** `DebugConsole/UTSDebugConsoleManager.h:286-287`
- **Issue:** AuthPassword stored as UPROPERTY(EditAnywhere, BlueprintReadWrite) FString — plaintext, extractable from .uasset.
- **Action:** Hash the password. Remove EditAnywhere. Use config file.

### 7. [HIGH] Replication component corrupted code (CWE-287)
- **File:** `Networking/UTSReplicationComponent.cpp:40,66,82,108,120`
- **Issue:** Same whitespace corruption as ContractSystem. Authority checks are comments, not code.
- **Action:** Fix formatting immediately.

### 8. [HIGH] PROGRESS.md claims 314K LOC — actual is 37K-75K
- **Issue:** PROGRESS.md overstates LOC by 4-8x depending on counting method. Dashboard shows 37K (Source/TacticalStrike only), full wc -l gives ~75K. Neither matches 314K.
- **Action:** Correct PROGRESS.md to reflect actual numbers.

### 9. [HIGH] TrackedTargets TArray stores raw AActor* without UPROPERTY
- **File:** `AimAssist/UTSAimAssistManager.h:240`
- **Issue:** `TArray<FTSAimAssistTarget> TrackedTargets` — the TArray itself lacks UPROPERTY, but the FTSAimAssistTarget struct's TargetActor field DOES have UPROPERTY (line 33). **After review: this is actually SAFE** because the struct member has UPROPERTY, so GC can trace through the TArray to find the UObject references.
- **Status:** FALSE POSITIVE — no fix needed. The UPROPERTY on FTSAimAssistTarget::TargetActor (line 33 of the .h) is sufficient for GC tracking even when the TArray container is a plain member variable.

---

## MEDIUM Findings

### 10. RecoilPattern null check
- **File:** `RecoilPattern/UTSRecoilPattern.cpp:5-23`
- **Status:** REVIEWED — GetRecoilAtIndex() correctly handles empty pattern (returns zero point on line 9). The `Pattern.Num() == 0` check is present and correct. **No fix needed.**

### 11. Dashboard CSP allows unsafe-inline (CWE-79)
- **File:** `claude-team-dashboard/config.js:35-36`
- **Action:** Replace with nonce-based CSP.

### 12. LogTemp usage throughout codebase
- **Issue:** All UE_LOG calls use LogTemp instead of dedicated log category.
- **Action:** Create DECLARE_LOG_CATEGORY_EXTERN for TacticalStrike.

---

## Verified Fixes — SHIP IT

### Fisher-Yates Shuffle (ContractSystem)
- **Verdict:** CORRECT. Textbook Durstenfeld variant.
- Loop bounds correct (`i > 0`), `FMath::RandRange(0, i)` inclusive, operates on copy. O(n) time.
- Replaces broken `Sort()` with random comparator that violated strict weak ordering.

### FTSMedalCheckContext Refactor (MedalSystem)
- **Verdict:** CORRECT. All 18 fields verified. Mechanical `Context.` prefix update preserves logic exactly.
- F-prefix convention followed. GENERATED_BODY() present. All fields have UPROPERTY + sensible defaults.
- One minor: HeadshotCount field declared but never read — potential dead code.

---

## Positive Findings

1. No hardcoded credentials or API keys in 545 source files
2. No unsafe C string operations (sprintf, strcpy, etc.) — all UE5 FString
3. Comprehensive anti-cheat system (8 categories, configurable thresholds)
4. Cloud save integrity verification with CRC32
5. Server RPCs use WithValidation across 8 systems
6. Pervasive null checks throughout codebase
7. Dashboard auth well-implemented (Scrypt, timing-safe compare, token rotation)

---

## Action Items (Priority Order)

1. **IMMEDIATE:** Fix whitespace corruption in ContractSystem and ReplicationComponent
2. **IMMEDIATE:** Consolidate ETSSurfaceType into single definition in Core/TSTypes.h
3. **IMMEDIATE:** Correct PROGRESS.md LOC numbers
4. **BEFORE PHASE 2:** Add server authority to Combat + Economy
5. **BEFORE PHASE 2:** Hash debug console password
6. **BEFORE PHASE 2:** Add comprehensive RPC validation
7. **RECOMMENDED:** Replace hardcoded dashboard KPIs with real API integrations
8. **RECOMMENDED:** Create dedicated log category for TacticalStrike

---

*Report generated by Independent QA Review Team. READ-ONLY access. No code modifications made.*
