// LLM Service
// Handles OpenAI API integration and response parsing
// Uses JSON-based 5-outcome system: DIRECT_WIN, DIRECT_LOSS, BACKFIRE_WIN, NEUTRAL_NO_DAMAGE, MUTUAL_DESTRUCTION

// Get tutorial-specific outcome guidance for onboarding battles
function getTutorialOutcomeGuidance(attackingConcept, defendingConcept) {
    // Check if we're in onboarding mode
    if (typeof isOnboardingActive === 'function' && !isOnboardingActive()) {
        return null; // Normal gameplay - no guidance
    }
    
    const currentStep = typeof getCurrentStep === 'function' ? getCurrentStep() : -1;
    
    // Map each tutorial step to its intended outcome type and suggested answer
    const tutorialOutcomes = {
        0: {
            suggested_answer: "Water",
            outcome_type: "direct_win",
            winner: "defender",
            attacker_damage: 1,
            defender_damage: 0,
            damage_amount: 30,
            lesson_focus: "DIRECT WIN - when your defense neutralizes the attack AND continues forward to damage the opponent's tower"
        },
        
        1: {
            suggested_answer: "Water",
            outcome_type: "backfire_win",
            winner: "attacker",
            attacker_damage: 0,
            defender_damage: 1,
            damage_amount: 35,
            lesson_focus: "BACKFIRE - when your defense amplifies or fuels the attack, causing it to explode at YOUR tower"
        },
        
        2: {
            suggested_answer: "YouTube",
            outcome_type: "neutral_no_damage",
            winner: "defender",
            attacker_damage: 0,
            defender_damage: 0,
            damage_amount: 0,
            lesson_focus: "INEFFECTIVE ATTACK - when the attack happens but causes no damage to either side due to domain incompatibility"
        },
        
        3: {
            suggested_answer: "Lightning",
            outcome_type: "mutual_destruction",
            winner: "none",
            attacker_damage: 1,
            defender_damage: 1,
            damage_amount: 25,
            lesson_focus: "MUTUAL DESTRUCTION - when two symmetric forces collide and both are damaged equally"
        },
        
        4: {
            suggested_answer: "Cat",
            outcome_type: "direct_win",
            winner: "defender",
            attacker_damage: 1,
            defender_damage: 0,
            damage_amount: 30,
            lesson_focus: "DIRECT WIN with AMPLIFICATION - showing how some defenses amplify power rather than just blocking"
        },
        
        5: {
            suggested_answer: "Duck",
            outcome_type: "direct_win",
            winner: "defender",
            attacker_damage: 1,
            defender_damage: 0,
            damage_amount: 30,
            lesson_focus: "DIRECT WIN with ENVIRONMENTAL AMPLIFICATION - weak concepts can become powerful in the right environment"
        }
    };
    
    return tutorialOutcomes[currentStep] || null;
}

// TIER 1: Deep chain-of-thought reasoning to determine battle outcome
async function callOpenAI_Tier1_Reasoning(attackingConcept, defendingConcept, tutorialGuidance = null) {
    const isOnboarding = tutorialGuidance && typeof isOnboardingActive === 'function' && isOnboardingActive();
    
    let systemPrompt = `You are an advanced battle logic system that analyzes real-world interactions between ANY concepts.

Your job: Determine how two concepts would interact in a battle, considering physics, chemistry, logic, and domain compatibility.

## CORE PRINCIPLE: REAL-WORLD THINKING

Imagine these two concepts actually encountering each other in the real world. Think through:

**"What would ACTUALLY happen?"**

1. **Material Reality**: What are these made of? What physical/chemical/logical properties do they have?
   - If physical: mass, energy, temperature, state of matter, chemical composition
   - If abstract: how do they manifest? what effects do they produce?
   - If digital/informational: how are they structured? where do they exist?

2. **The Encounter**: When they meet, what physical/chemical/logical processes occur?
   - Do they chemically react? (combustion, explosion, neutralization, dissolution)
   - Do they physically interact? (collision, absorption, deflection, penetration)
   - Do they logically relate? (contradiction, support, independence)
   - Think about actual mechanisms, not just labels

3. **Scale & Magnitude**: How do their sizes/powers compare?
   - Is one vastly larger? (ocean vs cup, planet vs pebble, concept vs instance)
   - Scale differences often determine who overwhelms whom
   - Tiny reactions in massive systems get absorbed and ignored

4. **Momentum & Continuation**: After initial contact, what happens next?
   - Does anything continue moving forward?
   - Physical forces don't just stop - they transfer, dissipate, or continue
   - Massive things carry momentum (ocean waves, avalanches, explosions)
   - Abstract things may have no physical continuation

5. **Energy & Transformation**: Where does the energy go?
   - Does defender absorb the attack's energy?
   - Does the energy get amplified (backfire)?
   - Does it transform into something else?
   - Does it dissipate harmlessly?

**Think like a physicist/chemist observing an actual collision, not categorizing into buckets.**

THINK STEP BY STEP before deciding:

## THE 5 OUTCOME TYPES:

### 1. DIRECT_WIN (Defender Wins)
- Defender's concept cleanly dominates and pushes through to damage attacker's castle
- Defender takes 0 damage, attacker takes full damage
- Defense neutralizes the threat AND continues forward to damage attacker's tower
- Example: Water vs Fire → Water extinguishes fire, flows forward (AI's RED tower damaged)
- Example: Shield vs Arrow → Shield blocks arrow and rams forward (AI's RED tower damaged)
- Key: DEFENDER wins, their concept continues and hits ATTACKER's castle

### 2. DIRECT_LOSS (Defender Loses)
- Defender's concept simply FAILS to stop the attack
- Attacker takes 0 damage, defender takes full damage
- Defense is ineffective and attack reaches defender's tower
- Example: Fire vs Tree → Tree burns, can't stop fire (PLAYER's BLUE tower damaged)
- Example: Lava vs Rock → Rock melts, can't resist heat (PLAYER's BLUE tower damaged)
- Example: Sword vs Paper → Paper is cut through (PLAYER's BLUE tower damaged)
- Key: DEFENDER loses because their concept simply CAN'T stop the attack (NOT amplification)
- NOT backfire - just simple failure

### 3. BACKFIRE_WIN (Defender Loses Worse)
- Defender's concept AMPLIFIES, FUELS, or CONDUCTS the attacker's threat
- Defender takes full damage BECAUSE their defense made it WORSE
- Attacker wins because defender's choice actively helped the attack
- Key indicators: Chemical reaction, conductivity, amplification, catalyst effect
- **REQUIRES FREE/ACCESSIBLE reactants** - bound materials in structures don't count
- **REQUIRES COMPARABLE SCALE** - if defender is vastly larger, it overwhelms the reaction
- Example: Sodium vs SMALL WATER (cup/bucket) → Water reacts explosively (BACKFIRE)
- Example: Gasoline vs Fire → Gasoline IGNITES explosively (BACKFIRE)
- Example: Metal Rod vs Lightning → Metal CONDUCTS electricity perfectly (BACKFIRE)
- Counter-example: Sodium vs OCEAN → Ocean is billions of gallons, tiny reaction is overwhelmed, ocean continues as tsunami (DIRECT_WIN not BACKFIRE)
- Counter-example: Sodium vs Tree → Tree just burns, moisture is bound in cellulose (DIRECT_LOSS not BACKFIRE)
- Counter-example: Fire vs Wet Cloth → Cloth burns, water evaporates (DIRECT_LOSS not BACKFIRE)
- Key: Defense doesn't just fail - it actively AMPLIFIES the damage AND the reaction isn't overwhelmed by defender's massive scale

### 4. NEUTRAL_NO_DAMAGE
- Attack is INEFFECTIVE - happens but causes no damage to either tower
- Both take 0 damage
- Defense stops attack BUT has no momentum/means to continue forward to damage attacker's RED tower
- Example: Nuclear Weapon vs YouTube → YouTube has no single point of failure across distributed servers (both safe)
- Example: Physical attack vs Decentralized system → No single target to hit, attack can't locate what to destroy (both safe)
- Example: Sword vs Concept of Love → Physical blade can't cut abstract emotion, they exist in different realms (both safe)
- IMPORTANT: Don't use this if defender can continue forward after stopping attack - that's DIRECT_WIN!

### 5. MUTUAL_DESTRUCTION
- Both concepts destroy each other symmetrically
- Both take equal damage
- Neither dominates, both are damaged
- Example: Nuke vs Nuke → Both explode (both damaged)
- Example: Fire vs Fire → Both burn together (both damaged)
- Example: Black Hole vs Black Hole → Both collapse into each other (both damaged)

## CRITICAL RULES:

1. **Win vs Loss vs Backfire** (Tower Colors: Attacker/AI = RED, Defender/Player = BLUE): 
   - DIRECT_WIN: Defender wins → Attacker's RED tower (AI) damaged
   - DIRECT_LOSS: Defender loses simply → Defender's BLUE tower (Player) damaged - defense just fails
   - BACKFIRE_WIN: Defender loses badly → Defender's BLUE tower (Player) damaged - defense amplifies attack
   
2. **Backfire Detection** (MOST IMPORTANT):
   Only use BACKFIRE_WIN if defender's concept actively AMPLIFIES/FUELS/CONDUCTS AND reaction dominates.
   - Must involve FREE/ACCESSIBLE reactants (not bound in structures)
   - Must create chemical reaction, conductivity, or amplification
   - **Must check SCALE: If defender is VASTLY larger, it overwhelms the reaction → DIRECT_WIN, not backfire**
   - Examples of BACKFIRE: Small water + sodium, gasoline + fire, metal rod + lightning (comparable scales)
   - Examples of NOT BACKFIRE: 
     * Ocean + sodium (ocean is planetary scale, overwhelms tiny reaction) → DIRECT_WIN
     * Tree + sodium (moisture bound) → DIRECT_LOSS
     * Wet cloth + fire (just burns) → DIRECT_LOSS
   - **When in doubt: Check if defender's scale overwhelms the reaction → DIRECT_WIN. If it just fails → DIRECT_LOSS**
   - Simple failure = DIRECT_LOSS, NOT backfire
   
3. **Ineffective Attacks**: Use NEUTRAL_NO_DAMAGE when attack cannot succeed due to:
   - No single point of failure (decentralized systems)
   - Physical attacks can't affect abstract/digital concepts
   - Concepts exist in different realms (physical vs emotional, material vs digital)
   - ALWAYS explain WHY the attack is ineffective, don't just say "incompatible"

4. **Damage Logic** (RED tower = AI/Attacker, BLUE tower = Player/Defender): 
   - DIRECT_WIN: 20-40 damage to RED tower (AI/attacker) only
   - DIRECT_LOSS: 20-40 damage to BLUE tower (Player/defender) only
   - BACKFIRE_WIN: 25-40 damage to BLUE tower (Player/defender) only - usually higher damage
   - NEUTRAL_NO_DAMAGE: 0 damage to both towers
   - MUTUAL_DESTRUCTION: 15-30 damage to BOTH towers (RED and BLUE)

5. **Continuation After Stopping Attack** (CRITICAL):
   - If defender STOPS attack successfully, ask: "Does defender continue forward to damage attacker's tower?"
   - Massive/physical concepts (ocean, tsunami, avalanche) have MOMENTUM - they continue forward → DIRECT_WIN
   - Small concepts stopping large ones usually get overwhelmed → DIRECT_LOSS
   - Example: Ocean vs Fire → Ocean stops fire AND continues as wave → DIRECT_WIN (not neutral!)
   - Example: Ocean vs Sodium → Ocean neutralizes sodium AND continues as tsunami → DIRECT_WIN (not neutral!)
   - NEUTRAL only when: attack can't meaningfully affect defender (explain WHY) OR defender stops but has no way to continue forward`;

    // Add tutorial context if player went off-script in onboarding
    if (isOnboarding) {
        const currentStep = typeof getCurrentStep === 'function' ? getCurrentStep() : 0;
        systemPrompt += `

🎓 TUTORIAL CONTEXT - You are the omniscient game master:

This is tutorial step ${currentStep + 1} of 6, teaching: "${tutorialGuidance.lesson_focus}"

I suggested player use: "${tutorialGuidance.suggested_answer}"
Player chose instead: "${defendingConcept}"

Your task:
1. Evaluate "${defendingConcept}" vs "${attackingConcept}" HONESTLY using the steps below
2. Don't force the intended outcome - determine what ACTUALLY happens based on real-world logic
3. Your reasoning can naturally acknowledge their creative choice if appropriate`;
    }

    systemPrompt += `

## RESPONSE FORMAT:

Respond with VALID JSON ONLY (no markdown, no code blocks):

{
  "reasoning": "Your complete step-by-step analysis (500-1000 words) following the structure below",
  "outcome_type": "direct_win" | "direct_loss" | "backfire_win" | "neutral_no_damage" | "mutual_destruction",
  "winner": "attacker" | "defender" | "none",
  "attacker_damage": 0 | 1,
  "defender_damage": 0 | 1,
  "damage_amount": 0-40
}

IMPORTANT MAPPING:
- outcome_type="direct_win" → winner="defender", defender_damage=0, attacker_damage=1
- outcome_type="direct_loss" → winner="attacker", defender_damage=1, attacker_damage=0  
- outcome_type="backfire_win" → winner="attacker", defender_damage=1, attacker_damage=0
- outcome_type="neutral_no_damage" → winner="none", both damage=0
- outcome_type="mutual_destruction" → winner="none", both damage=1`;

    const userPrompt = `Analyze this battle:

AI (Red Tower) attacks with: "${attackingConcept}"
PLAYER (Blue Tower) defends with: "${defendingConcept}"

IMAGINE THE REAL-WORLD ENCOUNTER - THINK STEP BY STEP:

1. ANALYZE ATTACKER: "${attackingConcept}"
   - What IS this in reality? What is it made of? What properties does it have?
   - Scale and magnitude (tiny, human-scale, building-scale, planetary, cosmic, abstract)
   - How does it attack? What mechanisms does it use? What energy/force does it carry?
   
2. ANALYZE DEFENDER: "${defendingConcept}"
   - What IS this in reality? What is it made of? What properties does it have?
   - Scale and magnitude - compare to attacker
   - How would it respond? What mechanisms can it use? What happens when it encounters the attack?
   
3. THE ACTUAL ENCOUNTER - What would REALLY happen when they meet?
   - Describe the physical/chemical/logical process step by step
   - Do they chemically react? Physically collide? Logically interact?
   - What specific mechanisms occur? (not just "they interact" - describe HOW)
   
4. SCALE DYNAMICS - Who overwhelms whom?
   - Compare their actual magnitudes and power levels
   - Does one dwarf the other? (ocean vs droplet, planet vs grain)
   - If there's a reaction, does it dominate the system or get overwhelmed?
   - Tiny reactions in massive systems get absorbed - check if this applies
   
5. AFTER INITIAL CONTACT - What happens NEXT?
   - Does defender stop the attack completely?
   - Does defender get overwhelmed by the attack?
   - Does anything continue moving forward after the interaction?
   - Where does the energy/momentum go?
   
6. NOW APPLY DECISION TREE based on your real-world analysis above:
   
   Step 1: INTERACTION CHECK - Can attacker meaningfully affect defender?
   - If NO (explain WHY: no single point of failure, physical can't affect digital, etc.) → neutral_no_damage
   - If YES → Continue to Step 2
   
   Step 2: BACKFIRE CHECK - Does defender AMPLIFY/FUEL/CONDUCT attacker AND is reaction significant?
   - ⚠️ CRITICAL: Must be FREE/ACCESSIBLE reactants, not bound in structures
   - ⚠️ CRITICAL: Must check SCALE - does reaction overwhelm defender or does defender overwhelm reaction?
   
   Examples:
   - Small water (cup/bucket) + sodium = BACKFIRE ✓ (comparable scales, reaction dominates) → backfire_win
   - Gasoline + fire = BACKFIRE ✓ (reaction dominates) → backfire_win
   - Ocean + sodium = NO BACKFIRE ✗ (ocean is billions of gallons, tiny reaction overwhelmed) → Continue to Step 3
   - Tree + sodium = NO BACKFIRE ✗ (moisture bound in cellulose) → Continue to Step 3
   
   If reaction would AMPLIFY and DOMINATE → backfire_win
   If reaction occurs but defender OVERWHELMS it → Continue to Step 3 (likely direct_win)
   
   Step 3: STOPPING CHECK - Does defender STOP the attack?
   - If defender CAN'T stop attack → direct_loss
   - If defender STOPS attack → Continue to Step 4
   - If BOTH destroy each other equally → mutual_destruction
   
   Step 4: CONTINUATION CHECK - Does defender continue forward to damage attacker's RED tower?
   - ⚠️ CRITICAL: Massive/physical concepts have MOMENTUM
   - Ocean stops fire → Ocean continues as wave → direct_win ✓
   - Ocean stops sodium → Ocean continues as tsunami → direct_win ✓
   - Shield blocks arrow → Shield rams forward → direct_win ✓
   - YouTube blocks nuke → YouTube has no physical form to continue → neutral_no_damage ✓
   - If defender CONTINUES forward and damages attacker's RED tower → direct_win
   - If defender STOPS but can't continue (no momentum/physical form) → neutral_no_damage
   
7. DETERMINE OUTCOME WITH FULL REASONING:
   - Based on your real-world analysis (steps 1-5), which outcome type applies?
   - Who wins/loses and WHY (based on actual physics/chemistry/logic)?
   - What damage amounts are appropriate?
   - Write your reasoning as if describing what ACTUALLY happened in reality
   - Don't just categorize - explain the actual mechanism and result

Provide your complete reasoning in the "reasoning" field (describe the real-world encounter), then the outcome data in JSON format.`;

    try {
        const startTime = Date.now();
        console.log('[Tier 1] Starting deep reasoning analysis...');
        
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
            max_tokens: CONFIG.TIER1_MAX_TOKENS,
            temperature: CONFIG.TEMPERATURE
        };
        
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
        
        const endTime = Date.now();
        console.log(`[Tier 1] Reasoning complete in ${endTime - startTime}ms`);
        console.log('[Tier 1] Raw Response:', content);
        
        const parsed = parseJSONResponse(content);
        console.log('[Tier 1] Reasoning:', parsed.reasoning);
        
        return parsed;
    } catch (error) {
        console.error('[Tier 1] Error:', error);
        throw error; // Propagate to main function for fallback handling
    }
}

// TIER 2: Distill Tier 1 reasoning into concise 25-35 word explanation with causal logic
async function callOpenAI_Tier2_Distill(tier1Result, attackingConcept, defendingConcept) {
    const systemPrompt = `You are a concise battle narrator. Your job is to distill technical reasoning into brief, educational explanation.

Rules:
- Write 2-3 sentences (25-35 words total) explaining WHAT happened, WHY, and WHAT NEXT
- ALWAYS include the causal logic - explain WHY the outcome happened
- State which tower was damaged: RED tower (AI/attacker) or BLUE tower (Player/defender)
- Be clear, educational, and accurate to the reasoning
- Don't use technical jargon - make it narrative and understandable
- Don't use phrases like "domain mismatch" - explain WHY in plain terms`;

    const userPrompt = `Convert this technical reasoning into a brief explanation (25-35 words):

REASONING FROM TIER 1:
${tier1Result.reasoning}

OUTCOME: ${tier1Result.outcome_type}
WINNER: ${tier1Result.winner}
CONCEPTS: ${attackingConcept} (attacker) vs ${defendingConcept} (defender)

Write explanation with 3 parts:
1. WHAT: What interaction happened
2. WHY: The logical reason for the outcome (explain the actual reason, not jargon)
3. THEN: What continued forward to damage which tower (RED = AI, BLUE = Player)

Examples:
- "Ocean extinguished fire completely. With nothing left to stop it, the massive wave surged forward to damage AI's RED tower!"
- "Small water bucket reacted explosively with sodium, amplifying the attack. The explosion occurred at Player's BLUE tower, causing major damage!"
- "Nuclear weapon can't destroy YouTube - there's no single point of failure across distributed servers. Both towers remain safe!"
- "Ocean neutralized sodium instantly - billions of gallons overwhelmed the tiny reaction. Tsunami continued forward, damaging AI's RED tower!"

Keep it 25-35 words. Include the causal logic (WHY). Never use jargon like "domain mismatch" - explain WHY.

Respond with VALID JSON ONLY (no markdown, no code blocks):
{
  "explanation": "Your brief sentence here"
}`;

    try {
        const startTime = Date.now();
        console.log('[Tier 2] Distilling reasoning to concise explanation...');
        
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
            max_tokens: CONFIG.TIER2_MAX_TOKENS,
            temperature: 0.8  // Slightly more creative for narrative
        };
        
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
        
        const endTime = Date.now();
        console.log(`[Tier 2] Distillation complete in ${endTime - startTime}ms`);
        console.log('[Tier 2] Raw Response:', content);
        
        // Parse JSON response
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }
        
        const parsed = JSON.parse(cleanContent);
        console.log('[Tier 2] Explanation:', parsed.explanation);
        
        return parsed;
    } catch (error) {
        console.error('[Tier 2] Error:', error);
        // Fallback: Use first sentence of reasoning
        const firstSentence = tier1Result.reasoning.split('.')[0] + '.';
        console.log('[Tier 2] Using fallback (first sentence of reasoning)');
        return {
            explanation: firstSentence.substring(0, 150) // Truncate if too long
        };
    }
}

// Call OpenAI API to determine battle outcome with JSON response
// MAIN ORCHESTRATOR: Uses two-tier system (Tier 1 reasoning + Tier 2 distillation)
async function callOpenAI(attackingConcept, defendingConcept) {
    // Get tutorial-specific guidance if in onboarding mode
    const tutorialGuidance = getTutorialOutcomeGuidance(attackingConcept, defendingConcept);
    
    // If in tutorial mode, check constraints
    const isOnboarding = tutorialGuidance && typeof isOnboardingActive === 'function' && isOnboardingActive();
    
    // ONBOARDING: Check if player followed hint - if yes, skip LLMs entirely
    if (isOnboarding) {
        const followedHint = defendingConcept.toLowerCase().trim() === tutorialGuidance.suggested_answer.toLowerCase().trim();
        const currentStep = typeof getCurrentStep === 'function' ? getCurrentStep() : 0;
        
        console.log(`[Onboarding Debug] Suggested: "${tutorialGuidance.suggested_answer}", Player used: "${defendingConcept}", Followed hint: ${followedHint}`);
        
        if (followedHint) {
            // Player followed hint - use hardcoded tutorial outcome, skip both Tier 1 and Tier 2
            console.log('[Onboarding] Player followed hint - using hardcoded tutorial outcome (skipping both LLM tiers)');
            
            // Generate simple explanation based on outcome type
            let explanation = '';
            if (tutorialGuidance.outcome_type === 'direct_win') {
                explanation = `${defendingConcept} defeats ${attackingConcept} and continues forward to damage AI's tower!`;
            } else if (tutorialGuidance.outcome_type === 'backfire_win') {
                explanation = `${defendingConcept} reacts with ${attackingConcept}, causing an explosion at your tower!`;
            } else if (tutorialGuidance.outcome_type === 'neutral_no_damage') {
                explanation = `${attackingConcept} cannot meaningfully affect ${defendingConcept} - both towers remain safe!`;
            } else if (tutorialGuidance.outcome_type === 'mutual_destruction') {
                explanation = `${defendingConcept} and ${attackingConcept} collide with equal force - both towers damaged!`;
            }
            
            // Return hardcoded result immediately - no LLM calls needed
            return {
                winner: tutorialGuidance.winner,
                outcome_type: tutorialGuidance.outcome_type,
                attacker_damage: tutorialGuidance.attacker_damage,
                defender_damage: tutorialGuidance.defender_damage,
                damage_amount: tutorialGuidance.damage_amount,
                explanation: explanation,
                teaching_point: tutorialGuidance.lesson_focus,
                reasoning_debug: `[Hardcoded onboarding result - player followed hint]`
            };
        } else {
            // Player went off-script - will use Tier 1 + Tier 2 with tutorial context
            console.log('[Onboarding] Player went off-script - using two-tier system with tutorial context');
        }
    }
    
    // TWO-TIER SYSTEM: Call Tier 1 for reasoning, then Tier 2 for distillation
    try {
        console.log('[Two-Tier] Starting Tier 1 (Deep Reasoning)...');
        
        // TIER 1: Deep chain-of-thought reasoning
        const tier1Result = await callOpenAI_Tier1_Reasoning(
            attackingConcept, 
            defendingConcept, 
            isOnboarding ? tutorialGuidance : null
        );
        
        console.log('[Two-Tier] Tier 1 complete. Starting Tier 2 (Distillation)...');
        
        // TIER 2: Distill reasoning into concise explanation
        const tier2Result = await callOpenAI_Tier2_Distill(
            tier1Result,
            attackingConcept,
            defendingConcept
        );
        
        console.log('[Two-Tier] Tier 2 complete. Combining results...');
        
        // COMBINE RESULTS: Outcome from Tier 1, Explanation from Tier 2
        const combinedResult = {
            outcome_type: tier1Result.outcome_type,
            winner: tier1Result.winner,
            attacker_damage: tier1Result.attacker_damage,
            defender_damage: tier1Result.defender_damage,
            damage_amount: tier1Result.damage_amount,
            explanation: tier2Result.explanation,
            teaching_point: tier1Result.reasoning.split('.')[0] + '.', // First sentence as teaching point
            reasoning_debug: tier1Result.reasoning  // For debugging and lesson generation
        };
        
        console.log('[Two-Tier] Combined result:', {
            outcome_type: combinedResult.outcome_type,
            winner: combinedResult.winner,
            explanation: combinedResult.explanation
        });
        
        if (isOnboarding) {
            console.log('[Onboarding] LLM generated explanation:', combinedResult.explanation);
        }
        
        return combinedResult;
        
    } catch (error) {
        console.error('[Two-Tier] Error in two-tier system:', error);
        
        // Fallback response - neutral no damage
        return {
            winner: 'none',
            outcome_type: 'neutral_no_damage',
            attacker_damage: 0,
            defender_damage: 0,
            damage_amount: 0,
            explanation: 'Unable to connect to AI. No damage to either tower.',
            teaching_point: 'Connection error occurred.',
            reasoning_debug: '[Error: Failed to complete two-tier reasoning]'
        };
    }
}

// OLD CODE BELOW - KEEPING FOR REFERENCE BUT NOT USED
// (Can be deleted after testing confirms two-tier system works)
/*
// OLD SINGLE-TIER IMPLEMENTATION
async function callOpenAI_OLD_SINGLE_TIER(attackingConcept, defendingConcept) {
    let systemPrompt = `You are an advanced battle logic system that analyzes real-world interactions between ANY concepts.

Your job: Determine how two concepts would interact in a battle, considering physics, chemistry, logic, and domain compatibility.`;
    
    systemPrompt += `

## THE 5 OUTCOME TYPES:

### 1. DIRECT_WIN (Defender Wins)
- Defender's concept cleanly dominates and pushes through to damage attacker's castle
- Defender takes 0 damage, attacker takes full damage
- Defense neutralizes the threat AND continues forward to damage attacker's tower
- Example: Water vs Fire → Water extinguishes fire, flows forward (AI's RED tower damaged)
- Example: Shield vs Arrow → Shield blocks arrow and rams forward (AI's RED tower damaged)
- Key: DEFENDER wins, their concept continues and hits ATTACKER's castle

### 2. DIRECT_LOSS (Defender Loses)
- Defender's concept simply FAILS to stop the attack
- Attacker takes 0 damage, defender takes full damage
- Defense is ineffective and attack reaches defender's tower
- Example: Fire vs Tree → Tree burns, can't stop fire (PLAYER's BLUE tower damaged)
- Example: Lava vs Rock → Rock melts, can't resist heat (PLAYER's BLUE tower damaged)
- Example: Sword vs Paper → Paper is cut through (PLAYER's BLUE tower damaged)
- Key: DEFENDER loses because their concept simply CAN'T stop the attack (NOT amplification)
- NOT backfire - just simple failure

### 3. BACKFIRE_WIN (Defender Loses Worse)
- Defender's concept AMPLIFIES, FUELS, or CONDUCTS the attacker's threat
- Defender takes full damage BECAUSE their defense made it WORSE
- Attacker wins because defender's choice actively helped the attack
- Key indicators: Chemical reaction, conductivity, amplification, catalyst effect
- **REQUIRES FREE/ACCESSIBLE reactants** - bound materials in structures don't count
- **REQUIRES COMPARABLE SCALE** - if defender is vastly larger, it overwhelms the reaction
- Example: Sodium vs SMALL WATER (cup/bucket) → Water reacts explosively (BACKFIRE)
- Example: Gasoline vs Fire → Gasoline IGNITES explosively (BACKFIRE)
- Example: Metal Rod vs Lightning → Metal CONDUCTS electricity perfectly (BACKFIRE)
- Counter-example: Sodium vs OCEAN → Ocean is billions of gallons, tiny reaction is overwhelmed, ocean continues as tsunami (DIRECT_WIN not BACKFIRE)
- Counter-example: Sodium vs Tree → Tree just burns, moisture is bound in cellulose (DIRECT_LOSS not BACKFIRE)
- Counter-example: Fire vs Wet Cloth → Cloth burns, water evaporates (DIRECT_LOSS not BACKFIRE)
- Key: Defense doesn't just fail - it actively AMPLIFIES the damage AND the reaction isn't overwhelmed by defender's massive scale

### 4. NEUTRAL_NO_DAMAGE
- Attack is INEFFECTIVE - happens but causes no damage to either tower
- Both take 0 damage
- Defense stops attack BUT has no momentum/means to continue forward to damage attacker's RED tower
- Example: Nuclear Weapon vs YouTube → YouTube has no single point of failure across distributed servers (both safe)
- Example: Physical attack vs Decentralized system → No single target to hit, attack can't locate what to destroy (both safe)
- Example: Sword vs Concept of Love → Physical blade can't cut abstract emotion, they exist in different realms (both safe)
- IMPORTANT: Don't use this if defender can continue forward after stopping attack - that's DIRECT_WIN!

### 5. MUTUAL_DESTRUCTION
- Both concepts destroy each other symmetrically
- Both take equal damage
- Neither dominates, both are damaged
- Example: Nuke vs Nuke → Both explode (both damaged)
- Example: Fire vs Fire → Both burn together (both damaged)
- Example: Black Hole vs Black Hole → Both collapse into each other (both damaged)

## CRITICAL RULES:

1. **Win vs Loss vs Backfire** (Tower Colors: Attacker/AI = RED, Defender/Player = BLUE): 
   - DIRECT_WIN: Defender wins → Attacker's RED tower (AI) damaged
   - DIRECT_LOSS: Defender loses simply → Defender's BLUE tower (Player) damaged - defense just fails
   - BACKFIRE_WIN: Defender loses badly → Defender's BLUE tower (Player) damaged - defense amplifies attack
   
2. **Backfire Detection** (MOST IMPORTANT):
   Only use BACKFIRE_WIN if defender's concept actively AMPLIFIES/FUELS/CONDUCTS AND reaction dominates.
   - Must involve FREE/ACCESSIBLE reactants (not bound in structures)
   - Must create chemical reaction, conductivity, or amplification
   - **Must check SCALE: If defender is VASTLY larger, it overwhelms the reaction → DIRECT_WIN, not backfire**
   - Examples of BACKFIRE: Small water + sodium, gasoline + fire, metal rod + lightning (comparable scales)
   - Examples of NOT BACKFIRE: 
     * Ocean + sodium (ocean is planetary scale, overwhelms tiny reaction) → DIRECT_WIN
     * Tree + sodium (moisture bound) → DIRECT_LOSS
     * Wet cloth + fire (just burns) → DIRECT_LOSS
   - **When in doubt: Check if defender's scale overwhelms the reaction → DIRECT_WIN. If it just fails → DIRECT_LOSS**
   - Simple failure = DIRECT_LOSS, NOT backfire
   
3. **Ineffective Attacks**: Use NEUTRAL_NO_DAMAGE when attack cannot succeed due to:
   - No single point of failure (decentralized systems)
   - Physical attacks can't affect abstract/digital concepts
   - Concepts exist in different realms (physical vs emotional, material vs digital)
   - ALWAYS explain WHY the attack is ineffective, don't just say "incompatible"

4. **Clear Winner**: Explanation MUST state who wins and which tower(s) are damaged (BLUE = player, RED = AI)

5. **Damage Logic**: 
   - DIRECT_WIN: 20-40 damage to RED tower (attacker) only
   - DIRECT_LOSS: 20-40 damage to BLUE tower (defender) only
   - BACKFIRE_WIN: 25-40 damage to BLUE tower (defender) only - usually higher damage
   - NEUTRAL_NO_DAMAGE: 0 damage to both
   - MUTUAL_DESTRUCTION: 15-30 damage to BOTH towers

## RESPONSE FORMAT:

Respond with VALID JSON ONLY (no markdown, no code blocks):

{
  "winner": "attacker" | "defender" | "none",
  "outcome_type": "direct_win" | "direct_loss" | "backfire_win" | "neutral_no_damage" | "mutual_destruction",
  "attacker_damage": 0 | 1,
  "defender_damage": 0 | 1,
  "damage_amount": 0-40,
  "explanation": "Clear sentence: WHO wins, WHAT happens, WHICH tower(s) damaged (BLUE=player, RED=AI)",
  "teaching_point": "What this teaches about concept interactions"
}

IMPORTANT MAPPING:
- outcome_type="direct_win" → winner="defender", defender_damage=0, attacker_damage=1
- outcome_type="direct_loss" → winner="attacker", defender_damage=1, attacker_damage=0  
- outcome_type="backfire_win" → winner="attacker", defender_damage=1, attacker_damage=0
- outcome_type="neutral_no_damage" → winner="none", both damage=0
- outcome_type="mutual_destruction" → winner="none", both damage=1`;

    let userPrompt = `Analyze this battle:

AI (Red Tower) attacks with: "${attackingConcept}"
PLAYER (Blue Tower) defends with: "${defendingConcept}"`;
    
    // Include decision tree for normal gameplay OR when player went off-script in onboarding
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
    
    userPrompt += `

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
        
        const parsed = parseJSONResponse(content);
        
        if (isOnboarding) {
            console.log('[Onboarding] LLM generated explanation:', parsed.explanation);
        }
        
        return parsed;
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
*/
// END OF OLD SINGLE-TIER CODE (commented out for reference)

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
        const validOutcomes = ['direct_win', 'direct_loss', 'backfire_win', 'neutral_no_damage', 'mutual_destruction'];
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
        } else if (lowerContent.includes('player wins') || lowerContent.includes('defender wins') || lowerContent.includes('blue tower safe')) {
            outcome_type = 'direct_win';
            winner = 'defender';
            attacker_damage = 1;
            damage_amount = 30;
        } else if (lowerContent.includes('ai wins') || lowerContent.includes('attacker wins') || lowerContent.includes('defense fails') || lowerContent.includes('blue tower damaged')) {
            // Check for backfire keywords - if present, use backfire, otherwise direct_loss
            if (lowerContent.includes('backfire') || lowerContent.includes('amplif') || lowerContent.includes('fuel')) {
                outcome_type = 'backfire_win';
            } else {
                outcome_type = 'direct_loss';
            }
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

// Generate dynamic lesson message for onboarding using LLM
async function generateLessonMessage(attackingConcept, defendingConcept, battleResult, tier1Reasoning = null) {
    // Check if we're in onboarding mode
    if (typeof isOnboardingActive === 'function' && !isOnboardingActive()) {
        return null;
    }
    
    const tutorialGuidance = getTutorialOutcomeGuidance(attackingConcept, defendingConcept);
    if (!tutorialGuidance) {
        return null;
    }
    
    const currentStep = typeof getCurrentStep === 'function' ? getCurrentStep() : 0;
    const isLastStep = currentStep === 5;
    
    // Check if player followed the hint
    const followedHint = defendingConcept.toLowerCase().trim() === tutorialGuidance.suggested_answer.toLowerCase().trim();
    
    console.log(`[Lesson Generator] Attack: "${attackingConcept}", Defend: "${defendingConcept}", Suggested: "${tutorialGuidance.suggested_answer}"`);
    console.log(`[Lesson Generator] Followed hint: ${followedHint}, Outcome: ${battleResult.outcome_type}`);
    console.log(`[Lesson Generator] Battle explanation was: "${battleResult.explanation}"`);
    if (tier1Reasoning) {
        console.log(`[Lesson Generator] Has Tier 1 reasoning context available`);
    }
    
    const systemPrompt = `You are a friendly, concise game tutorial instructor.

${tier1Reasoning ? 'You have access to the battle\'s internal reasoning - use it for context and deeper understanding of what happened.' : ''} 

Rules:
- ALWAYS start with "YOU LEARNED:" then outcome (e.g., "YOU LEARNED: 💀 DIRECT LOSS - Tree burned, fire damaged your tower!")
- NEVER say "BACKFIRE WIN" - just say "BACKFIRE" (it's a loss for player, no "win")
- NEVER say "DIRECT WIN" or "DIRECT LOSS" - just say "VICTORY" or "DEFEATED"
- ALWAYS say "your tower" not "blue tower" (player is blue team)
- ALWAYS say "AI's tower" not "red tower" (AI is red team)
- Be conversational and acknowledge player choices NATURALLY
- Recognize when player found equivalent solution (same outcome = smart choice!)
- Keep explanations SHORT (2-3 sentences max)
- Flow naturally, don't follow rigid templates

OUTCOME LABELS FOR PLAYER:
- direct_win → "✅ VICTORY"
- direct_loss → "💀 DEFEATED"
- backfire_win → "💥 BACKFIRE" (NOT "BACKFIRE WIN")
- neutral_no_damage → "🚫 INEFFECTIVE"
- mutual_destruction → "⚔️ MUTUAL DESTRUCTION"`;

    let userPrompt = '';
    
    if (followedHint) {
        // They followed the hint - simple congratulatory message
        userPrompt = `Write a SHORT lesson (2-3 sentences):

Battle outcome: ${battleResult.outcome_type}
What happened: ${battleResult.explanation}
Lesson to teach: ${tutorialGuidance.lesson_focus}

${tier1Reasoning ? `INTERNAL REASONING (for context):
${tier1Reasoning}

` : ''}Format: 
YOU LEARNED: Emoji [OUTCOME LABEL]

Use these exact labels:
- ✅ VICTORY (for direct_win)
- 💀 DEFEATED (for direct_loss)
- 💥 BACKFIRE (for backfire_win - NOT "BACKFIRE WIN")
- 🚫 INEFFECTIVE (for neutral_no_damage)
- ⚔️ MUTUAL DESTRUCTION (for mutual_destruction)

Great! You followed the hint. [2 sentences explaining the mechanic]

Remember: Say "your tower" (player is blue), say "AI's tower" (AI is red).`;
    } else {
        // They didn't follow hint - check if they got same outcome
        const sameOutcome = battleResult.outcome_type === tutorialGuidance.outcome_type;
        
        userPrompt = `Player used "${defendingConcept}" instead of suggested "${tutorialGuidance.suggested_answer}".

What ACTUALLY happened:
- Outcome: ${battleResult.outcome_type}
- Result: ${battleResult.explanation}

${tier1Reasoning ? `INTERNAL REASONING (for context):
${tier1Reasoning}

` : ''}What we WANTED to teach: ${tutorialGuidance.lesson_focus}
Expected outcome: ${tutorialGuidance.outcome_type}

${sameOutcome ? 
    `✅ SAME OUTCOME! Player achieved the intended outcome with different concept.` :
    `⚠️ DIFFERENT OUTCOME! Player got ${battleResult.outcome_type} instead of ${tutorialGuidance.outcome_type}.`}

Write SHORT, NATURAL lesson (2-3 sentences):

1. First line: "YOU LEARNED: Emoji [OUTCOME LABEL] - Brief what happened"
   Use labels: ✅ VICTORY, 💀 DEFEATED, 💥 BACKFIRE, 🚫 INEFFECTIVE, ⚔️ MUTUAL DESTRUCTION
   Say "your tower" not "blue tower", "AI's tower" not "red tower"

2. Second part - ADAPT based on outcome match:
   
   IF SAME OUTCOME (they got it right with different concept):
   - Start naturally: "Smart choice!", "Nice!", "Great thinking!", "Excellent!"
   - Acknowledge similarity: "${defendingConcept} works like ${tutorialGuidance.suggested_answer}..."
   - Or: "I suggested ${tutorialGuidance.suggested_answer}, but ${defendingConcept} demonstrates the same principle!"
   - Keep it SHORT and positive
   
   IF DIFFERENT OUTCOME (they got different result):
   - Acknowledge what happened: "I see ${defendingConcept} led to a different result..."
   - Briefly note intended lesson: "I suggested ${tutorialGuidance.suggested_answer} to show ${tutorialGuidance.lesson_focus.split('-')[0]}"
   - Keep it educational but not harsh

NO rigid structure. Flow naturally. 2-3 sentences total.`;
    }
    
    if (isLastStep) {
        userPrompt += `

IMPORTANT: This is the FINAL step. End with:

"🎓 TUTORIAL COMPLETE!
You've mastered all 5 outcome types:
✅ Direct Win | 💀 Direct Loss | 💥 Backfire | 🚫 Ineffective | ⚔️ Mutual Destruction

⚔️ REAL GAME STARTS NOW! Be creative - anything works!"`;
    }
    
    userPrompt += `

Keep it SHORT and clear.`;

    try {
        console.log('[Onboarding] Generating dynamic lesson message with LLM...');
        
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
            max_tokens: 200,  // Reduced for shorter, more concise lessons
            temperature: 0.7
        };
        
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
        const lessonMessage = data.choices[0].message.content.trim();
        
        console.log('[Onboarding] Generated lesson message:', lessonMessage);
        
        return lessonMessage;
        
    } catch (error) {
        console.error('[Onboarding] Error generating lesson message:', error);
        
        // Fallback to a concise personalized message
        const emoji = {
            'direct_win': '✅',
            'direct_loss': '💀',
            'backfire_win': '💥',
            'neutral_no_damage': '🚫',
            'mutual_destruction': '⚔️'
        }[battleResult.outcome_type] || '⚔️';
        
        const outcomeLabel = battleResult.outcome_type.replace(/_/g, ' ').toUpperCase();
        
        // Replace "blue tower" with "your tower" and "red tower" with "AI's tower"
        const playerFriendlyExplanation = battleResult.explanation
            .replace(/blue tower/gi, 'your tower')
            .replace(/red tower/gi, "AI's tower")
            .replace(/defender's tower/gi, 'your tower')
            .replace(/attacker's tower/gi, "AI's tower");
        
        // Convert technical outcome names to player-friendly labels
        const playerFriendlyLabels = {
            'DIRECT WIN': 'VICTORY',
            'DIRECT LOSS': 'DEFEATED',
            'BACKFIRE WIN': 'BACKFIRE',
            'NEUTRAL NO DAMAGE': 'INEFFECTIVE',
            'MUTUAL DESTRUCTION': 'MUTUAL DESTRUCTION'
        };
        const friendlyLabel = playerFriendlyLabels[outcomeLabel] || outcomeLabel;
        
        if (followedHint) {
            return `YOU LEARNED: ${emoji} ${friendlyLabel}

${playerFriendlyExplanation}

Great! This demonstrates ${tutorialGuidance.lesson_focus}.`;
        } else {
            // Check if they achieved same outcome
            const sameOutcome = battleResult.outcome_type === tutorialGuidance.outcome_type;
            
            if (sameOutcome) {
                return `YOU LEARNED: ${emoji} ${friendlyLabel}

${playerFriendlyExplanation}

Smart choice! ${defendingConcept} works similarly to ${tutorialGuidance.suggested_answer}. This demonstrates ${tutorialGuidance.lesson_focus}.`;
            } else {
                return `YOU LEARNED: ${emoji} ${friendlyLabel}

${playerFriendlyExplanation}

I suggested ${tutorialGuidance.suggested_answer} to demonstrate ${tutorialGuidance.lesson_focus.split(' - ')[0]}, but ${defendingConcept} led to a different outcome.`;
            }
        }
    }
}

