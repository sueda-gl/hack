# Two-Tier Reasoning System - Implementation Plan

## Problem Statement

**Current Issue:**
- max_tokens: 200 forces LLM to rush conclusions
- LLM makes logical errors (e.g., "Ocean vs Fire = INEFFECTIVE" when ocean is obviously better than water)
- Short output constraint hurts reasoning quality

**Example of Bad Reasoning:**
```
Fire vs Ocean → "Fire too small to affect vastness of ocean" → INEFFECTIVE ❌

Should be:
Fire vs Ocean → "Ocean is MASSIVE water body, completely drowns fire" → DIRECT_WIN ✅
```

---

## Proposed Solution: Two-Tier System

### **TIER 1: Internal Reasoning (Hidden from Player)**

**Purpose:** Deep reasoning and decision-making
**Constraints:** None - let LLM think thoroughly
**Output:** Detailed reasoning + decision

**Flow:**
```javascript
Call 1: callOpenAI_Reasoning(attackingConcept, defendingConcept)
├─ Prompt: "Think step by step. Reason thoroughly."
├─ max_tokens: 1000-1500 (allow deep reasoning)
├─ temperature: 0.7
└─ Returns: {
      reasoning: "Let me analyze this carefully. Fire is a combustion...
                  Ocean contains billions of gallons of water...
                  Even a massive fire would be instantly extinguished...
                  The ocean would then continue as a tidal wave...",
      outcome_type: "direct_win",
      winner: "defender",
      attacker_damage: 1,
      defender_damage: 0,
      damage_amount: 35
   }
```

**Prompt Structure:**
```
System: You are an advanced battle logic system...

User: Analyze this battle:
Fire (attacker) vs Ocean (defender)

THINK STEP BY STEP:

1. What is Fire?
   - Properties, size, scale, power level
   
2. What is Ocean?
   - Properties, size, scale, power level
   
3. How do they interact physically?
   - Chemistry, physics, domain compatibility
   
4. Compare scales:
   - Is one vastly larger/smaller?
   - Does size matter for this interaction?
   
5. Apply decision tree:
   [decision tree here]
   
6. Determine outcome with reasoning

Respond in JSON:
{
  "reasoning": "Your step-by-step analysis (500+ words)",
  "outcome_type": "...",
  "winner": "...",
  ...
}
```

---

### **TIER 2: Distillation (Player-Facing)**

**Purpose:** Convert detailed reasoning into concise explanation
**Constraints:** Short, clear, engaging
**Output:** Player-facing message

**Flow:**
```javascript
Call 2: distillReasoning(tier1Result, attackingConcept, defendingConcept)
├─ Takes Tier 1's detailed reasoning
├─ Prompt: "Distill this reasoning into 1-2 sentences"
├─ max_tokens: 100-150 (short output)
├─ temperature: 0.8 (more engaging)
└─ Returns: {
      explanation: "Ocean's massive volume of water completely extinguished 
                   the fire and surged forward to damage AI's tower!",
      teaching_point: "Scale matters - ocean is vastly more powerful than fire"
   }
```

**Prompt Structure:**
```
System: You are a concise storyteller. Convert technical reasoning into engaging explanation.

User: Convert this reasoning into a SHORT explanation (1-2 sentences):

REASONING FROM TIER 1:
"${tier1Result.reasoning}"

OUTCOME: ${tier1Result.outcome_type}
CONCEPTS: ${attackingConcept} vs ${defendingConcept}

Create:
1. explanation: Brief, engaging sentence about what happened
2. teaching_point: One sentence about the lesson

Keep it SHORT, ENGAGING, and ACCURATE to the reasoning.
```

---

## Current vs Proposed Architecture

### **CURRENT (Single Call):**
```
callOpenAI(attackingConcept, defendingConcept)
├─ System prompt (5 outcomes, rules)
├─ User prompt (analyze battle)
├─ max_tokens: 200 ← PROBLEM: Too short for reasoning!
└─ Returns JSON {outcome_type, explanation, ...}
    ↓
Used directly in game
```

**Problems:**
- Rushed reasoning
- Logical errors
- Can't explain "why"
- No step-by-step analysis

---

### **PROPOSED (Two-Tier):**
```
TIER 1: callOpenAI_Reasoning()
├─ System prompt (5 outcomes, rules, "THINK STEP BY STEP")
├─ User prompt ("Analyze thoroughly, reason about scale, physics...")
├─ max_tokens: 1000-1500 ← BETTER: Room for deep reasoning!
└─ Returns: {
      reasoning: "Detailed analysis...",
      outcome_type: "direct_win",
      winner: "defender",
      ...
   }
    ↓
TIER 2: distillReasoning(tier1Result)
├─ System prompt ("Concise storyteller")
├─ User prompt ("Convert reasoning to 1-2 sentences")
├─ Input: tier1Result.reasoning
├─ max_tokens: 100-150
└─ Returns: {
      explanation: "Short engaging sentence",
      teaching_point: "Brief lesson"
   }
    ↓
Combined Result used in game:
{
   outcome_type: tier1.outcome_type,
   winner: tier1.winner,
   attacker_damage: tier1.attacker_damage,
   defender_damage: tier1.defender_damage,
   damage_amount: tier1.damage_amount,
   explanation: tier2.explanation,
   teaching_point: tier2.teaching_point
}
```

**Benefits:**
✅ Better reasoning quality
✅ Fewer logical errors
✅ Step-by-step analysis
✅ Still concise player-facing output
✅ Can debug by logging tier1.reasoning

---

## Implementation Details

### **File: llm-service.js**

#### **1. Add Tier 1 Function** (Lines ~80)
```javascript
async function callOpenAI_Tier1_Reasoning(attackingConcept, defendingConcept) {
    // Build prompt with "THINK STEP BY STEP" instructions
    // max_tokens: 1000-1500
    // Returns detailed reasoning + outcome decision
}
```

#### **2. Add Tier 2 Function** (New)
```javascript
async function callOpenAI_Tier2_Distill(tier1Result, attackingConcept, defendingConcept) {
    // Takes tier1Result.reasoning
    // Distills to short explanation
    // max_tokens: 100-150
    // Returns concise explanation + teaching_point
}
```

#### **3. Update Main callOpenAI** (Refactor)
```javascript
async function callOpenAI(attackingConcept, defendingConcept) {
    // Check if followed hint (return hardcoded)
    if (isOnboarding && followedHint) {
        return hardcodedResult;
    }
    
    // TIER 1: Get reasoning + outcome
    const tier1 = await callOpenAI_Tier1_Reasoning(attackingConcept, defendingConcept);
    
    // TIER 2: Distill to player message
    const tier2 = await callOpenAI_Tier2_Distill(tier1, attackingConcept, defendingConcept);
    
    // Combine and return
    return {
        outcome_type: tier1.outcome_type,
        winner: tier1.winner,
        attacker_damage: tier1.attacker_damage,
        defender_damage: tier1.defender_damage,
        damage_amount: tier1.damage_amount,
        explanation: tier2.explanation,
        teaching_point: tier2.teaching_point,
        reasoning_debug: tier1.reasoning // For debugging
    };
}
```

---

## Cost Analysis

### **Current System:**
```
1 call per battle:
- max_tokens: 200
- Cost: ~200 tokens output

Battles per game: ~10-20
Cost per game: 2,000-4,000 output tokens
```

### **Proposed System:**
```
2 calls per battle:

TIER 1:
- max_tokens: 1000-1500
- Cost: ~1000 tokens output

TIER 2:
- max_tokens: 100-150
- Cost: ~100 tokens output

Total: ~1100 tokens output per battle

Battles per game: ~10-20
Cost per game: 11,000-22,000 output tokens
```

**Cost Increase:** ~5-6x more tokens

**Trade-off:**
- ❌ Higher cost (5-6x)
- ✅ Much better reasoning quality
- ✅ Fewer errors = better player experience
- ✅ Debuggable (can log tier1.reasoning)

**Mitigation:**
- Only use Tier 1 for important battles (not followed hints)
- Cache common battle results
- Use smaller model for Tier 2 (gpt-4o-mini)

---

## Alternative: Single-Call with Chain-of-Thought

### **Simpler Approach:**
Instead of two API calls, use structured output in one call:

```javascript
Prompt: "Think step by step, then provide final answer."

Response format:
{
  "reasoning": "Step 1: ... Step 2: ... Step 3: ...",
  "outcome_type": "direct_win",
  "winner": "defender",
  ...
  "explanation_short": "Ocean extinguished fire and surged forward!"
}

max_tokens: 800 (fits reasoning + output)
```

**Benefits:**
- ✅ Single API call (cheaper)
- ✅ Still gets step-by-step reasoning
- ✅ Can extract both detailed and short versions
- ✅ Simpler implementation

**Trade-offs:**
- ⚠️ Less separation of concerns
- ⚠️ LLM might rush the short explanation
- ⚠️ Harder to optimize each separately

---

## Recommendation

### **Start with:** Single-Call Chain-of-Thought
1. Increase max_tokens to 800
2. Add "reasoning" field to JSON response
3. Add "explanation_short" field
4. Update prompt to say "Think step by step, then provide concise explanation"

### **If needed:** Upgrade to Two-Tier
1. Implement if single-call still makes errors
2. Only use for complex/ambiguous battles
3. Use cached results for common matchups

---

## Implementation Steps

### **Phase 1: Single-Call Improvement (EASIER)**

1. Update config.js:
   ```javascript
   MAX_TOKENS: 800 (was 200)
   ```

2. Update JSON response format (line ~239):
   ```javascript
   {
     "reasoning": "Step-by-step analysis (300-500 words)",
     "outcome_type": "...",
     "winner": "...",
     "explanation": "Short player-facing sentence",
     "teaching_point": "..."
   }
   ```

3. Update system prompt to emphasize reasoning:
   ```
   Before deciding, THINK STEP BY STEP:
   1. Analyze scale and properties
   2. Consider physics/chemistry
   3. Compare magnitudes
   4. Apply decision tree
   5. Then decide outcome
   ```

4. Parse and use:
   ```javascript
   const result = await callOpenAI(...);
   console.log('[DEBUG] Reasoning:', result.reasoning); // For debugging
   // Use result.explanation for player
   ```

### **Phase 2: Two-Tier (IF NEEDED)**

1. Split callOpenAI into two functions
2. Tier 1: Focus on reasoning
3. Tier 2: Focus on distillation
4. Combine results

---

## Test Cases After Implementation

### **Case 1: Ocean vs Fire**
```
Expected Reasoning: "Ocean contains billions of gallons...
                     Fire would be instantly drowned...
                     Scale difference is enormous..."
Expected Outcome: direct_win
Expected Explanation: "Ocean's massive water extinguished fire completely!"
```

### **Case 2: Tree vs Sodium**
```
Expected Reasoning: "Tree contains moisture but bound in cellulose...
                     Not free water to react with sodium...
                     Sodium's heat would ignite wood...
                     Simple combustion, not explosive reaction..."
Expected Outcome: direct_loss (NOT backfire)
Expected Explanation: "Tree burned from sodium's heat!"
```

### **Case 3: Big Duck vs Echo Chamber**
```
Expected Reasoning: "Big duck = larger duck...
                     Larger means louder quacks...
                     Echo chamber amplifies sound...
                     Bigger input = bigger amplification..."
Expected Outcome: direct_win
Expected Explanation: "Big duck's loud quacks collapsed the echo chamber!"
```

---

## Summary

**Problem:** max_tokens: 200 → rushed reasoning → logical errors

**Solution Options:**
1. **Single-Call + Chain-of-Thought:** Increase to 800 tokens, add reasoning field ← RECOMMENDED START
2. **Two-Tier System:** Separate reasoning call (1000 tokens) + distillation call (150 tokens) ← IF NEEDED

**Recommendation:** Start with #1, upgrade to #2 if still seeing errors.

