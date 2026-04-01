/**
 * TF-IDF Fallback Embedding Engine
 * Used when no DeepSeek API key is configured.
 * Provides lightweight client-side text vectorization.
 */

/**
 * Tokenize and normalize text.
 */
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 1);
}

/**
 * Build vocabulary from all documents.
 */
function buildVocabulary(documents) {
    const vocab = new Map();
    let idx = 0;
    for (const doc of documents) {
        const tokens = new Set(tokenize(doc));
        for (const token of tokens) {
            if (!vocab.has(token)) {
                vocab.set(token, idx++);
            }
        }
    }
    return vocab;
}

/**
 * Compute term frequency for a document.
 */
function termFrequency(tokens) {
    const tf = new Map();
    for (const t of tokens) {
        tf.set(t, (tf.get(t) || 0) + 1);
    }
    const max = Math.max(...tf.values());
    for (const [k, v] of tf) {
        tf.set(k, v / max); // normalize
    }
    return tf;
}

/**
 * Compute IDF across all documents.
 */
function inverseDocFrequency(documents) {
    const n = documents.length;
    const idf = new Map();
    const tokenSets = documents.map((d) => new Set(tokenize(d)));

    for (const tokenSet of tokenSets) {
        for (const token of tokenSet) {
            idf.set(token, (idf.get(token) || 0) + 1);
        }
    }

    for (const [k, v] of idf) {
        idf.set(k, Math.log(n / v) + 1);
    }
    return idf;
}

/**
 * Convert text to TF-IDF vector given vocabulary and IDF scores.
 */
function textToVector(text, vocabulary, idf) {
    const tokens = tokenize(text);
    const tf = termFrequency(tokens);
    const vector = new Float64Array(vocabulary.size);

    for (const [term, tfScore] of tf) {
        if (vocabulary.has(term)) {
            const idx = vocabulary.get(term);
            vector[idx] = tfScore * (idf.get(term) || 1);
        }
    }
    return Array.from(vector);
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
 * Match an event to spaces using TF-IDF embeddings.
 * This runs entirely client-side — no API call needed.
 */
export function matchEventToSpaces(event, spaces) {
    const eventText = `${event.title} ${event.description || ''} ${(event.tags || []).join(' ')}`;
    const spaceTexts = spaces.map(
        (s) => `${s.name} ${s.description} ${s.keywords.join(' ')}`
    );

    const allTexts = [eventText, ...spaceTexts];
    const vocabulary = buildVocabulary(allTexts);
    const idf = inverseDocFrequency(allTexts);

    const eventVec = textToVector(eventText, vocabulary, idf);
    const spaceVecs = spaceTexts.map((t) => textToVector(t, vocabulary, idf));

    return spaces
        .map((space, i) => ({
            spaceId: space.id,
            score: cosineSimilarity(eventVec, spaceVecs[i]),
        }))
        .sort((a, b) => b.score - a.score);
}

/**
 * Batch-match all events to spaces. Returns a map: eventId → sorted matches.
 */
export function matchAllEventsToSpaces(events, spaces) {
    const results = {};
    for (const event of events) {
        results[event.id] = matchEventToSpaces(event, spaces);
    }
    return results;
}
