// LLM Service
// Handles OpenAI API integration and response parsing

// Call OpenAI API to determine battle outcome
async function callOpenAI(attackingConcept, defendingConcept) {
    const prompt = `You are a battle logic system. Analyze how these two concepts would interact in a battle:

Attacking: "${attackingConcept}"
Defending: "${defendingConcept}"

Provide ONE SHORT SENTENCE (maximum 15 words) explaining which wins and why, based on real-world properties.

Then give a verdict: Does the attack DEFEAT the defense, get BLOCKED by it, or is it NEUTRAL (both persist)?

Format your response EXACTLY as:
REASONING: [one short sentence, max 15 words]
OUTCOME: [DEFEAT/BLOCKED/NEUTRAL]
DAMAGE: [0-40, based on effectiveness]`;

    try {
        // Debug: Check if API key is loaded
        console.log('USE_AZURE:', CONFIG.USE_AZURE);
        console.log('API Key exists:', !!CONFIG.OPENAI_API_KEY);
        console.log('API Key length:', CONFIG.OPENAI_API_KEY?.length);
        console.log('API Key starts with:', CONFIG.OPENAI_API_KEY?.substring(0, 10));
        
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
                    content: 'You are a battle logic system that analyzes real-world interactions between concepts. Always format your response with REASONING:, OUTCOME:, and DAMAGE: labels.'
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

