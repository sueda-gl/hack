# 3D Models Setup Instructions

## Quick Setup

You need to manually copy the models from your workspace into the battle folder.

### Step 1: Create Models Directory

```bash
cd /Users/suedagul/battle
mkdir models
```

### Step 2: Copy Models

Copy all GLB files from your Poly.Pizza folder to the models directory:

```bash
cp "/Users/suedagul/Poly.Pizza Models.undefined-glb/"*.glb models/
```

Or manually drag and drop all 16 GLB files from the `Poly.Pizza Models.undefined-glb` folder into the `battle/models` folder.

### Step 3: Verify

Check that you have all 16 models:

```bash
ls models/
```

You should see:
- Apatosaurus.glb
- Cat.glb
- Characters Pug.glb
- Fox.glb
- German Shepard.glb
- Husky.glb
- Market Stalls Compact.glb
- Parasaurolophus.glb
- Rock Path Round Small.glb
- Shiba Inu.glb
- Stegosaurus.glb
- T-Rex.glb
- Trees.glb
- Triceratops.glb
- Velociraptor.glb
- Wolf.glb

## How It Works

1. **Semantic Matching**: When you type a concept (e.g., "prehistoric predator"), the system uses Azure OpenAI embeddings to find the closest matching model
2. **Smart Matching**: "fierce canine" → Wolf, "loyal companion" → Dog, "ancient reptile" → T-Rex
3. **Automatic Fallback**: If no good match is found (similarity < 0.5), it uses the original procedural generation

## Testing Examples

Try these inputs to test the semantic matching:

- **"tyrant lizard"** → Should match T-Rex
- **"pack hunter"** → Should match Wolf  
- **"clever predator"** → Should match Velociraptor or Fox
- **"gentle giant"** → Should match Apatosaurus
- **"loyal dog"** → Should match German Shepard or Husky
- **"feline"** → Should match Cat
- **"marketplace"** → Should match Market Stalls
- **"forest"** → Should match Trees
- **"stone"** → Should match Rock Path

## Adding More Models

To add more models:

1. Download GLB files from Poly.Pizza, Quaternius, or Sketchfab
2. Place them in the `models/` folder
3. Add entries to `materials-database.js`:

```javascript
{ name: "Sword", file: "models/sword.glb" },
{ name: "Fire", file: "models/fire.glb" },
```

No code changes needed - semantic matching automatically works with new models!

## Troubleshooting

**Models not loading?**
- Check browser console (F12) for errors
- Verify models folder exists: `ls /Users/suedagul/battle/models`
- Make sure you're running the local server: `python3 -m http.server 8000`

**Semantic matching not working?**
- First battle will initialize embeddings (takes a few seconds)
- Check browser console for "Initializing embeddings..." message
- Embeddings are cached in localStorage for future use

