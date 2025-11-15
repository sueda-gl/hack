# Onboarding LLM Enhancement - Dynamic Lesson Messages

## Overview
Enhanced the onboarding system to use LLM-generated lesson messages instead of hardcoded text. This makes the tutorial feel truly interactive and intelligent, acknowledging when users deviate from suggested answers.

## Key Changes

### 1. LLM Service (`llm-service.js`)

#### Modified `getTutorialOutcomeGuidance()` (formerly `getTutorialGuidance()`)
- Changed from returning complete battle results to returning guidance parameters
- Now includes `suggested_answer` and `lesson_focus` for each tutorial step
- Provides constraints for the LLM rather than fixed responses

#### Enhanced `callOpenAI()` 
- Now uses LLM for ALL onboarding battles (not hardcoded results)
- Adds tutorial-specific system prompt instructions when in onboarding mode
- Enforces outcome type and damage values while allowing creative explanations
- Detects if player followed the hint and adjusts prompt accordingly
- Example constraint injection:
  ```
  STRICT REQUIREMENTS:
  - You MUST classify this outcome as: direct_win
  - winner: defender
  - attacker_damage: 1
  - defender_damage: 0
  ```

#### New Function: `generateLessonMessage()`
- Generates dynamic "YOU LEARNED" messages using LLM
- Acknowledges when players choose different concepts than suggested
- Adapts tone based on whether player followed hints
- Includes encouraging, personalized feedback
- Handles final step with complete tutorial completion message
- Fallback message if LLM call fails

**Example behavior:**
- If player types "WATER" (as suggested): "Great! You followed the hint..."
- If player types "OCEAN" instead: "I see you went with OCEAN instead of WATER! Interesting choice - and it demonstrates the same principle..."

### 2. Battle Controller (`battle-controller.js`)

#### Updated Battle Resolution Flow
- After battle animations complete, calls `generateLessonMessage()`
- Passes attacking concept, defending concept, and battle result to LLM
- Waits for lesson generation before showing banner
- Passes generated message to `showLessonBanner()`

```javascript
// Generate dynamic lesson message using LLM
let lessonMessage = null;
if (typeof generateLessonMessage === 'function') {
    lessonMessage = await generateLessonMessage(
        attackingConcept, 
        defendingConcept, 
        result
    );
}

// Show lesson banner with dynamic message
showLessonBanner(currentStep, lessonMessage);
```

### 3. Onboarding Manager (`onboarding-manager.js`)

#### Updated `showLessonBanner()`
- Now accepts optional `dynamicLessonMessage` parameter
- Uses LLM-generated message if provided
- Falls back to hardcoded `battle.lessonAfter` if LLM fails
- Logs which type of message is being used

## User Experience Improvements

### Before
- User types something unexpected (e.g., "ICE" instead of "WATER")
- Game shows stock message: "Water extinguishes fire..."
- Feels broken/pre-scripted

### After
- User types "ICE" instead of "WATER"
- LLM generates: "I see you went with ICE instead of WATER! Creative thinking - ice is just solid water, and as it melts, it has the same effect. The fire gets extinguished and your frozen defense flows forward to damage the AI's tower. This demonstrates a DIRECT WIN..."
- Feels intelligent and responsive

## Technical Details

### LLM Prompt Structure
The lesson message generator uses a sophisticated prompt that:
1. Provides tutorial context (what we're teaching)
2. States the suggested answer
3. Shows what player actually typed
4. Includes battle result explanation
5. Requests acknowledgment of player's choice
6. Asks for educational breakdown of the mechanic

### Outcome Enforcement
During onboarding, battle outcomes are still enforced (to ensure consistent teaching), but explanations are dynamic:
- **Fixed:** outcome_type, winner, damage values
- **Dynamic:** explanation text, reasoning, lesson message

### Error Handling
Multiple fallback layers:
1. LLM generates custom message ✓
2. LLM fails → fallback to personalized template
3. Complete failure → use original hardcoded message

## Testing Recommendations

Test each tutorial step with:
1. **Following the hint exactly** - Should congratulate and explain
2. **Similar concept** (e.g., "Ocean" for "Water") - Should acknowledge creativity
3. **Completely different** (e.g., "Rock" for "Water") - Should acknowledge and adapt
4. **Nonsense input** - Should still maintain teaching tone

## Configuration

No configuration changes needed. System uses existing:
- `CONFIG.OPENAI_API_KEY` or `CONFIG.AZURE_OPENAI_API_KEY`
- `CONFIG.MODEL`
- Temperature set to 0.8 (slightly higher for engaging writing)
- Max tokens: 500 (lesson messages only)

## Benefits

1. **Truly Interactive**: Players feel the AI understands their choices
2. **Omnipotent LLM**: Reinforces that the game is intelligent and adaptive
3. **Better Learning**: Explanations connect to actual player choices
4. **Replayability**: Each tutorial playthrough feels slightly different
5. **Graceful Degradation**: Falls back to working messages if LLM fails

