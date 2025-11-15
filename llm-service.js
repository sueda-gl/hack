// LLM Service
// Handles OpenAI API integration and response parsing
// Uses JSON-based 4-outcome system: DIRECT_WIN, BACKFIRE_WIN, NEUTRAL_NO_DAMAGE, MUTUAL_DESTRUCTION

// Get tutorial-specific JSON guidance for onboarding battles
function getTutorialGuidance(attackingConcept, defendingConcept) {
    // Check if we're in onboarding mode
    if (typeof isOnboardingActive === 'function' && !isOnboardingActive()) {
        return null; // Normal gameplay - no special guidance
    }
    
    const currentStep = typeof getCurrentStep === 'function' ? getCurrentStep() : -1;
    
    // Provide JSON templates for each tutorial battle
    const tutorialGuidance = {
        0: {
            winner: "defender",
            outcome_type: "direct_win",
            attacker_damage: 1,
            defender_damage: 0,
            damage_amount: 30,
            explanation: "Player wins! Water extinguishes fire, then continues forward - nothing stops it. AI's red tower damaged!",
            teaching_point: "Water doesn't just neutralize fire - after extinguishing it, the water keeps flowing and damages the castle because there's no defense left."
        },
        
        1: {
            winner: "attacker",
            outcome_type: "backfire_win",
            attacker_damage: 0,
            defender_damage: 1,
            damage_amount: 35,
            explanation: "AI wins! Water reacts violently with sodium, exploding on impact. Player's blue tower damaged by backfire!",
            teaching_point: "Sometimes your defense amplifies the threat. Water acts as fuel for sodium's violent reaction."
        },
        
        2: {
            winner: "defender",
            outcome_type: "neutral_no_damage",
            attacker_damage: 0,
            defender_damage: 0,
            damage_amount: 0,
            explanation: "Player wins! Nuclear attack is ineffective - YouTube has no single point of failure. Both towers safe!",
            teaching_point: "Decentralized systems survive physical attacks. YouTube exists on thousands of servers worldwide - destroying one location is ineffective."
        },
        
        3: {
            winner: "none",
            outcome_type: "mutual_destruction",
            attacker_damage: 1,
            defender_damage: 1,
            damage_amount: 25,
            explanation: "Mutual destruction! Two lightning bolts collide with equal force. Both red and blue towers damaged!",
            teaching_point: "Symmetric forces destroy each other. When identical powers meet, both are damaged equally."
        },
        
        4: {
            winner: "defender",
            outcome_type: "direct_win",
            attacker_damage: 1,
            defender_damage: 0,
            damage_amount: 30,
            explanation: "Player wins! Laser pointer AMPLIFIES cat's hunting instinct to maximum power. AI's red tower damaged!",
            teaching_point: "Some combinations amplify power. The laser pointer triggers and enhances the cat's predatory instincts perfectly."
        },
        
        5: {
            winner: "defender",
            outcome_type: "direct_win",
            attacker_damage: 1,
            defender_damage: 0,
            damage_amount: 30,
            explanation: "Player wins! Duck's quack amplifies infinitely in echo chamber, collapsing it. AI's red tower damaged!",
            teaching_point: "Environmental amplification: A weak sound becomes an overwhelming force when trapped in a feedback loop. The echo chamber turns a simple quack into a destructive weapon."
        }
    };
    
    return tutorialGuidance[currentStep] || null;
}

// Call OpenAI API to determine battle outcome with JSON response
async function callOpenAI(attackingConcept, defendingConcept) {
    // Get tutorial-specific guidance if in onboarding mode
    const tutorialTemplate = getTutorialGuidance(attackingConcept, defendingConcept);
    
    // If in tutorial mode, return the template directly (LLM might vary slightly, but this ensures consistency)
    if (tutorialTemplate && typeof isOnboardingActive === 'function' && isOnboardingActive()) {
        console.log('[Onboarding] Using predetermined tutorial outcome');
        return tutorialTemplate;
    }
    
    const systemPrompt = `You are an advanced battle logic system that analyzes real-world interactions between ANY concepts.

Your job: Determine how two concepts would interact in a battle, considering physics, chemistry, logic, and domain compatibility.

## THE 4 OUTCOME TYPES:

### 1. DIRECT_WIN
- One concept cleanly dominates and continues through to damage the opponent's castle
- Winner takes 0 damage, loser takes full damage
- The winning concept neutralizes the threat, then continues forward to damage the castle
- Example: Water vs Fire → Water extinguishes fire, then flows forward to damage castle (fire's castle damaged, water's castle safe)
- Example: Diamond vs Glass → Diamond cuts through glass and damages beyond (glass's castle damaged, diamond's castle safe)
- Key: After neutralizing the threat, the winning concept continues and hits the castle

### 2. BACKFIRE_WIN  
- Defender's concept AMPLIFIES or FUELS the attacker's threat
- Defender takes full damage BECAUSE their defense made it worse
- Attacker still wins, but specifically because defender's choice backfired
- Key indicators: Defender acts as fuel, conductor, amplifier, or unstable component
- Example: Sodium vs Water → Water causes violent explosion (water backfires, damaged)
- Example: Gasoline vs Fire → Gasoline ignites explosively (gasoline backfires, damaged)
- Example: Metal Tower vs Lightning → Metal conducts electricity (tower backfires, damaged)

### 3. NEUTRAL_NO_DAMAGE
- Attack happens but is INEFFECTIVE
- Both take 0 damage
- Attack fails due to domain mismatch or lack of single point of failure
- Example: Nuclear Weapon vs YouTube → Attack is ineffective, YouTube has no single point of failure (both safe)
- Example: Physical attack vs Decentralized system → Ineffective (both safe)
- Example: Abstract concept vs Physical object → Attack fails (both safe)
- Use this when the attack happens but simply cannot succeed

### 4. MUTUAL_DESTRUCTION
- Both concepts destroy each other symmetrically
- Both take equal damage
- Neither dominates, both are damaged
- Example: Nuke vs Nuke → Both explode (both damaged)
- Example: Fire vs Fire → Both burn together (both damaged)
- Example: Black Hole vs Black Hole → Both collapse into each other (both damaged)

## CRITICAL RULES:

1. **Backfire Detection**: Only use BACKFIRE_WIN if defender's concept actively makes the situation worse by acting as fuel/amplifier/conductor
2. **Domain Mismatch**: Use NEUTRAL_NO_DAMAGE when concepts exist in incompatible domains (physical vs digital, abstract vs concrete)
3. **Clear Winner**: Explanation MUST state who wins and which tower(s) are damaged
4. **Damage Logic**: 
   - DIRECT_WIN or BACKFIRE_WIN: 20-40 damage to loser only
   - NEUTRAL_NO_DAMAGE: 0 damage to both
   - MUTUAL_DESTRUCTION: 15-30 damage to BOTH

## RESPONSE FORMAT:

Respond with VALID JSON ONLY (no markdown, no code blocks):

{
  "winner": "attacker" | "defender" | "none",
  "outcome_type": "direct_win" | "backfire_win" | "neutral_no_damage" | "mutual_destruction",
  "attacker_damage": 0 | 1,
  "defender_damage": 0 | 1,
  "damage_amount": 0-40,
  "explanation": "Clear sentence: WHO wins, WHAT happens, WHICH tower(s) damaged",
  "teaching_point": "What this teaches about concept interactions"
}`;

    const userPrompt = `Analyze this battle:

AI (Red Tower) attacks with: "${attackingConcept}"
PLAYER (Blue Tower) defends with: "${defendingConcept}"

Determine:
1. Do they meaningfully interact? (If no → neutral_no_damage)
2. Does defender's concept amplify/fuel attacker? (If yes → backfire_win)
3. Does one cleanly dominate? (If yes → direct_win)
4. Do both destroy each other? (If yes → mutual_destruction)

Respond with JSON only.`;

    try {
        console.log('Calling LLM with 4-outcome system...');
        
        // Azure OpenAI uses different header format
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (CONFIG.USE_AZURE) {
            headers['api-key'] = CONFIG.AZURE_OPENAI_API_KEY;
        } else {
            headers['Authorization'] = `Bearer ${CONFIG.OPENAI_API_KEY}`;
        }
        
        const endpoint = CONFIG.USE_AZURE ? CONFIG.AZURE_OPENAI_ENDPOINT : CONFIG.OPENAI_API_URL;
        
        const requestBody = {
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            max_tokens: CONFIG.MAX_TOKENS,
            temperature: CONFIG.TEMPERATURE
        };
        
        // Only add model for non-Azure (Azure has it in the endpoint)
        if (!CONFIG.USE_AZURE) {
            requestBody.model = CONFIG.MODEL;
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        console.log('LLM Raw Response:', content);
        
        return parseJSONResponse(content);
    } catch (error) {
        console.error('OpenAI API Error:', error);
        // Fallback response - neutral no damage
        return {
            winner: 'none',
            outcome_type: 'neutral_no_damage',
            attacker_damage: 0,
            defender_damage: 0,
            damage_amount: 0,
            explanation: 'Unable to connect to AI. No damage to either tower.',
            teaching_point: 'Connection error occurred.'
        };
    }
}

// Parse JSON response from LLM
function parseJSONResponse(content) {
    try {
        // Remove markdown code blocks if present
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }
        
        const parsed = JSON.parse(cleanContent);
        
        // Validate required fields
        if (!parsed.winner || !parsed.outcome_type) {
            throw new Error('Missing required fields');
        }
        
        // Ensure damage flags are 0 or 1
        parsed.attacker_damage = parsed.attacker_damage ? 1 : 0;
        parsed.defender_damage = parsed.defender_damage ? 1 : 0;
        
        // Clamp damage amount
        parsed.damage_amount = Math.min(Math.max(parsed.damage_amount || 0, 0), 40);
        
        // Validate outcome_type
        const validOutcomes = ['direct_win', 'backfire_win', 'neutral_no_damage', 'mutual_destruction'];
        if (!validOutcomes.includes(parsed.outcome_type)) {
            console.warn('Invalid outcome_type, defaulting to neutral_no_damage');
            parsed.outcome_type = 'neutral_no_damage';
        }
        
        console.log('Parsed JSON Response:', parsed);
        return parsed;
        
    } catch (error) {
        console.error('JSON Parse Error:', error);
        console.error('Content was:', content);
        
        // Fallback: try to extract from text format
        return fallbackTextParse(content);
    }
}

// Fallback parser for non-JSON responses
function fallbackTextParse(content) {
    console.log('Attempting fallback text parsing...');
    
    try {
        // Try to extract key information from text
        const lowerContent = content.toLowerCase();
        
        let outcome_type = 'neutral_no_damage';
        let winner = 'none';
        let attacker_damage = 0;
        let defender_damage = 0;
        let damage_amount = 20;
        
        // Detect outcome type from keywords
        if (lowerContent.includes('backfire') || lowerContent.includes('explodes on') || lowerContent.includes('amplifies')) {
            outcome_type = 'backfire_win';
            winner = 'attacker';
            defender_damage = 1;
            damage_amount = 30;
        } else if (lowerContent.includes('no effect') || lowerContent.includes('no damage') || lowerContent.includes("doesn't interact")) {
            outcome_type = 'neutral_no_damage';
            winner = 'none';
            damage_amount = 0;
        } else if (lowerContent.includes('both') && (lowerContent.includes('damage') || lowerContent.includes('destroy'))) {
            outcome_type = 'mutual_destruction';
            winner = 'none';
            attacker_damage = 1;
            defender_damage = 1;
            damage_amount = 20;
        } else if (lowerContent.includes('player wins') || lowerContent.includes('defender wins')) {
            outcome_type = 'direct_win';
            winner = 'defender';
            attacker_damage = 1;
            damage_amount = 30;
        } else if (lowerContent.includes('ai wins') || lowerContent.includes('attacker wins')) {
            outcome_type = 'direct_win';
            winner = 'attacker';
            defender_damage = 1;
            damage_amount = 30;
        }
        
        return {
            winner,
            outcome_type,
            attacker_damage,
            defender_damage,
            damage_amount,
            explanation: content.substring(0, 150), // Use first part of content
            teaching_point: 'Parsed from text format.'
        };
    } catch (error) {
        console.error('Fallback parse failed:', error);
        // Ultimate fallback - neutral no damage
        return {
            winner: 'none',
            outcome_type: 'neutral_no_damage',
            attacker_damage: 0,
            defender_damage: 0,
            damage_amount: 0,
            explanation: 'Unable to parse response. No damage to either tower.',
            teaching_point: 'Parse error occurred.'
        };
    }
}
