// API Configuration
// Using Azure OpenAI for battle logic and standard OpenAI for embeddings

const CONFIG = {
    // Azure OpenAI credentials (for battle logic with GPT-4o)
    AZURE_OPENAI_ENDPOINT: 'https://batu-test.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview',
    AZURE_OPENAI_API_KEY: '', // Set this in config.local.js
    
    // OpenAI credentials (for embeddings - semantic matching)
    OPENAI_API_KEY: '', // Set this in config.local.js
    OPENAI_EMBEDDINGS_ENDPOINT: 'https://api.openai.com/v1/embeddings',
    EMBEDDINGS_MODEL: 'text-embedding-ada-002',
    
    // API settings
    MAX_TOKENS: 200,
    TEMPERATURE: 0.7,
    
    // Azure uses different header format
    USE_AZURE: true
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
