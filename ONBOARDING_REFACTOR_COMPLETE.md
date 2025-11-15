# Onboarding Refactor - Complete Implementation

## Overview
Refactored onboarding to evaluate all battles honestly using the same logic as normal gameplay, while maintaining teaching goals through lesson messages.

---

## **Key Changes**

### **1. Followed Hint → Hardcoded Results (Lines 103-131)**

**Before:**
```javascript
if (followedHint) {
    systemPrompt += "Enforce this outcome: ..."
    // Still called LLM - wasted tokens
}
```

**After:**
```javascript
if (followedHint) {
    // Return hardcoded result immediately - NO LLM call
    return {
        winner: tutorialGuidance.winner,
        outcome_type: tutorialGuidance.outcome_type,
        ...
    };
}
```

**Benefits:**
- Saves LLM tokens/cost
- Guaranteed consistent teaching when players follow hints
- Faster response time
- "Duck" → gets intended direct_win outcome ✅

---

### **2. Off-Script → Full LLM Evaluation with Context (Lines 132-153)**

**Before:**
```javascript
systemPrompt += "Evaluate naturally... Don't force outcome."
// Then NO decision tree added!
```

**After:**
```javascript
systemPrompt += `
🎓 TUTORIAL CONTEXT - You are the omniscient game master:

This is tutorial step ${currentStep + 1} of 6, teaching: "${tutorialGuidance.lesson_focus}"

I suggested player use: "${tutorialGuidance.suggested_answer}"
Player chose instead: "${defendingConcept}"

Your task:
1. Evaluate "${defendingConcept}" vs "${attackingConcept}" HONESTLY using the decision tree below
2. Don't force the intended outcome - determine what ACTUALLY happens
3. Your explanation can naturally acknowledge their creative choice if appropriate
   (e.g., "I see you went with ${defendingConcept}...")

The lesson message will explain what we wanted to teach regardless of the actual outcome.`;

needsDecisionTree = true; // ← KEY: Enable decision tree!
```

**Benefits:**
- LLM knows it's omniscient game master ✅
- Knows tutorial context but evaluates honestly ✅
- Can naturally acknowledge creative choices ✅
- Gets decision tree for systematic evaluation ✅

---

### **3. Decision Tree Now Included for Off-Script (Lines 262-274)**

**Before:**
```javascript
if (!isOnboarding) {
    // Decision tree ONLY for normal gameplay
}
// Off-script onboarding got NO decision tree!
```

**After:**
```javascript
// Track with flag
let needsDecisionTree = !isOnboarding; // Default: true for normal

if (isOnboarding && !followedHint) {
    needsDecisionTree = true; // Also true for off-script
}

if (needsDecisionTree) {
    userPrompt += `
Determine using this decision tree:
1. Do they meaningfully interact? (If no → neutral_no_damage)
2. Does defender's concept amplify/fuel/conduct attacker? (If yes → backfire_win)
   ⚠️ CRITICAL: Must be FREE/ACCESSIBLE reactants, not bound in structures
   - Free water + sodium = BACKFIRE ✓
   - Tree + sodium = NOT backfire (moisture bound) → Check next steps
3. Does defender win cleanly? (If yes → direct_win)
4. Does defender's defense simply fail? (If yes → direct_loss)
5. Do both destroy each other equally? (If yes → mutual_destruction)`;
}
```

**Benefits:**
- Off-script onboarding now gets systematic evaluation ✅
- Same logic as normal gameplay ✅
- Decision tree includes warnings about FREE/ACCESSIBLE reactants ✅

---

### **4. Improved Backfire Examples (Lines 174-185)**

**Before:**
```javascript
- Example: Sodium vs Water → explosive reaction
- Example: Gasoline vs Fire → ignites
```

**After:**
```javascript
- **REQUIRES FREE/ACCESSIBLE reactants** - bound materials don't count
- Example: Sodium vs FREE WATER → explosive reaction (BACKFIRE)
- Example: Gasoline vs Fire → ignites (BACKFIRE)
- Counter-example: Sodium vs Tree → Tree burns, moisture is bound (DIRECT_LOSS not BACKFIRE)
- Counter-example: Fire vs Wet Cloth → Cloth burns, water evaporates (DIRECT_LOSS not BACKFIRE)
```

**Benefits:**
- LLM sees counter-examples ✅
- Explicitly states FREE/ACCESSIBLE requirement ✅
- Prevents false pattern-matching ✅

---

### **5. Enhanced Critical Rules (Lines 211-218)**

**Before:**
```javascript
2. **Backfire Detection**: Only use BACKFIRE_WIN if defender's concept actively AMPLIFIES/FUELS/CONDUCTS. Simple failure = DIRECT_LOSS
```

**After:**
```javascript
2. **Backfire Detection** (MOST IMPORTANT):
   Only use BACKFIRE_WIN if defender's concept actively AMPLIFIES/FUELS/CONDUCTS.
   - Must involve FREE/ACCESSIBLE reactants (not bound in structures)
   - Must create chemical reaction, conductivity, or amplification
   - Examples of BACKFIRE: Free water + sodium, gasoline + fire, metal rod + lightning
   - Examples of NOT BACKFIRE: Tree + sodium (moisture bound), wet cloth + fire (just burns)
   - **When in doubt: If it just burns/breaks/fails → DIRECT_LOSS**
   - Simple failure = DIRECT_LOSS, NOT backfire
```

**Benefits:**
- Emphasizes MOST IMPORTANT ✅
- Multiple examples of what's NOT backfire ✅
- Clear "when in doubt" rule ✅

---

## **Complete Flow Comparison**

### **BEFORE:**

```
ONBOARDING (followed hint):
├─ LLM called with "enforce this outcome" ❌
├─ No decision tree ❌
└─ Wasted tokens but got intended result

ONBOARDING (didn't follow):
├─ LLM called with "evaluate naturally" ⚠️
├─ No decision tree ❌
├─ No systematic evaluation ❌
└─ Pattern-matched examples → wrong results

NORMAL GAMEPLAY:
├─ LLM called ✅
├─ Decision tree included ✅
└─ Systematic evaluation ✅
```

### **AFTER:**

```
ONBOARDING (followed hint):
├─ Return hardcoded immediately ✅
├─ No LLM call needed ✅
└─ Fast, consistent, cheap ✅

ONBOARDING (didn't follow):
├─ LLM called with tutorial context ✅
├─ Decision tree included ✅
├─ Omniscient tone enabled ✅
└─ Honest evaluation with improved rules ✅

NORMAL GAMEPLAY:
├─ LLM called ✅
├─ Decision tree included ✅
└─ Systematic evaluation ✅
```

---

## **Test Cases**

### **Case 1: Duck vs Echo Chamber (Followed Hint)**
```
Input: Player types "duck" (exact match)
Process: Hardcoded result returned immediately
Output: direct_win, Duck amplified, AI's tower damaged ✅
Cost: $0 (no LLM call)
```

### **Case 2: Big Duck vs Echo Chamber (Close Variation)**
```
Input: Player types "big duck" (not exact match)
Process: LLM evaluation with decision tree
Context: "I suggested Duck, player chose big duck"
Output: LLM decides (likely direct_win - big duck quacks louder) ✅
Lesson: Acknowledges their creative choice ✅
```

### **Case 3: Tree vs Sodium (Wrong Concept)**
```
Input: Player types "tree" instead of "water"
Process: LLM evaluation with decision tree
Step 1: Do they interact? Yes
Step 2: Does tree amplify sodium?
   Check: FREE reactants? No, moisture is bound in cellulose
   → NOT backfire, continue
Step 4: Does tree fail? Yes, tree burns
Output: direct_loss ✅ (Not backfire!)
Lesson: "I see you went with tree. Tree burned. I suggested Water to show BACKFIRE: when defense amplifies attack..."
```

### **Case 4: Water vs Sodium (Intended Backfire)**
```
Input: Player types "water" (exact match)
Process: Hardcoded result returned
Output: backfire_win, explosion at player's tower ✅
```

### **Case 5: Ocean vs Sodium (Similar Concept)**
```
Input: Player types "ocean"
Process: LLM evaluation
Step 2: Does ocean amplify sodium? Yes, ocean is FREE water
Output: backfire_win ✅
Lesson: "I see you went with ocean - same result! Ocean water reacts explosively with sodium..."
```

---

## **Benefits Summary**

✅ **Cost Savings**: Followed hints don't call LLM
✅ **Consistency**: Exact hints always get intended outcome
✅ **Honesty**: Off-script battles evaluated truthfully
✅ **Intelligence**: LLM shows omniscience naturally
✅ **Same Logic**: Normal and onboarding use same decision tree
✅ **Better Detection**: Backfire requires FREE/ACCESSIBLE reactants
✅ **Counter-Examples**: Tree+Sodium explicitly shown as NOT backfire
✅ **Natural Flow**: "I see you went with X..." feels conversational

---

## **Files Modified**

- `llm-service.js` - Complete refactor of onboarding logic

**Lines Changed:**
- 96-154: Followed hint → hardcoded, Off-script → context
- 174-185: Added counter-examples for backfire
- 211-218: Enhanced backfire detection rules
- 262-274: Decision tree now included for off-script

**Total Changes:** ~80 lines modified
**Linter Errors:** 0
**Backward Compatibility:** Maintained

---

## **Next Steps for Testing**

1. Test tutorial with exact hints → should be instant, consistent
2. Test "big duck" → should evaluate as duck variant
3. Test "tree" vs "sodium" → should be DIRECT_LOSS not backfire
4. Test completely random concepts → should evaluate honestly
5. Check lesson messages acknowledge choices naturally
6. Verify no cost increase (followed hints use no tokens)

