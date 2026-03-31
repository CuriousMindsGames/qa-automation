# Security Audit: TacticalStrike Full Codebase

**Auditor:** security-auditor (Opus)
**Date:** 2026-04-01
**Scope:** All systems in Source/TacticalStrike/, focus on waves 100-106

---

## Threat Level: MEDIUM
## Vulnerabilities Found: 14

---

### Summary

The codebase is in Month 1 single-player mode with explicit Phase 2 annotations for multiplayer hardening. The architecture is well-structured with clear component separation. However, several design decisions made under the single-player only assumption create structural security debt that will become exploitable the moment multiplayer ships.

---

## Findings

### 1. [SEVERITY: High] [CWE-602] Core Gameplay Components Not Replicated

Files: UTSHealthComponent.cpp:9, UTSCombatComponent.cpp:13, UTSWeaponComponent.cpp:13, ATSWeaponBase.cpp:23

Health, combat, weapon state, and ammo are not replicated. Every gameplay-critical value exists exclusively on the local machine. The damage pipeline runs entirely locally with no server authority check. Before Phase 2 MP, refactor so ApplyDamage() checks HasAuthority(), weapons send Server RPCs, and health/ammo use DOREPLIFETIME with COND_OwnerOnly.

### 2. [SEVERITY: High] [CWE-345] Client-Trusted Hit Detection

File: ATSWeaponBase.cpp:180-292

FireShot() performs line trace and directly calls ApplyDamage(). No server-side validation, no lag compensation. Fix: Server RPC pattern for all fire actions.

### 3. [SEVERITY: High] [CWE-862] Economy Lacks Authority Checks

File: UTSEconomyComponent.h:59-100

AddMoney(), SpendMoney() etc. are BlueprintCallable with no authority gating. Fix: HasAuthority() checks and COND_OwnerOnly replication.

### 4. [SEVERITY: Medium] [CWE-798] Debug Console Password in Plaintext

File: UTSDebugConsoleManager.h:286-287

AuthPassword is BlueprintReadWrite plaintext. Fix: hash, rate limit, remove Blueprint exposure.

### 5. [SEVERITY: Medium] [CWE-863] Debug Commands Not Auth-Gated

File: UTSDebugConsoleManager.cpp:530-538

All 20 commands have bRequiresAuth = false. Fix: enable auth for state-mutating commands.

### 6. [SEVERITY: Medium] [CWE-284] FTSDamageData BlueprintReadWrite on DamageAmount

File: FTSDamageData.h:63-67

DamageAmount, ArmorPenetration, bIsHeadshot all BlueprintReadWrite. Fix: change to BlueprintReadOnly.

### 7. [SEVERITY: Medium] [CWE-284] Anti-Cheat Thresholds BlueprintReadWrite

File: UTSAntiCheatManager.h:332-417

All thresholds client-modifiable. Fix: EditDefaultsOnly, BlueprintReadOnly.

### 8. [SEVERITY: Medium] [CWE-862] No COND_OwnerOnly on Replicated Data

All DOREPLIFETIME calls use default (all clients). Zero COND_OwnerOnly usage. Fix: audit all replication conditions.

### 9. [SEVERITY: Medium] [CWE-862] Emote RPCs Missing WithValidation

File: UTSEmoteSystemManager.h:536-544

Fix: add WithValidation with range/proximity/rate checks.

### 10. [SEVERITY: Low] [CWE-200] NetworkConfig Exposes Tick Rate

File: FTSNetworkData.h:128-143. Fix: BlueprintReadOnly.

### 11. [SEVERITY: Low] [CWE-400] AimHistory Array Unbounded

File: UTSAntiCheatManager.h:111. Fix: pre-allocate and hard cap.

### 12. [SEVERITY: Low] [CWE-200] Session Password Plaintext

File: UTSSessionManagerSystem.h:49. Fix: use hash.

### 13. [SEVERITY: Low] [CWE-200] Server IP Exposed

File: FTSNetworkData.h:57. Fix: use session IDs.

### 14. [SEVERITY: Info] Good TWeakObjectPtr Usage -- POSITIVE

Consistent memory safety discipline. No dangling pointer risks.

---

## Checklist

| Category | Status | Notes |
|---|---|---|
| Server Authority | FAIL | All gameplay state client-local |
| Anti-Cheat | PARTIAL | Exists but thresholds client-modifiable |
| Data Protection | FAIL | No COND_OwnerOnly, plaintext passwords |
| Input Validation | PASS | Good ClampMin/ClampMax usage |
| Network Security | PARTIAL | Some RPCs have WithValidation |
| Memory Safety | PASS | TWeakObjectPtr, null checks consistent |
| Credentials | FAIL | Plaintext passwords |

---

## Verdict: CONDITIONAL

Month 1 single-player: SHIP with fixes 4, 5, 7.
Phase 2 multiplayer: BLOCK until fixes 1, 2, 3, 6, 8, 9.

### Priority Fixes

| Priority | Finding | Effort |
|---|---|---|
| P0 | 1 Server-authoritative health/combat/weapons | Large |
| P0 | 2 Server-side hit detection | Large |
| P0 | 3 Server-authoritative economy | Medium |
| P1 | 8 COND_OwnerOnly everywhere | Medium |
| P1 | 6 Lock FTSDamageData fields | Small |
| P1 | 9 WithValidation on all RPCs | Small |
| P1 | 7 Lock anti-cheat thresholds | Small |
| P2 | 4 Debug password hashing | Small |
| P2 | 5 Auth-gate debug commands | Small |
| P2 | 10 Lock network config | Small |
| P2 | 12-13 Session/IP hardening | Medium |

---

*Report by security-auditor. READ-ONLY access. No code modified.*
