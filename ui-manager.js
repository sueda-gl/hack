// UI Manager
// Handles all UI updates, messages, and display functions

// Update the health bar UI
function updateHealthBar(team, health) {
    const healthBar = document.getElementById(`${team}-health`);
    if (healthBar) {
        healthBar.style.width = `${health}%`;
        
        // Change color based on health
        if (health > 60) {
            healthBar.style.background = '#22c55e';
        } else if (health > 30) {
            healthBar.style.background = '#f59e0b';
        } else {
            healthBar.style.background = '#ef4444';
        }
    }
    
    // Update tower visual health (make crystal pulse or dim)
    updateTowerHealth(team, health);
}

// Display reasoning text with typewriter effect in center of screen
function displayReasoning(reasoning, team) {
    // Only show once (not for both teams)
    if (team === 'red') return; // Skip the second call
    
    const centerBox = document.getElementById('center-reasoning');
    const textEl = document.getElementById('center-reasoning-text');
    
    if (!centerBox || !textEl) return;
    
    // Clear previous text
    textEl.textContent = '';
    
    // Show the box
    centerBox.classList.add('visible');
    
    // Typewriter effect
    let charIndex = 0;
    const typingSpeed = 50; // milliseconds per character
    
    function typeNextChar() {
        if (charIndex < reasoning.length) {
            textEl.textContent += reasoning.charAt(charIndex);
            charIndex++;
            setTimeout(typeNextChar, typingSpeed);
        } else {
            // After typing is complete, wait 5 seconds then fade out
            setTimeout(() => {
                centerBox.classList.remove('visible');
            }, 5000);
        }
    }
    
    typeNextChar();
}

// Display current concept on team's side
function displayConcept(concept, team, status) {
    const conceptEl = document.getElementById(`${team}-concept`);
    if (conceptEl) {
        const statusEmoji = status === 'waiting' ? '⏳' : '⚔️';
        conceptEl.textContent = `${statusEmoji} ${concept}`;
        conceptEl.style.opacity = '1';
    }
}

// Show temporary message
function showMessage(message, team) {
    const messageEl = document.getElementById(`${team}-message`);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.style.opacity = '1';
        
        setTimeout(() => {
            messageEl.style.opacity = '0';
        }, 1500);
    }
}

// Clear input fields
function clearInputs() {
    const blueInput = document.getElementById('blue-input');
    const redInput = document.getElementById('red-input');
    
    if (blueInput) blueInput.value = '';
    if (redInput) redInput.value = '';
    
    // Clear concept displays
    const blueConcept = document.getElementById('blue-concept');
    const redConcept = document.getElementById('red-concept');
    
    if (blueConcept) {
        blueConcept.style.opacity = '0';
        blueConcept.textContent = '';
    }
    if (redConcept) {
        redConcept.style.opacity = '0';
        redConcept.textContent = '';
    }
    
    console.log('Inputs and displays cleared, ready for next battle');
}

// Update battle log display
function updateBattleLog(entry) {
    const logContainer = document.getElementById('battle-log-content');
    if (!logContainer) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = 'battle-log-entry';
    logEntry.innerHTML = `
        <div class="log-time">${entry.timestamp}</div>
        <div class="log-battle">${entry.attack} ⚔️ ${entry.defend}</div>
        <div class="log-reasoning">${entry.reasoning}</div>
        <div class="log-result">${entry.result} (-${entry.damage} HP)</div>
    `;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Toggle battle log visibility
function toggleBattleLog() {
    const log = document.getElementById('battle-log');
    if (log) {
        log.classList.toggle('collapsed');
    }
}

// Update timer display UI
function updateTimerDisplay(timeMs) {
    const seconds = (timeMs / 1000).toFixed(1);
    const timerEl = document.getElementById('response-timer');
    const timerBarEl = document.getElementById('timer-bar');
    
    if (timerEl) {
        timerEl.textContent = `⏰ ${seconds}s to respond!`;
    }
    
    if (timerBarEl) {
        const percentage = (timeMs / 10000) * 100;
        timerBarEl.style.width = `${percentage}%`;
        
        // Change color based on urgency
        if (percentage > 50) {
            timerBarEl.style.background = '#22c55e';
        } else if (percentage > 25) {
            timerBarEl.style.background = '#f59e0b';
        } else {
            timerBarEl.style.background = '#ef4444';
        }
    }
}

// Hide timer display
function hideTimerDisplay() {
    const timerEl = document.getElementById('response-timer');
    if (timerEl) {
        timerEl.style.display = 'none';
    }
}

// Show AI thinking animation
function showAIThinking(team) {
    const messageEl = document.getElementById(`${team}-message`);
    if (messageEl) {
        messageEl.textContent = '🤖 AI THINKING...';
        messageEl.style.opacity = '1';
    }
    
    const conceptEl = document.getElementById(`${team}-concept`);
    if (conceptEl) {
        conceptEl.textContent = '⚙️ Preparing attack...';
        conceptEl.style.opacity = '1';
    }
}

