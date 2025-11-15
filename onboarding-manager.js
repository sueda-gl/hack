// Onboarding Manager
// Handles tutorial flow with curated battles to teach game mechanics

// Curated battle sequences for onboarding
const ONBOARDING_BATTLES = [
    {
        step: 1,
        aiConcept: "Fire",
        emoji: "🔥",
        hintTitle: "AI ATTACKED WITH: FIRE",
        hintText: "Fire is hot and destructive. You need something that cools and smothers flames.\n\n💡 Try typing: WATER",
        logicTeaser: "Some elements have natural dominance based on physical rules.",
        lessonAfter: "✅ YOU LEARNED:\n\nBasic interactions follow real-world intuition.\nWater naturally extinguishes fire through cooling and smothering."
    },
    {
        step: 2,
        aiConcept: "Sodium",
        emoji: "⚗️",
        hintTitle: "AI ATTACKED WITH: SODIUM",
        hintText: "Sodium is a highly reactive metal. What happens when reactive metals meet liquids?\n\n💡 Try typing: WATER\n\n(This might surprise you...)",
        logicTeaser: "Some reactions create unexpected consequences...",
        lessonAfter: "💥 YOU LEARNED:\n\nNot all wins are clean! Chemistry creates violent chain reactions.\nSodium + Water = Explosive hydrogen gas. Both sides can take damage."
    },
    {
        step: 3,
        aiConcept: "Nuclear Weapon",
        emoji: "☢️",
        hintTitle: "AI ATTACKED WITH: NUCLEAR WEAPON",
        hintText: "Physical weapons need physical targets to destroy. What exists everywhere with no single point of failure?\n\n💡 Try typing: YOUTUBE",
        logicTeaser: "Decentralized systems live across thousands of servers.",
        lessonAfter: "🌐 YOU LEARNED:\n\nDigital and distributed systems follow different rules than physical objects.\nYouTube exists on servers worldwide - you can't nuke the cloud!"
    },
    {
        step: 4,
        aiConcept: "Echo Chamber",
        emoji: "🔊",
        hintTitle: "AI ATTACKED WITH: ECHO CHAMBER",
        hintText: "Echo chambers amplify any sound infinitely in a feedback loop. What creature makes a loud, repetitive noise?\n\n💡 Try typing: DUCK",
        logicTeaser: "Environments create powerful multipliers.",
        lessonAfter: "🦆 YOU LEARNED:\n\nSynergy matters! Weak items become powerful in the right context.\nA duck's quack amplified infinitely collapses the chamber."
    },
    {
        step: 5,
        aiConcept: "Laser Pointer",
        emoji: "🔴",
        hintTitle: "AI ATTACKED WITH: LASER POINTER",
        hintText: "Just a harmless dot of red light. What creature has an instinctive, uncontrollable obsession with chasing it?\n\n💡 Try typing: CAT",
        logicTeaser: "Instincts and behavior can override raw power.",
        lessonAfter: "🐈 YOU LEARNED:\n\nPersonality and instinct beat brute force!\nA cat's hunting instinct makes it the ultimate laser pointer counter.\n\n🎓 TUTORIAL COMPLETE! You've mastered the mechanics!"
    }
];

// Onboarding state
const onboardingState = {
    active: true,           // Always true on page load
    currentStep: 0,         // Current battle (0-4)
    phase: null,            // 'hint' | 'battle' | 'lesson'
    isPaused: false,        // Game animation pause state
    waitingForNextBattle: false
};

// Start onboarding sequence
function startOnboarding() {
    console.log('🎓 Starting onboarding tutorial...');
    onboardingState.active = true;
    onboardingState.currentStep = 0;
    onboardingState.phase = 'hint';
}

// Get current battle data
function getCurrentBattle() {
    if (onboardingState.currentStep >= ONBOARDING_BATTLES.length) {
        return null;
    }
    return ONBOARDING_BATTLES[onboardingState.currentStep];
}

// Show hint banner before battle starts
function showHintBanner(step) {
    const battle = ONBOARDING_BATTLES[step];
    if (!battle) return;
    
    console.log(`Showing hint banner for step ${step + 1}`);
    onboardingState.phase = 'hint';
    onboardingState.isPaused = true;
    
    // Pause game
    pauseGame();
    
    const title = `${battle.emoji} ${battle.hintTitle}`;
    const message = `${battle.hintText}\n\n${battle.logicTeaser}`;
    const stepIndicator = `\n\nStep ${step + 1} of 5`;
    
    displayOnboardingBanner(
        title + stepIndicator,
        message,
        'Ready to Defend →',
        () => {
            console.log('User ready to defend, resuming game...');
            onboardingState.phase = 'battle';
            resumeGame();
        }
    );
}

// Show lesson banner after battle completes
function showLessonBanner(step) {
    const battle = ONBOARDING_BATTLES[step];
    if (!battle) return;
    
    console.log(`Showing lesson banner for step ${step + 1}`);
    onboardingState.phase = 'lesson';
    onboardingState.isPaused = true;
    
    // Pause game
    pauseGame();
    
    const isLastBattle = (step === ONBOARDING_BATTLES.length - 1);
    const buttonText = isLastBattle ? 'Start Real Game →' : 'Next Battle →';
    const stepIndicator = `\n\nCompleted: ${step + 1} of 5`;
    
    displayOnboardingBanner(
        battle.lessonAfter + stepIndicator,
        '',
        buttonText,
        () => {
            if (isLastBattle) {
                completeOnboarding();
            } else {
                advanceToNextBattle();
            }
        }
    );
}

// Advance to next battle
function advanceToNextBattle() {
    console.log('Advancing to next battle...');
    onboardingState.currentStep++;
    onboardingState.phase = 'hint';
    onboardingState.waitingForNextBattle = false;
    
    // Resume game briefly to allow state cleanup
    resumeGame();
    
    // Small delay then start next AI attack
    setTimeout(() => {
        if (typeof initiateAIAttack === 'function') {
            initiateAIAttack();
        }
    }, 500);
}

// Complete onboarding and transition to normal gameplay
function completeOnboarding() {
    console.log('🎉 Onboarding complete! Starting normal gameplay...');
    
    onboardingState.active = false;
    onboardingState.phase = null;
    
    // Resume game
    resumeGame();
    
    // Start normal AI attack after brief delay
    setTimeout(() => {
        if (typeof initiateAIAttack === 'function') {
            initiateAIAttack();
        }
    }, 1000);
}

// Pause game - freeze animations, dim background, hide timer
function pauseGame() {
    console.log('⏸️ Pausing game...');
    onboardingState.isPaused = true;
    
    // Show dimmer overlay
    const dimmer = document.getElementById('game-dimmer');
    if (dimmer) {
        dimmer.style.display = 'block';
        setTimeout(() => {
            dimmer.style.opacity = '1';
        }, 10);
    }
    
    // Hide timer display
    const timerEl = document.getElementById('response-timer');
    if (timerEl) {
        timerEl.style.display = 'none';
    }
    
    // Pause the player response timer interval
    if (gameState && gameState.playerResponseTimer) {
        clearInterval(gameState.playerResponseTimer);
        gameState.playerResponseTimer = null;
    }
}

// Resume game - unfreeze animations, undim background
function resumeGame() {
    console.log('▶️ Resuming game...');
    onboardingState.isPaused = false;
    
    // Hide dimmer overlay
    const dimmer = document.getElementById('game-dimmer');
    if (dimmer) {
        dimmer.style.opacity = '0';
        setTimeout(() => {
            dimmer.style.display = 'none';
        }, 500);
    }
    
    // Show timer if AI is attacking
    if (gameState && gameState.aiAttacking) {
        const timerEl = document.getElementById('response-timer');
        if (timerEl) {
            timerEl.style.display = 'block';
        }
        
        // Restart response timer for onboarding duration
        if (onboardingState.active && onboardingState.phase === 'battle') {
            startResponseTimer(20000); // 20 seconds for tutorial
        }
    }
}

// Check if currently in onboarding mode
function isOnboardingActive() {
    return onboardingState.active;
}

// Get current onboarding step
function getCurrentStep() {
    return onboardingState.currentStep;
}

// Check if game is paused
function isGamePaused() {
    return onboardingState.isPaused;
}

