/**
 * DeepSeek Embedding Client
 * Uses DeepSeek's embedding API (deepseek-embedding-v2) to generate 768-dim vectors.
 */

const API_BASE = '/api/deepseek';
const EMBEDDING_MODEL = 'deepseek-embedding-v2';
const STORAGE_KEY = 'sezino_deepseek_api_key';

export function getApiKey() {
    return localStorage.getItem(STORAGE_KEY) || '';
}

export function setApiKey(key) {
    if (key) {
        localStorage.setItem(STORAGE_KEY, key);
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export function hasApiKey() {
    return !!getApiKey();
}

/**
 * Call DeepSeek embedding API for a single text or array of texts.
 * @param {string|string[]} input - Text(s) to embed
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
export async function getEmbeddings(input) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No DeepSeek API key configured');
    }

    const texts = Array.isArray(input) ? input : [input];

    const response = await fetch(`${API_BASE}/v1/embeddings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: EMBEDDING_MODEL,
            input: texts,
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    // Sort by index to maintain order
    return data.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);
}

/**
 * Get embedding for a single text string.
 */
export async function getEmbedding(text) {
    const results = await getEmbeddings(text);
    return results[0];
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
}

/**
 * Match an event to spaces using DeepSeek embeddings.
 * @param {object} event - Event object with title, description, tags
 * @param {object[]} spaces - Space objects with name, keywords
 * @returns {Promise<{spaceId: string, score: number}[]>} Sorted matches
 */
export async function matchEventToSpaces(event, spaces) {
    const eventText = `${event.title} ${event.description || ''} ${(event.tags || []).join(' ')}`;
    const spaceTexts = spaces.map(
        (s) => `${s.name} ${s.description} ${s.keywords.join(' ')}`
    );

    // Batch all texts in one API call for efficiency
    const allTexts = [eventText, ...spaceTexts];
    const allEmbeddings = await getEmbeddings(allTexts);

    const eventEmbedding = allEmbeddings[0];
    const spaceEmbeddings = allEmbeddings.slice(1);

    return spaces
        .map((space, i) => ({
            spaceId: space.id,
            score: cosineSimilarity(eventEmbedding, spaceEmbeddings[i]),
        }))
        .sort((a, b) => b.score - a.score);
}
