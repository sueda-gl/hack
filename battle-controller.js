// Battle Controller
// Main battle orchestration - coordinates attack input and battle flow

// Handle attack input from a team (PLAYER ONLY in single-player mode)
async function handleAttackInput(concept, team) {
    console.log(`Attack input from ${team}: "${concept}"`);
    
    // Only allow blue team (player) to input
    if (team !== 'blue') {
        console.log('Red team is AI controlled, ignoring input');
        return;
    }
    
    if (!concept || concept.trim().length === 0) {
        showMessage('Please enter a concept!', team);
        return;
    }

    concept = concept.trim();

    // If already processing battle, ignore
    if (gameState.isProcessing) {
        showMessage('Battle in progress...', team);
        return;
    }

    // Check if AI is attacking and player is responding within time window
    if (gameState.aiAttacking && gameState.currentActiveAttack && gameState.currentActiveAttack.team === 'red') {
        console.log(`Player responding to AI attack with: ${concept}`);
        
        // Cancel the timeout timer
        if (gameState.playerResponseTimer) {
            clearInterval(gameState.playerResponseTimer);
            gameState.playerResponseTimer = null;
        }
        hideTimerDisplay();
        
        // Lock input and show player concept
        displayConcept(concept, 'blue', 'defending');
        showMessage(`🛡️ ${concept} defending!`, 'blue');
        
        // Disable input field
        const blueInput = document.getElementById('blue-input');
        if (blueInput) {
            blueInput.disabled = true;
        }
        
        // Start battle resolution
        gameState.isProcessing = true;
        
        const attackingConcept = gameState.currentActiveAttack.concept; // AI's concept
        const defendingConcept = concept; // Player's concept
        const attackingTeam = 'red';
        const defendingTeam = 'blue';

        // Show thinking indicator
        showMessage('🤔 Analyzing interaction...', 'blue');
        showMessage('🤔 Analyzing interaction...', 'red');

        try {
            // Create player's visual
            const defendVisual = await createAttackVisual(defendingConcept, defendingTeam);
            defendVisual.userData.team = defendingTeam;
            
            // Get AI's already created visual
            const attackVisual = gameState.aiWalkingCharacter || gameState.currentActiveAttack.visual;
            if (attackVisual) {
                attackVisual.userData.team = attackingTeam;
            }
            
            // Stop AI walking animation and spawn player character
            if (typeof stopAIWalkAndStartBattle === 'function') {
                await stopAIWalkAndStartBattle(attackVisual, defendVisual, attackingTeam, defendingTeam);
            } else {
                // Fallback: use existing animation
                console.log('Launching projectiles to center...');
                await Promise.all([
                    animateAttack(attackVisual, attackingTeam, defendingTeam),
                    animateAttack(defendVisual, defendingTeam, attackingTeam)
                ]);
            }
            
            // Call LLM with new 4-outcome system
            const result = await callOpenAI(attackingConcept, defendingConcept);
            
            console.log('[4-Outcome System] Result:', result);
            
            // Extract new JSON structure
            const { winner, outcome_type, attacker_damage, defender_damage, damage_amount, explanation, teaching_point } = result;
            
            // Display reasoning with outcome label
            displayReasoningWithOutcome(explanation, outcome_type, 'blue');
            displayReasoningWithOutcome(explanation, outcome_type, 'red');
            
            console.log('Projectiles reached center, showing collision...');
            
            // Handle each of the 4 outcome types
            switch(outcome_type) {
                case 'direct_win':
                    console.log('[DIRECT_WIN] Clean victory');
                    // Show collision with winner
                    const directWinner = winner === 'attacker' ? 'red' : 'blue';
                    await createCenterCollision(attackVisual, defendVisual, directWinner);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Apply damage to loser only
                    if (attacker_damage === 1) {
                        updateHealth('red', damage_amount);
                        await sendImpactWaveToTower('red');
                    }
                    if (defender_damage === 1) {
                        updateHealth('blue', damage_amount);
                        await sendImpactWaveToTower('blue');
                    }
                    
                    // Show messages
                    showMessage(`✨ ${explanation}`, 'blue');
                    showMessage(`✨ ${explanation}`, 'red');
                    break;
                    
                case 'backfire_win':
                    console.log('[BACKFIRE_WIN] Defender\'s choice backfired!');
                    // Show backfire explosion at defender's location
                    await createBackfireCollision(attackVisual, defendVisual);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Defender takes damage from backfire
                    if (defender_damage === 1) {
                        updateHealth('blue', damage_amount);
                        await sendImpactWaveToTower('blue');
                    }
                    
                    // Show backfire messages
                    showMessage(`💥 ${explanation}`, 'blue');
                    showMessage(`💥 ${explanation}`, 'red');
                    break;
                    
                case 'neutral_no_damage':
                    console.log('[NEUTRAL_NO_DAMAGE] No meaningful interaction');
                    // Show phase-through effect (no explosion)
                    await createPhaseThroughEffect(attackVisual, defendVisual);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // No damage to either tower
                    // Both characters fade away peacefully
                    
                    // Show no damage messages
                    showMessage(`🚫 ${explanation}`, 'blue');
                    showMessage(`🚫 ${explanation}`, 'red');
                    break;
                    
                case 'mutual_destruction':
                    console.log('[MUTUAL_DESTRUCTION] Both concepts destroyed');
                    // Show symmetric explosion
                    await createCenterCollision(attackVisual, defendVisual, 'neutral');
                    await new Promise(resolve => setTimeout(resolve, 1200));
                    
                    // Both towers take equal damage
                    updateHealth('blue', damage_amount);
                    updateHealth('red', damage_amount);
                    
                    // Send impact waves to BOTH towers
                    await Promise.all([
                        sendImpactWaveToTower('blue'),
                        sendImpactWaveToTower('red')
                    ]);
                    
                    // Show mutual destruction messages
                    showMessage(`⚔️ ${explanation}`, 'blue');
                    showMessage(`⚔️ ${explanation}`, 'red');
                    break;
                    
                default:
                    console.error('Unknown outcome_type:', outcome_type);
                    // Fallback to no damage
                    await createCenterCollision(attackVisual, defendVisual, 'neutral');
                    await new Promise(resolve => setTimeout(resolve, 1200));
                    showMessage('⚠️ Unknown outcome', 'blue');
                    showMessage('⚠️ Unknown outcome', 'red');
            }
            
            // Add to battle history with new format
            addToBattleHistory(attackingConcept, defendingConcept, explanation, outcome_type, damage_amount);
            
            // Wait for character fade-out animation to complete before resetting camera
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error('Battle error:', error);
            showMessage('Battle error occurred!', 'blue');
            showMessage('Battle error occurred!', 'red');
        } finally {
            // Reset state
            gameState.currentActiveAttack = null;
            gameState.isProcessing = false;
            gameState.aiAttacking = false;
            gameState.aiWalkingCharacter = null;
            
            if (gameState.activeProjectiles) {
                gameState.activeProjectiles = [];
            }
            
            clearInputs();
            
            // Re-enable input
            if (blueInput) blueInput.disabled = false;
            
            // Reset camera to original position after ALL animations complete
            if (typeof resetCamera === 'function') {
                resetCamera();
            }
            
            console.log('Battle complete, state reset');
            
            // Check if onboarding is active and show lesson banner
            if (typeof isOnboardingActive === 'function' && isOnboardingActive()) {
                const currentStep = typeof getCurrentStep === 'function' ? getCurrentStep() : 0;
                console.log('[Onboarding] Waiting for reasoning to display, then showing lesson...');
                
                // Wait for reasoning to display and fade (6 seconds)
                await new Promise(resolve => setTimeout(resolve, 6000));
                
                // Show lesson banner
                if (typeof showLessonBanner === 'function') {
                    showLessonBanner(currentStep);
                }
                
                // Don't automatically start next attack - user will click button to continue
            } else {
                // Normal gameplay - wait for animations then start next AI attack
                if (gameState.blueHealth > 0 && gameState.redHealth > 0) {
                    console.log('Waiting for animations to fully complete before next AI attack...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    console.log('Starting next AI attack');
                    initiateAIAttack();
                }
            }
        }
    } else {
        // No AI attack in progress
        showMessage('⏳ Wait for AI attack!', 'blue');
    }
}

