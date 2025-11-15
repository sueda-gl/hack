# Onboarding Logic Fixes

## Problems Fixed

### 1. **Logic Violation - Forcing Wrong Outcomes**
**Problem:** When player typed "Tree" against "Fire", the system forced a DIRECT WIN outcome, claiming the tree resisted fire and damaged the opponent. This is physically impossible - trees burn.

**Root Cause:** The system was enforcing tutorial outcome types regardless of actual concept interactions.

**Solution:** 
- **If player follows hint:** Enforce the intended outcome (to ensure consistent teaching)
- **If player goes off-script:** Let LLM evaluate naturally and logically
  - Tree vs Fire → Fire wins (tree burns)
  - Then lesson explains: "That didn't work out. I suggested Water to show DIRECT WIN: when your defense neutralizes the attack AND continues forward..."

### 2. **Overly Long Prompts & Responses**
**Problem:** Lesson messages were verbose, reaching 300+ tokens with unnecessary elaboration.

**Solution:**
- Reduced system prompt to: "You are a concise game tutorial instructor. Write SHORT, clear lessons (2-3 sentences max)."
- Simplified user prompts dramatically
- Reduced max_tokens from 500 → 200
- Lessons now 2-4 sentences instead of paragraphs

### 3. **Scope Error with `result` variable**
**Problem:** `ReferenceError: result is not defined` - the battle result was declared inside try block but accessed in finally block.

**Solution:** Declared `result` and `reasoningPromise` outside try block at function scope.

## New Flow

### When Player Follows Hint (e.g., types "Water" for Fire)
```
1. LLM enforces tutorial outcome (DIRECT WIN)
2. Battle shows: Water extinguishes fire, flows forward, damages AI tower
3. Lesson: "✅ YOU LEARNED: DIRECT WIN
   Water extinguished the fire and continued forward to damage the tower. 
   This is a direct win: your defense neutralizes AND strikes back."
```

### When Player Goes Off-Script (e.g., types "Tree" for Fire)
```
1. LLM evaluates naturally (Fire wins - tree burns)
2. Battle shows: Fire burns the tree, reaches player tower
3. Lesson: "💥 YOU LEARNED: [what actually happened]
   Your tree burned. I suggested Water to demonstrate DIRECT WIN: 
   when defense neutralizes the attack AND continues forward to damage opponent."
```

## Code Changes

### `llm-service.js` - Battle Evaluation
```javascript
if (isOnboarding) {
    if (followedHint) {
        // Enforce tutorial outcome for consistent teaching
        systemPrompt += `
🎓 TUTORIAL MODE: Player followed hint. Enforce this outcome:
- outcome_type: ${tutorialGuidance.outcome_type}
- winner: ${tutorialGuidance.winner}
...`;
    } else {
        // Evaluate naturally - don't force outcomes
        systemPrompt += `
🎓 TUTORIAL MODE: Player used "${defendingConcept}" instead of "${suggested}".
Evaluate NATURALLY and LOGICALLY. Don't force an outcome.`;
    }
}
```

### `llm-service.js` - Lesson Generation
```javascript
if (followedHint) {
    // Simple congratulatory message (2-3 sentences)
    userPrompt = `Write SHORT lesson:
    What happened: ${explanation}
    Teach: ${lesson_focus}`;
} else {
    // Acknowledge their choice, explain what would've happened
    userPrompt = `Player used "${their_choice}" not "${suggested}".
    What happened: ${explanation}
    
    1. Acknowledge their outcome
    2. Explain what ${suggested} would've done
    3. State the intended mechanic`;
}
```

### `battle-controller.js`
```javascript
// Declare variables at function scope (not in try block)
let reasoningPromise = null;
let result = null;

try {
    result = await callOpenAI(attackingConcept, defendingConcept);
    // ... battle logic
} finally {
    // Can now safely access result here
    if (result) {
        lessonMessage = await generateLessonMessage(..., result);
    }
}
```

## Benefits

1. **Logically Consistent:** Fire burns trees, water extinguishes fire - follows real-world physics
2. **Still Educational:** Even wrong answers teach the intended mechanic
3. **Feels Intelligent:** Game acknowledges player creativity while maintaining teaching goals
4. **Concise:** Lessons are 2-4 sentences, not paragraphs
5. **Token Efficient:** Reduced from 500 → 200 max tokens for lessons
6. **No Crashes:** Fixed scope error that caused ReferenceError

## Example Scenarios

### Scenario 1: Follow Hint
- **Hint:** "Try WATER"
- **Player types:** "water"
- **Result:** Direct Win (Water extinguishes fire, damages tower)
- **Lesson:** "✅ Direct Win! Water put out the fire and flowed forward. This is when your defense wins AND damages their tower."

### Scenario 2: Creative but Valid
- **Hint:** "Try WATER"  
- **Player types:** "Ocean"
- **Result:** Direct Win (Ocean water works similarly)
- **Lesson:** "✅ Direct Win! Ocean water drowned the flames. This is when defense neutralizes and continues forward."

### Scenario 3: Off-Script Invalid
- **Hint:** "Try WATER"
- **Player types:** "Tree"
- **Result:** Attacker Wins (Tree burns)
- **Lesson:** "💥 Your tree burned in the flames. I suggested Water to show DIRECT WIN: when your defense stops the attack AND continues to damage their tower. Trees can't stop fire!"

### Scenario 4: Completely Random
- **Hint:** "Try WATER"
- **Player types:** "Pizza"
- **Result:** Probably Attacker Wins (Pizza burns)
- **Lesson:** "🔥 Pizza can't stop fire! I suggested Water for DIRECT WIN: a defense that neutralizes AND pushes forward to damage the opponent."

## Testing Checklist

For each tutorial step:
- [ ] Type suggested answer → Should get enforced tutorial outcome
- [ ] Type similar concept → Should evaluate naturally (might match tutorial or not)
- [ ] Type opposite concept → Should lose naturally
- [ ] Type random concept → Should evaluate naturally
- [ ] Check lesson message length → Should be 2-4 sentences
- [ ] Check lesson acknowledges choice → Should mention what they typed
- [ ] Check lesson teaches mechanic → Should explain the intended outcome type

