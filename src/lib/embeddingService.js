/**
 * Embedding Service Facade
 * Auto-selects DeepSeek API or TF-IDF fallback based on API key availability.
 */

import { hasApiKey, matchEventToSpaces as deepseekMatch } from './embeddings.js';
import {
    matchEventToSpaces as fallbackMatch,
    matchAllEventsToSpaces as fallbackMatchAll,
} from './fallbackEmbeddings.js';

/**
 * Returns whether DeepSeek API is active.
 */
export function isUsingDeepSeek() {
    return hasApiKey();
}

/**
 * Match a single event to spaces.
 * Uses DeepSeek if API key is set, otherwise TF-IDF.
 */
export async function matchEventToSpaces(event, spaces) {
    if (hasApiKey()) {
        try {
            return await deepseekMatch(event, spaces);
        } catch (err) {
            console.warn('DeepSeek API failed, falling back to TF-IDF:', err.message);
            return fallbackMatch(event, spaces);
        }
    }
    return fallbackMatch(event, spaces);
}

/**
 * Match all events to spaces. Returns map: eventId → sorted matches.
 */
export async function matchAllEventsToSpaces(events, spaces) {
    if (hasApiKey()) {
        try {
            const results = {};
            // Run sequentially to respect rate limits
            for (const event of events) {
                results[event.id] = await deepseekMatch(event, spaces);
            }
            return results;
        } catch (err) {
            console.warn('DeepSeek API failed, falling back to TF-IDF:', err.message);
            return fallbackMatchAll(events, spaces);
        }
    }
    return fallbackMatchAll(events, spaces);
}
