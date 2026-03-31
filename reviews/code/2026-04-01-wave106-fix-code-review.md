# QA Code Review Report -- Commit da14e68

**Reviewer:** Independent Code Reviewer (code-reviewer agent)
**Date:** 2026-04-01
**Commit:** `da14e68` -- "fix: Fisher-Yates shuffle + refactor CheckForMedals to struct param"
**Repository:** `C:\Users\aakas\Workspace\TacticalStrike`
**Scope:** Targeted fix responding to Wave 106 QA findings

---

## TSContractSystemManager.cpp -- PASS (with minor residual notes)

### Fix Assessment: Fisher-Yates Shuffle

The original code used a broken `Sort()` with a random comparator (`FMath::RandHelper(2) == 0`), which produces non-uniform distributions and violates the strict weak ordering requirement of `Sort()`, causing undefined behavior.

**The fix is correct.** The replacement implements textbook Fisher-Yates (Durstenfeld variant):

```cpp
for (int32 i = ShuffledPool.Num() - 1; i > 0; --i)
{
    const int32 j = FMath::RandRange(0, i);
    ShuffledPool.Swap(i, j);
}
```

- Loop bounds: correct (`i > 0`, not `i >= 0` -- swapping element 0 with itself is a no-op).
- `FMath::RandRange(0, i)`: inclusive on both ends in UE5, producing uniform `[0, i]`. Correct.
- `ShuffledPool.Swap(i, j)`: uses TArray's built-in swap. Correct.
- Operates on a copy of `ContractPool`, leaving the original untouched. Correct.
- O(n) time, O(1) extra space (beyond the copy). Optimal.

No new issues introduced by this change.

### Residual Issues (carried over from Wave 106, NOT introduced by this fix)

1. **[Minor] LogTemp usage** -- all `UE_LOG` calls use `LogTemp` instead of dedicated category
2. **[Minor] Save/Load stubs** -- `SaveContracts`, `LoadContracts` are placeholder
3. **[Minor] No authority check** -- `AcceptContract`, `AbandonContract`, `ClaimReward`, `UpdateProgress` are `BlueprintCallable` with no `HasAuthority()` guard
4. **[Minor] `GetActiveContracts()` returns TArray by value** -- copies entire array

### Score: 8/10

---

## TSMedalSystemManager.h -- PASS

### Fix Assessment: FTSMedalCheckContext Struct

**The refactoring is correct and well-executed.**

- `FTSMedalCheckContext` uses `FTS` prefix (F for struct, TS for TacticalStrike). Follows UE5 conventions.
- `GENERATED_BODY()` macro present. Correct.
- All fields have `UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Medal Check")`. Fully Blueprint-accessible.
- All fields have sensible defaults. Callers only need to set relevant fields. Good API design.
- `CheckForMedals` now takes `const FTSMedalCheckContext&`. Correct and efficient.

### Issues Found

1. **[Minor] `HeadshotCount` field declared but never read** in CheckForMedals
2. **[Minor] `GetMatchMedals()` returns TArray by value** -- should return const ref
3. **[Minor] `GetMedalDefinition` returns raw pointer from BlueprintPure** -- not Blueprint-compatible
4. **[Minor] `#include "Net/UnrealNetwork.h"` in header** -- only needed in .cpp
5. **[Minor] `#include "Engine/Texture2D.h"` in header** -- forward declaration suffices

### Score: 7.5/10

---

## TSMedalSystemManager.cpp -- PASS

### Fix Assessment: CheckForMedals Refactored Body

Mechanical update: all field accesses map correctly from bare parameter names to `Context.` prefix. All 18 fields verified. No logic changed.

### Issues Found

1. **[Minor] LogTemp usage throughout**
2. **[Minor] Save/Load stubs are placeholder**
3. **[Minor] No authority check on `CheckForMedals` or `AwardMedal`** -- cheat vector
4. **[Minor] `HeadshotCount` passed via Context but never consumed**
5. **[Minor] MultiKill (>=3) overlaps with Ace (>=5)** -- verify design intent

### Score: 7.5/10

---

## New Issues Introduced by This Commit

**None.** The fix is clean and surgical.

---

## Verdict: SHIP IT

The targeted fixes are correct, well-implemented, and introduce no regressions. The Fisher-Yates shuffle is textbook. The struct refactoring preserves all original logic exactly. Remaining issues are pre-existing technical debt tracked separately.
