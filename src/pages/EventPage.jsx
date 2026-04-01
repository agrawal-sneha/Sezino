import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CalendarDays, MapPin, Share2, Heart, CheckCircle2 } from 'lucide-react';
import { matchEventToSpaces } from '../lib/embeddingService';
import SpaceBadge from '../components/SpaceBadge';
import { fetchEvent } from '../services/api';
import { useSpaces } from '../hooks/useSpaces';

const EventPage = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [topSpaces, setTopSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const { spaces, loading: spacesLoading } = useSpaces();

    useEffect(() => {
        async function loadEvent() {
            setLoading(true);
            try {
                const eventData = await fetchEvent(id);
                setEvent(eventData);
            } catch (error) {
                console.error('Failed to load event:', error);
            } finally {
                setLoading(false);
            }
        }
        loadEvent();
    }, [id]);

    useEffect(() => {
        if (!event || spacesLoading) return;
        async function match() {
            const results = await matchEventToSpaces(event, spaces);
            setTopSpaces(results.slice(0, 2));
        }
        match();
    }, [event, spaces, spacesLoading]);

    if (loading || spacesLoading) {
        return <div className="loading-state">Loading event…</div>;
    }

    if (!event) {
        return <div style={{ padding: '4rem', textAlign: 'center' }}>Event not found.</div>;
    }

    const attendees = [
        'https://i.pravatar.cc/150?u=1',
        'https://i.pravatar.cc/150?u=2',
        'https://i.pravatar.cc/150?u=3',
        'https://i.pravatar.cc/150?u=4',
        'https://i.pravatar.cc/150?u=5',
    ];

    return (
        <div className="event-page">
            <div className="event-hero">
                <img src={event.image} alt={event.title} className="event-hero-image" />
                <div className="event-hero-overlay">
                    <div className="event-header">
                        <div className="event-space-badges">
                            {topSpaces.map((match) => (
                                <SpaceBadge key={match.spaceId} spaceId={match.spaceId} size="lg" />
                            ))}
                        </div>
                        <h1 className="event-title">{event.title}</h1>
                        <div className="event-meta">
                            <div className="event-meta-item">
                                <CalendarDays size={20} />
                                <div>
                                    <div className="event-meta-label">Date & Time</div>
                                    <div className="event-meta-value">{event.fullDate}</div>
                                    <div className="event-meta-sub">{event.time}</div>
                                </div>
                            </div>
                            <div className="event-meta-item">
                                <MapPin size={20} />
                                <div>
                                    <div className="event-meta-label">Location</div>
                                    <div className="event-meta-value">{event.location}</div>
                                    <div className="event-meta-sub">{event.address}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="event-content">
                <div className="event-details">
                    <div className="event-description">
                        <h2>About this event</h2>
                        <p>{event.description}</p>
                    </div>

                    <div className="event-tags">
                        {event.tags && event.tags.map((tag, i) => (
                            <span key={i} className="event-tag">{tag}</span>
                        ))}
                    </div>

                    <div className="event-actions">
                        <button className="btn btn-primary btn-lg">
                            <CheckCircle2 size={20} />
                            Get Tickets — {event.price}
                        </button>
                        <div className="action-buttons">
                            <button className="btn btn-secondary">
                                <Heart size={18} />
                                Save
                            </button>
                            <button className="btn btn-secondary">
                                <Share2 size={18} />
                                Share
                            </button>
                        </div>
                    </div>
                </div>

                <div className="event-sidebar">
                    <div className="sidebar-card">
                        <h3>Hosted by</h3>
                        <div className="host-info">
                            <div className="host-avatar">
                                <img src={`https://i.pravatar.cc/150?u=${event.hostName}`} alt={event.hostName} />
                            </div>
                            <div className="host-details">
                                <div className="host-name">{event.hostName}</div>
                                <div className="host-role">Event Host</div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-card">
                        <h3>Attendees ({attendees.length})</h3>
                        <div className="attendees-grid">
                            {attendees.map((avatar, i) => (
                                <img key={i} src={avatar} alt={`Attendee ${i + 1}`} className="attendee-avatar" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventPage;