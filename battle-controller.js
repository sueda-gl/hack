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
            
            // Call LLM
            const result = await callOpenAI(attackingConcept, defendingConcept);
            
            // Display reasoning
            displayReasoning(result.reasoning, 'blue');
            displayReasoning(result.reasoning, 'red');
            
            console.log('Projectiles reached center, showing collision...');
            
            // Determine winner and damage
            let damagedTeam, winningTeam, resultMessage;
            const { reasoning, outcome, damage } = result;
            
            if (outcome === 'DEFEAT') {
                // AI attacks, player defends -> AI wins
                damagedTeam = defendingTeam;
                winningTeam = attackingTeam;
                resultMessage = `✨ ${attackingConcept} defeats ${defendingConcept}!`;
            } else if (outcome === 'BLOCKED') {
                // Player successfully blocks
                damagedTeam = attackingTeam;
                winningTeam = defendingTeam;
                resultMessage = `🛡️ ${defendingConcept} blocks ${attackingConcept}!`;
            } else {
                // NEUTRAL - both take half damage
                createCenterCollision(attackVisual, defendVisual, 'neutral');
                await new Promise(resolve => setTimeout(resolve, 1200));
                
                updateHealth('blue', damage / 2);
                updateHealth('red', damage / 2);
                
                // Send impact waves to BOTH towers and wait for completion
                console.log('Sending impact waves to both towers (neutral)...');
                await Promise.all([
                    sendImpactWaveToTower('blue'),
                    sendImpactWaveToTower('red')
                ]);
                console.log('Both impact waves completed');
                
                resultMessage = `⚔️ ${attackingConcept} and ${defendingConcept} clash evenly!`;
                
                showMessage(resultMessage, 'blue');
                showMessage(resultMessage, 'red');
                
            addToBattleHistory(attackingConcept, defendingConcept, reasoning, resultMessage, damage);
            
            // Reset will be handled by finally block
            // Don't call initiateAIAttack here - finally block will handle it
            
            return;
            }
            
            // Show collision with winner
            createCenterCollision(attackVisual, defendVisual, winningTeam);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Apply damage
            updateHealth(damagedTeam, damage);
            
            // Send impact wave to tower and WAIT for it to complete
            console.log('Sending impact wave to tower...');
            await sendImpactWaveToTower(damagedTeam);
            console.log('Impact wave completed');
            
            // Show result
            showMessage(resultMessage, 'blue');
            showMessage(resultMessage, 'red');
            
            // Add to battle history
            addToBattleHistory(attackingConcept, defendingConcept, reasoning, resultMessage, damage);
            
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
            
            console.log('Battle complete, state reset');
            
            // Wait for ALL animations to complete before next AI attack
            // Total wait: collision (1.5s) + impact wave (~0.8s) + buffer (5s) = ~7.3s total
            if (gameState.blueHealth > 0 && gameState.redHealth > 0) {
                console.log('Waiting for animations to fully complete before next AI attack...');
                await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second buffer (increased from 3s)
                console.log('Starting next AI attack');
                initiateAIAttack();
            }
        }
    } else {
        // No AI attack in progress
        showMessage('⏳ Wait for AI attack!', 'blue');
    }
}

