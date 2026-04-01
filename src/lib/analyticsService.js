/**
 * Analytics Service for Sezino
 * Tracks page visits using localStorage and generates realistic demo data.
 */

const STORAGE_KEY = 'sezino_analytics';

/** Call this once when a page loads to register a visit. */
export function trackPageView(page = 'home') {
    try {
        const store = getStore();
        const today = getTodayKey();
        if (!store.daily[today]) store.daily[today] = { visits: 0, pages: {} };
        store.daily[today].visits += 1;
        store.daily[today].pages[page] = (store.daily[today].pages[page] || 0) + 1;
        store.total += 1;
        saveStore(store);
    } catch (_) { /* silently fail if localStorage is unavailable */ }
}

/** Returns full analytics data including seeded demo history */
export function getAnalytics() {
    const store = getStore();
    return populateDemo(store);
}

// ─── Internal helpers ───────────────────────────────────────────────────────

function getTodayKey() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function getStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : freshStore();
    } catch (_) {
        return freshStore();
    }
}

function saveStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function freshStore() {
    return { daily: {}, total: 0, seeded: false };
}

/**
 * If the store hasn't been seeded yet, generate 30 days of realistic demo data
 * so the dashboard looks interesting on first load.
 */
function populateDemo(store) {
    if (!store.seeded) {
        const base = [42, 55, 38, 67, 91, 120, 105, 78, 63, 49, 82, 144, 130, 97, 110, 88, 76, 158, 172, 145, 133, 161, 189, 202, 175, 148, 167, 195, 210, 188];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            if (!store.daily[key]) {
                const visits = base[29 - i] + Math.floor(Math.random() * 20 - 10);
                store.daily[key] = {
                    visits: Math.max(1, visits),
                    pages: {
                        home: Math.floor(visits * 0.45),
                        spaces: Math.floor(visits * 0.25),
                        event: Math.floor(visits * 0.2),
                        other: Math.floor(visits * 0.1),
                    },
                };
            }
        }
        store.seeded = true;
        store.total = Object.values(store.daily).reduce((s, d) => s + d.visits, 0);
        saveStore(store);
    }
    return store;
}

/** Compute summary stats from the store */
export function computeStats(store) {
    const days = Object.entries(store.daily)
        .sort(([a], [b]) => a.localeCompare(b));

    const last30 = days.slice(-30);
    const last7 = days.slice(-7);
    const prev7 = days.slice(-14, -7);

    const sum = (arr) => arr.reduce((s, [, d]) => s + d.visits, 0);

    const thisWeek = sum(last7);
    const lastWeek = sum(prev7);
    const weekChange = lastWeek === 0 ? 100 : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

    const today = days[days.length - 1]?.[1]?.visits || 0;
    const yesterday = days[days.length - 2]?.[1]?.visits || 0;
    const dayChange = yesterday === 0 ? 100 : Math.round(((today - yesterday) / yesterday) * 100);

    // Page breakdown totals
    const pageBreakdown = { home: 0, spaces: 0, event: 0, other: 0 };
    last30.forEach(([, d]) => {
        Object.entries(d.pages || {}).forEach(([p, v]) => {
            if (pageBreakdown[p] !== undefined) pageBreakdown[p] += v;
        });
    });

    return {
        totalVisits: store.total,
        todayVisits: today,
        dayChange,
        weeklyVisits: thisWeek,
        weekChange,
        chartData: last30.map(([date, d]) => ({ date, visits: d.visits })),
        pageBreakdown,
    };
}
