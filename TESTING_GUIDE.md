# Testing Guide - Battle System Fixes

## What Was Fixed

### Issue
Projectiles were not visible when attacks were launched. The system needed projectiles to:
1. Launch from towers
2. Meet in the middle of the arena
3. Collide with visual effects
4. Show which one wins based on LLM logic

### Changes Made

1. **Projectile Animation (index.html)**
   - Changed projectiles to fly to CENTER (0, 10, 0) instead of enemy towers
   - Both projectiles now meet in the middle
   - Added collision detection when they reach center

2. **Center Collision Effect (index.html)**
   - Created `createCenterCollision()` function
   - Shows dramatic explosion at center
   - Winner's color dominates the effect
   - Neutral battles show both colors

3. **Impact Wave (index.html)**
   - After collision, winning projectile sends impact wave to losing tower
   - Visual feedback of tower taking damage
   - Tower crystal shakes on impact

4. **Battle Resolution (battle-system.js)**
   - Updated to wait for projectiles to reach center
   - Determines winner based on Azure OpenAI response
   - Shows collision effect with winner
   - Sends damage wave to losing tower

5. **Debug Logging**
   - Added console.log statements throughout
   - Track attack submissions
   - Monitor projectile launches
   - See collision events

## How to Test

### Step 1: Check Console
Open browser console (F12) to see debug messages:
```
Attack input from blue: "fire"
blue team set attack: fire, waiting for opponent...
Attack input from red: "water"
Battle starting: fire (blue) vs water (red)
Launching projectiles to center...
Projectile launched from blue team to center
Projectile launched from red team to center
Projectiles reached center, showing collision...
Creating center collision effect, winner: red
```

### Step 2: Visual Testing

**Test 1: Basic Fire vs Water**
1. Blue team enters: `fire`
2. See message: "⚡ fire ready to attack!"
3. Red team enters: `water`
4. Watch for:
   - Two projectiles launch from towers
   - Red cone (fire) from blue tower
   - Blue sphere (water) from red tower
   - Both fly toward center
   - COLLISION at center with explosion
   - Winner's color expands (blue for water)
   - Impact wave hits blue tower (loser)
   - Blue tower crystal shakes
   - Health bar updates

**Test 2: Lightning vs Metal**
1. Blue: `lightning`
2. Red: `metal`
3. Should see:
   - Yellow octahedron from blue
   - Silver cube from red
   - Collision at center
   - Lightning wins (conducts through metal)
   - Yellow explosion dominates
   - Red tower takes damage

**Test 3: Abstract Concepts**
1. Blue: `time`
2. Red: `space`
3. Should see:
   - Team-colored spheres (default visual)
   - Collision at center
   - Likely NEUTRAL outcome
   - Both colors explode
   - Both towers take damage

### Step 3: Check AI Reasoning

Watch the transparent overlays on each side:
- Should show AI's logical explanation
- Examples:
  - "Fire vs Water: Water extinguishes fire through cooling..."
  - "Lightning vs Metal: Metal conducts electricity..."
  - "Time vs Space: These concepts coexist in physics..."

### Step 4: Battle History

Click "Battle History" at bottom:
- See all past battles
- View complete AI reasoning
- Check damage values
- Verify timestamps

## Visual Elements to Look For

### Projectile Types
- **Fire**: Red cone with glow
- **Water/Ice**: Blue transparent sphere
- **Lightning**: Yellow octahedron
- **Rock/Stone**: Gray dodecahedron
- **Wind**: Cyan torus
- **Metal**: Silver cube
- **Darkness**: Black sphere
- **Light**: White glowing sphere
- **Default**: Team-colored sphere

### Collision Effects
- Ring expansion at center
- Particle explosion
- Winner's colored sphere expansion
- Loser's projectile disappears

### Tower Feedback
- Crystal color changes with health:
  - 100-60 HP: Original color
  - 60-30 HP: Orange/yellow
  - 30-0 HP: Red
- Crystal shakes when hit
- Glow pulses based on health

## Troubleshooting

### No Projectiles Visible
1. Open console (F12) - check for errors
2. Verify Azure OpenAI key is set in config.js
3. Make sure both teams submit attacks
4. Check that gameState.activeProjectiles array is being populated

### Projectiles Don't Move
1. Check animate() function is running (you should see camera rotation)
2. Verify gameState.activeProjectiles is being processed in animation loop
3. Look for JavaScript errors in console

### No Collision Effect
1. Check console for "Creating center collision effect" message
2. Verify both projectiles reached center (progress >= 1)
3. Check that createCenterCollision function exists

### AI Not Responding
1. Check Azure OpenAI endpoint in config.js
2. Verify API key is correct
3. Check browser console for API errors
4. Test with simple concepts first (fire vs water)

## Expected Flow

```
1. Blue enters "fire" → Visual indicator appears
2. Red enters "water" → Battle starts
3. API call to Azure OpenAI → "Analyzing interaction..."
4. AI responds → Reasoning displays on both sides
5. Projectiles launch → Red cone and blue sphere
6. Projectiles fly → Parabolic arc to center
7. Collision at center → Explosion effect
8. Winner determined → Blue (water) wins
9. Impact wave → Hits blue tower
10. Damage applied → Blue health decreases
11. Battle log updated → History saved
```

## Performance Notes

- Projectile speed: 0.015 per frame (~3 seconds to center)
- AI response time: 2-5 seconds
- Total battle duration: ~6-10 seconds
- No lag should occur with proper Three.js rendering

## Success Indicators

✅ Projectiles launch from towers  
✅ Both projectiles visible and moving  
✅ Collision occurs at center (0, 10, 0)  
✅ Explosion effect shows winner's color  
✅ Impact wave travels to losing tower  
✅ Tower crystal shakes on impact  
✅ Health bars update correctly  
✅ AI reasoning displays on sides  
✅ Battle history logs everything  

If all checkmarks pass, the system is working correctly!

