# API Keys Setup

## ⚠️ IMPORTANT: Rotate Your API Keys Immediately

Your API keys were exposed in git history. You must rotate them before pushing to GitHub:

### 1. Rotate Azure OpenAI Key
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Cognitive Services resource: `batu-test`
3. Go to "Keys and Endpoint"
4. Click "Regenerate Key 1" (or Key 2 if you were using that)
5. Copy the new key

### 2. Rotate OpenAI Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Find your exposed key (starts with `sk-w9-fVIYL...`)
3. Click the trash icon to delete it
4. Click "Create new secret key"
5. Copy the new key immediately (you won't see it again)

## Setting Up Local Configuration

1. Open `config.local.js` in this directory
2. Replace the placeholder values with your NEW (rotated) API keys:

```javascript
const CONFIG = {
    AZURE_OPENAI_API_KEY: 'your-new-azure-key-here',
    OPENAI_API_KEY: 'your-new-openai-key-here'
};
```

3. Save the file
4. **NEVER commit this file** - it's already in `.gitignore`

## Verifying Your Setup

- `config.js` should have empty strings for API keys (this gets committed)
- `config.local.js` should have your real keys (this stays local)
- `.gitignore` includes `config.local.js` to prevent accidental commits

## After Rotating Keys

Once you've rotated both keys and updated `config.local.js`, you can safely push to GitHub:

```bash
git push
```

The old exposed keys will be invalid, so even though they're in your local git history, they can't be used.

