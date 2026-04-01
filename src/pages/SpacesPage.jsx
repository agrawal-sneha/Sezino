import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { matchAllEventsToSpaces, isUsingDeepSeek } from '../lib/embeddingService';
import SpaceBadge from '../components/SpaceBadge';
import { fetchEvents, fetchSpaces, trackPageView } from '../services/api';
import { useSpaces } from '../hooks/useSpaces';

const SpacesPage = () => {
    const { category } = useParams();
    const [events, setEvents] = useState([]);
    const [matchResults, setMatchResults] = useState({});
    const [loading, setLoading] = useState(true);
    const { spaces, loading: spacesLoading } = useSpaces();

    useEffect(() => {
        trackPageView({ path: '/spaces', userAgent: navigator.userAgent });
    }, []);

    useEffect(() => {
        async function loadEvents() {
            setLoading(true);
            try {
                const eventsData = await fetchEvents();
                setEvents(eventsData);
                if (spaces.length > 0) {
                    const results = await matchAllEventsToSpaces(eventsData, spaces);
                    setMatchResults(results);
                }
            } catch (error) {
                console.error('Failed to load events:', error);
            } finally {
                setLoading(false);
            }
        }
        if (!spacesLoading) {
            loadEvents();
        }
    }, [spaces, spacesLoading]);

    const getEventsForSpace = (spaceId) => {
        return events.filter((event) => {
            const matches = matchResults[event.id];
            if (!matches || matches.length === 0) return false;
            return matches[0].spaceId === spaceId;
        });
    };

    // If a specific category is selected, show filtered view
    if (category) {
        const space = spaces.find(s => s.id === category);
        if (!space) return <div style={{ padding: '4rem', textAlign: 'center' }}>Space not found.</div>;
        const filteredEvents = getEventsForSpace(category);

        return (
            <div className="spaces-page">
                <div className="space-hero" style={{ background: space.gradient }}>
                    <span className="space-hero-icon">{space.icon}</span>
                    <h1>{space.name}</h1>
                    <p>{space.description}</p>
                </div>

                <div className="spaces-events-section">
                    <div className="engine-indicator">
                        <Zap size={14} />
                        {isUsingDeepSeek() ? 'DeepSeek Embeddings' : 'TF-IDF Fallback'}
                    </div>

                    <h2 className="section-title">{filteredEvents.length} Events in {space.name}</h2>

                    {loading ? (
                        <div className="loading-state">Computing embeddings…</div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="empty-state">No events matched this space yet.</div>
                    ) : (
                        <div className="events-grid">
                            {filteredEvents.map((event) => (
                                <Link to={`/event/${event.id}`} key={event.id}>
                                    <div className="event-card">
                                        <img src={event.image} alt={event.title} className="event-card-image" />
                                        <div className="event-card-content">
                                            <div className="event-date">{event.date}</div>
                                            <h3 className="event-title">{event.title}</h3>
                                            <div className="event-location">
                                                <MapPin size={16} />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default: show all spaces overview
    return (
        <div className="spaces-page">
            <div className="spaces-header">
                <div className="badge">
                    <Sparkles size={14} />
                    <span>Discover</span>
                </div>
                <h1>Explore Spaces</h1>
                <p>Discover events by category, powered by vector embeddings.</p>
                <div className="engine-indicator">
                    <Zap size={14} />
                    {isUsingDeepSeek() ? 'DeepSeek Embeddings' : 'TF-IDF Fallback'}
                </div>
            </div>

            {loading || spacesLoading ? (
                <div className="loading-state" style={{ padding: '4rem' }}>Loading spaces…</div>
            ) : (
                <div className="spaces-grid">
                    {spaces.map((space) => {
                        const matched = getEventsForSpace(space.id);
                        return (
                            <Link to={`/spaces/${space.id}`} key={space.id}>
                                <div className="space-card" style={{ background: space.gradient }}>
                                    <div className="space-card-icon">{space.icon}</div>
                                    <h2 className="space-card-title">{space.name}</h2>
                                    <p className="space-card-desc">{space.description}</p>
                                    <div className="space-card-footer">
                                        <span>{matched.length} event{matched.length !== 1 ? 's' : ''}</span>
                                        <ArrowRight size={18} />
                                    </div>

                                    {matched.length > 0 && (
                                        <div className="space-card-preview">
                                            {matched.slice(0, 3).map((ev) => (
                                                <img key={ev.id} src={ev.image} alt={ev.title} className="space-card-preview-img" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SpacesPage;