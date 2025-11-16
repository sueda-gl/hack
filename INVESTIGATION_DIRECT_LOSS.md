# Investigation: Adding "direct_loss" Outcome Type

## Current Problem

The system uses `direct_win` for BOTH scenarios:
1. **Player wins:** Defender beats attacker (Water vs Fire → Player's tower safe, AI damaged)
2. **Player loses:** Attacker beats defender (Fire vs Tree → Player's tower damaged, AI safe)

Both are classified as `direct_win` with different `winner` values. This is confusing from the player's perspective.

## Current Outcome Architecture

### 1. **Outcome Type Definitions** (`llm-service.js`)

```javascript
// Currently 4 outcome types:
- direct_win       (can mean player wins OR loses depending on "winner" field)
- backfire_win     (player's defense amplifies the attack)
- neutral_no_damage (no interaction)
- mutual_destruction (both damaged)
```

### 2. **Data Structure** (LLM Response JSON)

```javascript
{
  "winner": "attacker" | "defender" | "none",
  "outcome_type": "direct_win" | "backfire_win" | "neutral_no_damage" | "mutual_destruction",
  "attacker_damage": 0 | 1,
  "defender_damage": 0 | 1,
  "damage_amount": 0-10,
  "explanation": "...",
  "teaching_point": "..."
}
```

**The confusion:** When `outcome_type: "direct_win"` and `winner: "attacker"`, this is a LOSS for the player but still labeled "direct_win".

### 3. **Code Locations Using outcome_type**

#### A. **LLM Prompt** (`llm-service.js` lines 126-184)
- Defines all 4 outcome types for the LLM
- Instructs when to use each type
- **Would need:** New "direct_loss" definition

#### B. **Validation** (`llm-service.js` lines 307-311)
```javascript
const validOutcomes = ['direct_win', 'backfire_win', 'neutral_no_damage', 'mutual_destruction'];
```
- **Would need:** Add 'direct_loss' to array

#### C. **Fallback Parser** (`llm-service.js` lines 340-365)
- Text-based fallback when JSON parsing fails
- **Would need:** Add detection for "direct_loss" keywords

#### D. **Tutorial Guidance** (`llm-service.js` lines 15-77)
- 6 tutorial battles with predefined outcome types
- Step 0: `outcome_type: "direct_win"` (defender wins)
- **Would need:** Potentially add tutorial for "direct_loss"

#### E. **Battle Controller Switch** (`battle-controller.js` lines 102-184)
```javascript
switch(outcome_type) {
    case 'direct_win':
        // Show collision, damage loser
        const directWinner = winner === 'attacker' ? 'red' : 'blue';
        ...
    case 'backfire_win': ...
    case 'neutral_no_damage': ...
    case 'mutual_destruction': ...
}
```
- **Would need:** New `case 'direct_loss':` with appropriate animations

#### F. **UI Labels** (`ui-manager.js` lines 238-246)
```javascript
function getOutcomeLabel(outcome_type) {
    const labels = {
        'direct_win': '✨ DIRECT HIT',
        'backfire_win': '💥 BACKFIRE',
        'neutral_no_damage': '🚫 INEFFECTIVE',
        'mutual_destruction': '⚔️ MUTUAL DESTRUCTION'
    };
    return labels[outcome_type] || '⚔️ BATTLE';
}
```
- **Would need:** Add `'direct_loss': '💀 DEFEATED'` or similar

#### G. **Lesson Message Generator** (`llm-service.js` lines 515-521)
```javascript
const emoji = {
    'direct_win': '✅',
    'backfire_win': '💥',
    'neutral_no_damage': '🚫',
    'mutual_destruction': '⚔️'
}[battleResult.outcome_type] || '⚔️';
```
- **Would need:** Add `'direct_loss': '💀'`

#### H. **Battle History** (`battle-resolver.js` lines 5-24)
- Stores outcome_type in history log
- **Would need:** Display/formatting for "direct_loss"

## Proposed Solution

### Option 1: Add "direct_loss" as 5th Outcome Type ✅ RECOMMENDED

**Changes Required:**

1. **LLM System Prompt** - Add new outcome definition:
```
### 5. DIRECT_LOSS
- Defender's concept simply fails to stop the attack
- Attacker wins cleanly (not due to amplification)
- Defender's tower damaged, attacker's tower safe
- Example: Fire vs Tree → Tree burns, can't stop fire
- Example: Lava vs Rock → Rock melts
- NOT amplification (that's BACKFIRE), just simple failure
```

2. **JSON Response Format** - Update valid values:
```javascript
"outcome_type": "direct_win" | "direct_loss" | "backfire_win" | "neutral_no_damage" | "mutual_destruction"
```

3. **Validation Arrays** - Add to validOutcomes
4. **Battle Controller** - Add new case statement
5. **UI Labels** - Add label for direct_loss
6. **Tutorial** - Update any direct_win that should be direct_loss

**Pros:**
- Clear semantic meaning from player perspective
- "direct_win" = I won, "direct_loss" = I lost
- Easier for players to understand
- Makes backfire vs simple loss distinction clearer

**Cons:**
- More outcome types to manage (5 instead of 4)
- Changes needed across multiple files
- Existing battle history would need migration

### Option 2: Keep Current System, Improve Labeling

**Changes:**
- Modify `getOutcomeLabel()` to check both `outcome_type` AND `winner`
- Display different labels based on combination

**Example:**
```javascript
if (outcome_type === 'direct_win') {
    if (winner === 'defender') return '✅ VICTORY!';
    if (winner === 'attacker') return '💀 DEFEATED!';
}
```

**Pros:**
- Minimal code changes
- No new outcome types
- Existing data structures remain valid

**Cons:**
- Still semantically confusing
- LLM prompt remains ambiguous about what "direct_win" means
- Harder to teach/explain to players
- Logic scattered across winner + outcome_type combinations

### Option 3: Rename and Restructure (Most Comprehensive)

**Changes:**
- Rename `direct_win` → `direct_dominance`
- Add explicit player-facing outcome types separate from mechanical types
- Two-layer system: mechanical (what happened) + perspective (win/loss)

**Pros:**
- Cleanest semantics
- Separates "what happened" from "who won"

**Cons:**
- Massive refactoring
- Breaking changes to all existing code
- Most complex implementation

## Recommendation: Option 1

Add `direct_loss` as a 5th outcome type.

### Rationale:
1. **Clear semantics:** Players immediately understand win vs loss
2. **Maintains current architecture:** Minimal disruption
3. **Better LLM guidance:** Clearer instructions for when to use each
4. **Distinguishes from backfire:** Makes it clear that backfire = amplification, direct_loss = simple failure

### Implementation Plan (5 Steps):

**Step 1: Update LLM Definitions**
- Add DIRECT_LOSS to system prompt outcome types
- Update JSON response format documentation
- Add to valid outcomes array
- Update fallback parser keywords

**Step 2: Update Battle Controller**
- Add `case 'direct_loss':` to switch statement
- Use same animation as direct_win (just different winner)
- Ensure damage logic correct

**Step 3: Update UI**
- Add label: `'direct_loss': '💀 DEFEATED'` or `'❌ BLOCKED'`
- Add emoji for lesson messages
- Test display

**Step 4: Update Tutorial System**
- Review 6 tutorial battles
- Ensure correct outcome types
- Update lesson focus descriptions if needed

**Step 5: Test Edge Cases**
- Fire vs Tree → direct_loss
- Water vs Fire → direct_win (defender)
- Tree vs Fire (attacker perspective) → still direct_win for them
- Water vs Sodium → backfire_win

### Files to Modify:
1. `llm-service.js` - LLM prompt, validation, lesson messages (~5 locations)
2. `battle-controller.js` - Switch case (~1 location)
3. `ui-manager.js` - Label mapping (~1 location)
4. `onboarding-manager.js` - Potentially update fallback messages

### Estimated Lines of Code: ~50-80 LOC

### Backward Compatibility:
- Existing battle history with "direct_win + winner: attacker" remains valid
- Can add migration logic later if needed
- New battles will use clearer outcome types going forward

