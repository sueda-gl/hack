// LLM Service
// Handles OpenAI API integration and response parsing

// Get tutorial-specific system prompt enhancement
function getTutorialGuidance(attackingConcept, defendingConcept) {
    // Check if we're in onboarding mode
    if (typeof isOnboardingActive === 'function' && !isOnboardingActive()) {
        return ''; // Normal gameplay - no special guidance
    }
    
    const currentStep = typeof getCurrentStep === 'function' ? getCurrentStep() : -1;
    
    // Provide specific guidance for each tutorial battle
    const tutorialGuidance = {
        0: `TUTORIAL CONTEXT: This is teaching basic elemental dominance. 
Fire vs Water should result in Water winning because water naturally extinguishes fire through cooling and smothering.
REASONING MUST SAY: "Player wins! Water extinguishes fire. AI's red tower damaged!"
OUTCOME: BLOCKED (Player defends successfully, AI's tower takes damage)`,
        
        1: `TUTORIAL CONTEXT: This teaches unexpected chemical reactions.
Sodium vs Water creates a violent explosive reaction releasing hydrogen gas and heat.
REASONING MUST SAY: "Both damaged! Sodium + Water explodes violently. Both towers hit!"
OUTCOME: NEUTRAL (Both towers take damage from explosion)`,
        
        2: `TUTORIAL CONTEXT: This teaches physical vs digital concepts.
Nuclear Weapon vs YouTube: YouTube is decentralized across thousands of servers worldwide.
REASONING MUST SAY: "Player wins! YouTube is distributed globally. AI's red tower damaged!"
OUTCOME: BLOCKED (Player defends successfully, AI's tower takes damage)`,
        
        3: `TUTORIAL CONTEXT: This teaches environmental multipliers and synergy.
Echo Chamber vs Duck: Echo chambers amplify sound infinitely. A duck's quack would multiply endlessly, collapsing the chamber.
REASONING MUST SAY: "Player wins! Duck's quack amplifies infinitely. AI's red tower damaged!"
OUTCOME: BLOCKED (Player defends successfully, AI's tower takes damage)`,
        
        4: `TUTORIAL CONTEXT: This teaches instinct-driven behavior.
Laser Pointer vs Cat: Cats have an uncontrollable hunting instinct triggered by laser pointers.
REASONING MUST SAY: "Player wins! Cat's hunting instinct counters laser perfectly. AI's red tower damaged!"
OUTCOME: BLOCKED (Player defends successfully, AI's tower takes damage)`
    };
    
    return tutorialGuidance[currentStep] || '';
}

// Call OpenAI API to determine battle outcome
async function callOpenAI(attackingConcept, defendingConcept) {
    // Get tutorial-specific guidance if in onboarding mode
    const tutorialContext = getTutorialGuidance(attackingConcept, defendingConcept);
    
    const prompt = `You are a battle logic system. Analyze how these two concepts would interact in a battle:

AI (Red Tower) attacks with: "${attackingConcept}"
PLAYER (Blue Tower) defends with: "${defendingConcept}"

${tutorialContext ? '\n' + tutorialContext + '\n' : ''}

Provide ONE SHORT SENTENCE (maximum 15 words) that MUST clearly state:
1. WHO WINS (Player or AI)
2. WHICH TOWER takes damage (Player's Blue Tower OR AI's Red Tower)
3. WHY based on real-world properties

Examples of clear reasoning:
- "Player wins! Water extinguishes fire. AI's red tower damaged!"
- "AI wins! Fire burns wood. Player's blue tower damaged!"
- "Both damaged! Explosion hits both red and blue towers!"

Then give a verdict:
- DEFEAT = AI wins, Player's blue tower takes damage
- BLOCKED = Player wins, AI's red tower takes damage
- NEUTRAL = Both towers take damage

Format your response EXACTLY as:
REASONING: [one clear sentence stating winner and which tower damaged, max 15 words]
OUTCOME: [DEFEAT/BLOCKED/NEUTRAL]
DAMAGE: [0-40, based on effectiveness]`;

    try {
        // Debug: Check if API key is loaded
        console.log('USE_AZURE:', CONFIG.USE_AZURE);
        console.log('API Key exists:', !!CONFIG.OPENAI_API_KEY);
        console.log('API Key length:', CONFIG.OPENAI_API_KEY?.length);
        console.log('API Key starts with:', CONFIG.OPENAI_API_KEY?.substring(0, 10));
        
        if (tutorialContext) {
            console.log('[Onboarding] Using tutorial-specific LLM guidance');
        }
        
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
        console.log('Endpoint:', endpoint);
        
        const requestBody = {
            messages: [
                {
                    role: 'system',
                    content: 'You are a battle logic system that analyzes real-world interactions between concepts. Always format your response with REASONING:, OUTCOME:, and DAMAGE: labels. When tutorial context is provided, follow it precisely to ensure educational consistency.'
                },
                {
                    role: 'user',
                    content: prompt
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
        
        return parseAIResponse(content);
    } catch (error) {
        console.error('OpenAI API Error:', error);
        // Fallback response
        return {
            reasoning: 'Unable to connect to AI. Using default logic.',
            outcome: 'NEUTRAL',
            damage: 20
        };
    }
}

// Parse the AI response into structured data
function parseAIResponse(content) {
    try {
        const reasoningMatch = content.match(/REASONING:\s*(.+?)(?=OUTCOME:|$)/s);
        const outcomeMatch = content.match(/OUTCOME:\s*(DEFEAT|BLOCKED|NEUTRAL)/i);
        const damageMatch = content.match(/DAMAGE:\s*(\d+)/);

        const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'Analysis complete.';
        const outcome = outcomeMatch ? outcomeMatch[1].toUpperCase() : 'NEUTRAL';
        const damage = damageMatch ? parseInt(damageMatch[1]) : 20;

        return {
            reasoning,
            outcome,
            damage: Math.min(Math.max(damage, 0), 40) // Clamp between 0-40
        };
    } catch (error) {
        console.error('Parse error:', error);
        return {
            reasoning: 'Unable to parse AI response.',
            outcome: 'NEUTRAL',
            damage: 20
        };
    }
}

