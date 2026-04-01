import { useState, useEffect } from 'react';
import { fetchSpaces } from '../services/api';

let spacesCache = null;
let loadingPromise = null;

export function useSpaces() {
    const [spaces, setSpaces] = useState(spacesCache || []);
    const [loading, setLoading] = useState(!spacesCache);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (spacesCache) return;

        if (loadingPromise) {
            loadingPromise.then(setSpaces).catch(setError).finally(() => setLoading(false));
            return;
        }

        setLoading(true);
        loadingPromise = fetchSpaces()
            .then(data => {
                spacesCache = data;
                setSpaces(data);
                setError(null);
            })
            .catch(err => {
                setError(err);
                console.error('Failed to load spaces:', err);
            })
            .finally(() => {
                setLoading(false);
                loadingPromise = null;
            });
    }, []);

    return { spaces, loading, error };
}

export function getSpaceById(id) {
    if (!spacesCache) return null;
    return spacesCache.find(s => s.id === id);
}