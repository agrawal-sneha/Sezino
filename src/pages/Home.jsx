import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { matchAllEventsToSpaces } from '../lib/embeddingService';
import SpaceBadge from '../components/SpaceBadge';
import SpaceFilterBar from '../components/SpaceFilterBar';
import { fetchEvents, fetchSpaces, trackPageView } from '../services/api';

const Home = () => {
    const [activeSpace, setActiveSpace] = useState(null);
    const [matchResults, setMatchResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [spaces, setSpaces] = useState([]);

    useEffect(() => {
        // Track page view
        trackPageView({ path: '/', userAgent: navigator.userAgent });
    }, []);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [eventsData, spacesData] = await Promise.all([
                    fetchEvents(),
                    fetchSpaces()
                ]);
                setEvents(eventsData);
                setSpaces(spacesData);
                // Compute matches
                const results = await matchAllEventsToSpaces(eventsData, spacesData);
                setMatchResults(results);
            } catch (error) {
                console.error('Failed to load data:', error);
                // Fallback to empty arrays
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const getTopSpace = (eventId) => {
        const matches = matchResults[eventId];
        if (!matches || matches.length === 0) return null;
        return matches[0].spaceId;
    };

    const filteredEvents = activeSpace
        ? events.filter((e) => getTopSpace(e.id) === activeSpace)
        : events;

    return (
        <div>
            <section className="hero">
                <h1 className="hero-title">Delightful events start here</h1>
                <p className="hero-subtitle">
                    Host, share, and connect with people through beautiful event pages.
                </p>
                <Link to="/spaces">
                    <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        <Sparkles size={20} />
                        Explore Spaces
                    </button>
                </Link>
            </section>

            <section className="events-section">
                <h2 className="section-title">
                    <Calendar size={28} />
                    Upcoming Events
                </h2>

                <SpaceFilterBar activeSpace={activeSpace} onSelect={setActiveSpace} />

                {loading ? (
                    <div className="loading-state">Loading events…</div>
                ) : (
                    <div className="events-grid">
                        {filteredEvents.map((event) => (
                            <Link to={`/event/${event.id}`} key={event.id}>
                                <div className="event-card">
                                    <img src={event.image} alt={event.title} className="event-card-image" />
                                    <div className="event-card-content">
                                        {getTopSpace(event.id) && (
                                            <SpaceBadge spaceId={getTopSpace(event.id)} />
                                        )}
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
            </section>
        </div>
    );
};

export default Home;