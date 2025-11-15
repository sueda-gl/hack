# LLM-Powered Logical Battle Arena

An innovative real-time battle game where players can input **ANY concept** (objects, materials, forces, abstract ideas) as attacks, and an AI (OpenAI GPT) determines the outcome based on logical real-world interactions.

![Battle Arena](https://img.shields.io/badge/Three.js-Battle%20Arena-blue)
![OpenAI](https://img.shields.io/badge/Powered%20by-OpenAI-green)

## Overview

Unlike traditional rock-paper-scissors games with fixed rules, this system uses an LLM to reason about how ANY two concepts would interact in reality, making every battle unique and educational.

## Features

- 🎮 **Real-time 3D Battle Arena** - Beautiful Three.js visualization with animated towers, clouds, water, and terrain
- 🤖 **AI-Powered Logic** - Azure OpenAI GPT-4o determines battle outcomes based on real-world physics and logic
- 🎨 **Dynamic Visuals** - Different attack concepts get unique 3D representations (fire, water, lightning, etc.)
- 📊 **Battle History** - Complete log of all battles with AI reasoning
- ✨ **Particle Effects** - Impact explosions, victory celebrations, and smooth animations
- 🏰 **Tower Health System** - Visual feedback with color-changing crystals

## Setup Instructions

### 1. Install Requirements

No installation needed! This runs entirely in the browser.

### 2. Configure API (Azure OpenAI)

The system is already configured to use Azure OpenAI with the provided credentials:

```javascript
const CONFIG = {
    AZURE_OPENAI_ENDPOINT: 'https://batu-test.cognitiveservices.azure.com/...',
    AZURE_OPENAI_API_KEY: '7Yw7sFW0Webj0wQXQDOd...',
    USE_AZURE: true
};
```

**Note:** Azure OpenAI uses a different API format than standard OpenAI:
- Uses `api-key` header instead of `Authorization: Bearer`
- Model is specified in the endpoint URL (gpt-4o)
- API version is included in the URL

### 3. Start the Server

The game requires a local server to run. You can use Python's built-in HTTP server:

```bash
cd /Users/suedagul/battle
python3 -m http.server 8000
```

### 4. Open in Browser

Navigate to: http://localhost:8000

The Azure OpenAI integration is ready to use!

## How to Play

### Basic Gameplay

1. **Blue Team** (left side) enters an attack concept
2. **Red Team** (right side) enters a counter-attack concept
3. The AI analyzes the interaction and determines the outcome
4. Visual projectiles fly between towers
5. Health bars update based on damage
6. First team to reach 0 health loses!

### Example Battles

Try these concept combinations to see the AI's logic:

**Elemental Interactions:**
- Fire vs Water → Water extinguishes fire
- Lightning vs Water → Lightning conducts through water
- Ice vs Fire → Fire melts ice
- Wind vs Fire → Wind spreads fire

**Material Properties:**
- Acid vs Metal → Acid corrodes metal
- Diamond vs Glass → Diamond cuts glass
- Fabric vs Fire → Fire burns fabric
- Magnet vs Iron → Magnet attracts iron

**Abstract Concepts:**
- Light vs Darkness → Light illuminates darkness
- Time vs Space → Philosophical neutral
- Knowledge vs Ignorance → Knowledge defeats ignorance
- Order vs Chaos → Context-dependent

**Creative Examples:**
- Black hole vs Light → Black hole traps light
- Quantum physics vs Classical physics → Paradigm shift
- Love vs Hate → Emotional dynamics
- Gravity vs Feather → Physical force wins

## Game Mechanics

### Attack Resolution

1. **First Attack** - Sets up the attack, waits for opponent
2. **Counter Attack** - Triggers AI analysis
3. **AI Reasoning** - GPT analyzes real-world interactions
4. **Outcome** - Three possibilities:
   - **DEFEAT** - Attacker wins, defender takes damage (0-40 HP)
   - **BLOCKED** - Defender wins, attacker takes damage (0-40 HP)
   - **NEUTRAL** - Both take half damage

### Visual Feedback

- **Fire concepts** → Red cone with glow
- **Water/Ice** → Blue transparent sphere
- **Lightning** → Yellow octahedron
- **Rock/Stone** → Gray dodecahedron
- **Wind** → Cyan torus
- **Metal** → Silver cube
- **Darkness** → Black sphere
- **Light** → White glowing sphere
- **Other** → Team-colored sphere

### Tower Health

- **100-60 HP** → Original color, full crystal
- **60-30 HP** → Orange/yellow warning
- **30-0 HP** → Red critical state
- Crystal size scales with health

## Controls

- **Toggle Rotation** - Start/stop automatic camera rotation
- **Reset Camera** - Return to default view
- **Reset Game** - Start a new match
- **Mouse Drag** - Manual camera control (when rotation off)
- **Enter Key** - Submit attack from input field

## UI Elements

### Blue Team (Left Side)
- Input field for attack concepts
- Current active attack display
- AI reasoning text (subtitle style)
- Temporary messages

### Red Team (Right Side)
- Input field for attack concepts
- Current active attack display
- AI reasoning text (subtitle style)
- Temporary messages

### Battle History (Bottom Center)
- Collapsible log of all battles
- Timestamps
- Complete AI reasoning
- Damage values

## Technical Details

### Architecture
- **Frontend**: Pure HTML/CSS/JavaScript with Three.js
- **AI**: Azure OpenAI GPT-4o
- **3D Engine**: Three.js r128
- **No Backend**: Direct client-side API calls (hackathon setup)

### Files
- `index.html` - Main game interface with Three.js scene
- `config.js` - API configuration (add your key here)
- `battle-system.js` - Game logic and AI integration
- `README.md` - This file

### Performance
- Real-time 3D rendering at 60 FPS
- AI response time: ~2-5 seconds
- Smooth animations and particle effects
- Responsive to window resize

## Educational Value

This game teaches:
- Physics (forces, energy, matter interactions)
- Chemistry (elemental reactions, material properties)
- Logic (cause and effect, comparative reasoning)
- Critical thinking (predicting outcomes)

The AI provides educational explanations for every battle, helping players understand real-world interactions.

## Troubleshooting

### "Unable to connect to AI"
- Check your Azure OpenAI credentials in `config.js`
- Verify the endpoint URL is correct
- Ensure your Azure OpenAI deployment is active
- Check browser console for error messages (F12)

### Game doesn't load
- Make sure you're using a local server (not file://)
- Check that all files are in the same directory
- Open browser console for error details

### Attacks not working
- One attack must be set before counter-attack
- Wait for previous battle to complete
- Check that inputs aren't empty

### API Key exposed warning
- This is expected for hackathon/demo purposes
- For production, implement a backend server
- Never commit API keys to public repositories

## Future Enhancements

Potential improvements:
- Auto-battle mode with random concepts
- Combo system for sequential attacks
- Multiplayer over network
- AI battle commentary
- Concept suggestions/autocomplete
- Save/replay battle history
- Tournament mode
- Custom arena themes

## Credits

- **Three.js** - 3D graphics library
- **Azure OpenAI GPT-4o** - AI reasoning engine
- **Clash Royale** - Visual inspiration

## License

This is a hackathon project. Feel free to modify and extend!

---

**Have fun battling with physics, chemistry, and imagination!** 🎮⚔️✨

# hack
