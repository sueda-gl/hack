// Character Animations and Main Animation Loop
// Depends on: scene-setup.js, arena-builder.js, battle-visuals.js, visual-effects.js

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();
    
    // Camera lock - only lock when rotation is disabled and not shaking/zooming
    // When isRotating is enabled, camera can be freely rotated by mouse
    if (!cameraShakeActive && !isRotating) {
        // Keep camera in fixed position (unless camera is zooming for battle)
        if (!camera.userData || !camera.userData.isZooming) {
            camera.position.set(-19.58, 13.37, 56.24);
            camera.lookAt(-3.54, 2.42, 10.17);
        }
    }
    
    // Animate clouds
    if (scene.userData.clouds) {
        scene.userData.clouds.forEach(cloud => {
            cloud.position.x += cloud.userData.speed;
            // Wrap clouds around
            if (cloud.position.x > 50) {
                cloud.position.x = -50;
            }
            // Gentle vertical movement
            cloud.position.y += Math.sin(time + cloud.position.x * 0.1) * 0.01;
        });
    }
    
    // Animate snow
    if (scene.userData.snow) {
        const snow = scene.userData.snow;
        const positions = snow.geometry.attributes.position.array;
        const velocities = snow.userData.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Update positions
            positions[i] += velocities[i];     // x
            positions[i + 1] += velocities[i + 1]; // y
            positions[i + 2] += velocities[i + 2]; // z
            
            // Reset snow that falls below ground
            if (positions[i + 1] < -10) {
                positions[i + 1] = 60;
                positions[i] = (Math.random() - 0.5) * 100;
                positions[i + 2] = (Math.random() - 0.5) * 100;
            }
            
            // Wrap snow horizontally for infinite effect
            if (positions[i] > 50) positions[i] = -50;
            if (positions[i] < -50) positions[i] = 50;
            if (positions[i + 2] > 50) positions[i + 2] = -50;
            if (positions[i + 2] < -50) positions[i + 2] = 50;
        }
        
        snow.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate water
    scene.traverse((child) => {
        if (child.userData && child.userData.material) {
            child.userData.material.emissiveIntensity = 0.1 + Math.sin(time * 2) * 0.05;
        }
    });
    
    // Animate towers with enhanced effects
    towers.forEach((tower, index) => {
        if (tower.userData.crystal) {
            // Rotate and float crystal
            tower.userData.crystal.rotation.y += 0.02;
            tower.userData.crystal.rotation.x = Math.sin(time * 2 + index) * 0.1;
            tower.userData.crystal.position.y = 14 + Math.sin(time * 2 + index) * 0.3;
            
            // Pulse glow with color variation
            const scale = 1 + Math.sin(time * 3 + index) * 0.3;
            tower.userData.glow.scale.set(scale, scale, scale);
            tower.userData.glow.material.opacity = 0.3 + Math.sin(time * 4) * 0.2;
            
            // Rotate particle ring
            if (tower.userData.particleRing) {
                tower.userData.particleRing.rotation.z += 0.01;
                tower.userData.particleRing.material.opacity = 0.1 + Math.sin(time * 2) * 0.1;
            }
            
            // Wave flag
            if (tower.userData.flag) {
                tower.userData.flag.rotation.y = Math.sin(time * 3 + index) * 0.3;
                tower.userData.flag.position.x = 0.75 + Math.sin(time * 4 + index) * 0.1;
            }
        }
    });
    
    // Move units with swaying motion
    units.forEach((unit, index) => {
        unit.position.x += unit.userData.velocity;
        unit.position.y = 1 + Math.sin(time * 5 + index) * 0.15;
        unit.position.z += Math.sin(time * 3 + index) * 0.01; // Slight zigzag
        
        // Rotate units
        unit.rotation.y += 0.05;
        
        // Remove units that go off screen
        if (Math.abs(unit.position.x) > 25) {
            scene.remove(unit);
            units.splice(index, 1);
        }
        
        // Check collision with enemy towers
        towers.forEach(tower => {
            if (tower.userData.team !== unit.userData.team) {
                const distance = unit.position.distanceTo(tower.position);
                if (distance < 3) {
                    // Create enhanced hit effect
                    createSpawnEffect(unit.position, 0xffff00);
                    createExplosion(unit.position);
                    scene.remove(unit);
                    units.splice(index, 1);
                    
                    // Update health bar
                    const healthBar = document.getElementById(
                        tower.userData.team === 'blue' ? 'blue-health' : 'red-health'
                    );
                    const currentWidth = parseFloat(healthBar.style.width);
                    healthBar.style.width = Math.max(0, currentWidth - 10) + '%';
                }
            }
        });
    });
    
    // Animate flowers and grass (subtle wind effect)
    scene.traverse((child) => {
        if (child.type === 'Group' && child.children.length > 0) {
            // Check if it's a flower group (has petals)
            const hasPetals = child.children.some(c => c.geometry && c.geometry.parameters && c.geometry.parameters.radius === 0.15);
            if (hasPetals) {
                child.rotation.z = Math.sin(time * 2 + child.position.x) * 0.05;
                child.rotation.x = Math.cos(time * 2 + child.position.z) * 0.05;
            }
        }
    });

    // Camera shake effect
    if (cameraShakeActive) {
        if (cameraShakeDuration > 0) {
            camera.position.x = originalCameraPos.x + (Math.random() - 0.5) * cameraShakeIntensity;
            camera.position.y = originalCameraPos.y + (Math.random() - 0.5) * cameraShakeIntensity;
            camera.position.z = originalCameraPos.z + (Math.random() - 0.5) * cameraShakeIntensity;
            cameraShakeDuration--;
        } else {
            camera.position.copy(originalCameraPos);
            cameraShakeActive = false;
        }
    }
    
    // Animate AI walking character (before battle)
    if (gameState && gameState.aiWalkingCharacter && gameState.aiWalkingCharacter.userData.walkData) {
        const walkData = gameState.aiWalkingCharacter.userData.walkData;
        if (walkData.isWalking) {
            const elapsed = Date.now() - walkData.startTime;
            const progress = Math.min(elapsed / walkData.duration, 1);
            
            // Update position
            gameState.aiWalkingCharacter.position.lerpVectors(
                walkData.startPos,
                walkData.endPos,
                progress
            );
            
            // Walking bobbing animation
            const bob = Math.abs(Math.sin(elapsed * 0.002)) * 0.8;
            gameState.aiWalkingCharacter.position.y = 0 + bob;
            
            // Subtle rotation variation from base rotation
            const baseRot = gameState.aiWalkingCharacter.userData.baseRotation || 0;
            gameState.aiWalkingCharacter.rotation.y = baseRot + Math.sin(elapsed * 0.0012) * 0.05;
            
            // When walk completes, stop at center
            if (progress >= 1) {
                walkData.isWalking = false;
                gameState.aiWalkingCharacter.position.copy(walkData.endPos);
                console.log('AI character reached center');
            }
        }
    }
    
    // Animate active projectiles
    if (gameState && gameState.activeProjectiles && gameState.activeProjectiles.length > 0) {
        for (let i = gameState.activeProjectiles.length - 1; i >= 0; i--) {
            const projectile = gameState.activeProjectiles[i];
            
            if (!projectile || !projectile.mesh) {
                // Remove invalid projectile
                gameState.activeProjectiles.splice(i, 1);
                continue;
            }
            
            projectile.progress += projectile.speed;
            
            if (projectile.progress >= 1) {
                // Projectile reached target
                console.log(`Projectile from ${projectile.team} reached center`);
                
                // Clean up trail particles
                if (projectile.particles) {
                    projectile.particles.forEach(p => {
                        scene.remove(p);
                        if (p.material) p.material.dispose();
                    });
                    projectile.particles = [];
                }
                
                projectile.onComplete();
                gameState.activeProjectiles.splice(i, 1);
            } else {
                // Update position - WALKING on ground
                const t = projectile.progress;
                projectile.mesh.position.lerpVectors(
                    projectile.startPos,
                    projectile.endPos,
                    t
                );
                
                // Walking bobbing animation (up and down) - slower for bigger characters
                projectile.walkCycle += 0.1;
                const bob = Math.abs(Math.sin(projectile.walkCycle)) * 0.8;
                projectile.mesh.position.y = 0 + bob;
                
                // Subtle rotation variation from base rotation for character movement feel
                const baseRot = projectile.mesh.userData.baseRotation || 0;
                projectile.mesh.rotation.y = baseRot + Math.sin(projectile.walkCycle) * 0.05;
                
                // Speed up slightly as they get closer (building tension)
                if (t > 0.7) {
                    projectile.speed = 0.005; // Gentle speed up near the end
                }
            }
        }
    }
    
    renderer.render(scene, camera);
}

// Spawn character at tower and make it walk for specified duration
function spawnAndWalkCharacter(character, team, duration) {
    const tower = towers.find(t => t.userData.team === team);
    if (!tower) {
        console.error(`Tower not found for team: ${team}`);
        return;
    }
    
    // Position character at tower
    character.position.copy(tower.position);
    character.position.y = 0; // Ground level
    scene.add(character);
    
    // Calculate walk path (from tower to center)
    const startPos = character.position.clone();
    const endPos = new THREE.Vector3(0, 0, 0); // Center of arena
    
    // Set character to face camera for side view
    // Camera is at +Z looking toward -Z, so characters face toward camera (rotation.y = 0)
    // This gives a consistent side profile regardless of model's default orientation
    character.rotation.y = 0;
    
    // Store base rotation for animation variations
    character.userData.baseRotation = 0;
    
    // Store walk data
    character.userData.walkData = {
        startPos: startPos,
        endPos: endPos,
        startTime: Date.now(),
        duration: duration,
        isWalking: true
    };
    
    console.log(`${team} character started walking from tower to center (${duration}ms)`);
}

// Stop AI walk animation and prepare for battle
async function stopAIWalkAndStartBattle(aiVisual, playerVisual, aiTeam, playerTeam) {
    console.log('Stopping AI walk and starting battle...');
    
    // Step 1: Stop AI walking animation (it's already in scene, partway to center)
    if (aiVisual && aiVisual.userData.walkData) {
        aiVisual.userData.walkData.isWalking = false;
        console.log('AI walk stopped at current position');
    }
    
    // Step 2: Get AI's CURRENT position (don't reset to tower!)
    const aiCurrentPos = aiVisual ? aiVisual.position.clone() : new THREE.Vector3(10, 0, 0);
    const centerPos = new THREE.Vector3(0, 0, 0);
    
    console.log(`AI current position: (${aiCurrentPos.x.toFixed(1)}, ${aiCurrentPos.y.toFixed(1)}, ${aiCurrentPos.z.toFixed(1)})`);
    
    // Step 3: Calculate how far AI still needs to walk to center
    const aiDistanceToCenter = aiCurrentPos.distanceTo(centerPos);
    const totalDistance = 20; // Approximate distance from tower to center
    const aiProgress = 1 - (aiDistanceToCenter / totalDistance); // How far AI has walked (0-1)
    
    console.log(`AI progress: ${(aiProgress * 100).toFixed(0)}% of the way to center`);
    
    // Step 4: Add AI to projectiles system to continue from current position
    if (aiVisual && !aiVisual.userData.inProjectiles) {
        const aiProjectile = {
            mesh: aiVisual,
            startPos: aiCurrentPos.clone(), // Start from CURRENT position
            endPos: centerPos.clone(),
            progress: 0, // Start fresh from current position
            speed: 0.004, // Slightly faster to catch up
            team: aiTeam,
            walkCycle: Math.random() * Math.PI * 2, // Random phase
            onComplete: () => {
                console.log('AI reached center from intercepted position');
            }
        };
        
        if (!gameState.activeProjectiles) {
            gameState.activeProjectiles = [];
        }
        gameState.activeProjectiles.push(aiProjectile);
        aiVisual.userData.inProjectiles = true;
        
        console.log('AI added to projectiles system from current position');
    }
    
    // Step 5: Spawn player character at their tower and animate to center
    const playerTower = towers.find(t => t.userData.team === playerTeam);
    if (playerTower && playerVisual) {
        playerVisual.position.copy(playerTower.position);
        playerVisual.position.y = 0;
        scene.add(playerVisual);
        
        console.log('Player character spawned at tower, animating to center...');
        
        // Add player to projectiles system
        const playerProjectile = {
            mesh: playerVisual,
            startPos: playerVisual.position.clone(),
            endPos: centerPos.clone(),
            progress: 0,
            speed: 0.004, // Match AI speed
            team: playerTeam,
            walkCycle: 0,
            onComplete: () => {
                console.log('Player reached center');
            }
        };
        
        gameState.activeProjectiles.push(playerProjectile);
        playerVisual.userData.inProjectiles = true;
    }
    
    // Step 6: Wait for BOTH characters to reach center
    // Calculate wait time based on AI's remaining distance
    const maxWaitTime = Math.max(aiDistanceToCenter / (0.004 * 60), 10 / (0.004 * 60)); // Distance / speed
    const waitTime = Math.min(maxWaitTime * 16.67, 5000); // Convert to ms, cap at 5 seconds
    
    console.log(`Waiting ${(waitTime / 1000).toFixed(1)}s for both characters to reach center...`);
    
    return new Promise((resolve) => {
        // Poll until both projectiles are done
        const checkInterval = setInterval(() => {
            const aiDone = !gameState.activeProjectiles.some(p => p.mesh === aiVisual);
            const playerDone = !gameState.activeProjectiles.some(p => p.mesh === playerVisual);
            
            if (aiDone && playerDone) {
                clearInterval(checkInterval);
                console.log('Both characters reached center, starting battle collision!');
                resolve();
            }
        }, 100);
        
        // Timeout fallback
        setTimeout(() => {
            clearInterval(checkInterval);
            console.log('Battle timeout reached, proceeding...');
            resolve();
        }, waitTime);
    });
}

