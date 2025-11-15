// AI Opponent System
// Handles AI opponent behavior, attacks, and timer management

// Select random concept from materials database
function selectRandomConcept() {
    if (!MATERIALS_DATABASE || MATERIALS_DATABASE.length === 0) {
        // Fallback concepts if database not loaded
        const fallbackConcepts = ['Fire', 'Water', 'Wolf', 'Rock', 'Lightning', 'Ice', 'Wind', 'Dragon'];
        return fallbackConcepts[Math.floor(Math.random() * fallbackConcepts.length)];
    }
    
    const randomIndex = Math.floor(Math.random() * MATERIALS_DATABASE.length);
    return MATERIALS_DATABASE[randomIndex].name;
}

// Start AI attack sequence
async function initiateAIAttack() {
    if (gameState.isProcessing || gameState.aiAttacking) {
        console.log('AI attack skipped - already processing');
        return;
    }
    
    console.log('AI initiating attack...');
    gameState.aiAttacking = true;
    
    // Select AI concept
    const aiConcept = selectRandomConcept();
    console.log(`AI selected: ${aiConcept}`);
    
    // Show AI thinking
    showAIThinking('red');
    
    // Small delay to show thinking animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Start AI walk sequence
    await startAIWalkSequence(aiConcept, 'red');
}

// Start AI walking sequence (4 seconds)
async function startAIWalkSequence(concept, team) {
    console.log(`Starting AI walk sequence with: ${concept}`);
    
    // Create the AI character
    const aiCharacter = await createAttackVisual(concept, team);
    aiCharacter.userData.team = team; // Store team for rotation logic
    gameState.aiWalkingCharacter = aiCharacter;
    
    // Store AI concept for battle
    gameState.currentActiveAttack = {
        concept: concept,
        team: team,
        visual: aiCharacter
    };
    
    // Display concept immediately
    displayConcept(concept, team, 'attacking');
    showMessage(`⚔️ ${concept} approaching!`, team);
    
    // Spawn character at AI tower and start walking
    if (typeof spawnAndWalkCharacter === 'function') {
        spawnAndWalkCharacter(aiCharacter, team, 10000); // 10 second walk
    }
    
    // Start player response timer
    startResponseTimer(10000);
}

// Start countdown timer for player response
function startResponseTimer(duration) {
    console.log('Starting player response timer:', duration, 'ms');
    gameState.responseTimeRemaining = duration;
    
    // Clear any existing timer
    if (gameState.playerResponseTimer) {
        clearInterval(gameState.playerResponseTimer);
    }
    
    // Update timer display
    updateTimerDisplay(duration);
    
    // Show timer UI
    const timerEl = document.getElementById('response-timer');
    if (timerEl) {
        timerEl.style.display = 'block';
    }
    
    // Countdown interval (update every 100ms for smooth animation)
    const startTime = Date.now();
    gameState.playerResponseTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        gameState.responseTimeRemaining = remaining;
        
        updateTimerDisplay(remaining);
        
        if (remaining <= 0) {
            clearInterval(gameState.playerResponseTimer);
            handleTimeout();
        }
    }, 100);
}

// Handle player timeout (no response in 4 seconds)
async function handleTimeout() {
    console.log('Player timeout - no response!');
    
    hideTimerDisplay();
    
    // Show message
    showMessage('⚠️ UNDEFENDED!', 'blue');
    showMessage('💥 Direct hit!', 'red');
    
    // Move AI character to player tower and deal direct damage
    const aiConcept = gameState.currentActiveAttack ? gameState.currentActiveAttack.concept : 'Attack';
    
    // Apply guaranteed damage
    updateHealth('blue', 20);
    
    // Create impact at player tower
    const blueTower = towers.find(t => t.userData.team === 'blue');
    if (blueTower && typeof createImpactEffect === 'function') {
        const towerPos = blueTower.position.clone();
        towerPos.y += 10;
        createImpactEffect(towerPos, 'red');
    }
    
    // Remove AI character
    if (gameState.aiWalkingCharacter && scene) {
        scene.remove(gameState.aiWalkingCharacter);
    }
    
    // Add to battle history
    addToBattleHistory(aiConcept, 'No Defense', 'The attack reached the tower unopposed.', '💥 Direct Tower Hit!', 20);
    
    // Reset state and trigger next AI attack
    gameState.currentActiveAttack = null;
    gameState.aiAttacking = false;
    gameState.aiWalkingCharacter = null;
    clearInputs();
    
    // Wait a moment, then start next AI attack
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if game is over
    if (gameState.blueHealth > 0 && gameState.redHealth > 0) {
        initiateAIAttack();
    }
}

