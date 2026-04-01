import { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import '../styles/WaitlistPage.css';
import { addToWaitlist } from '../services/api';

const WaitlistPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setErrorMessage('Please enter a valid email address.');
            setStatus('error');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            await addToWaitlist(email);
            setStatus('success');
            setEmail('');
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="waitlist-container">
            <div className="background-glow"></div>
            <div className="waitlist-card">
                {status === 'success' ? (
                    <div className="success-state fade-in">
                        <div className="success-icon-wrapper">
                            <CheckCircle2 size={48} className="success-icon" />
                        </div>
                        <h2 className="waitlist-title">You're on the list!</h2>
                        <p className="waitlist-subtitle">We'll notify you as soon as Sezino goes live. Keep an eye on your inbox.</p>
                        <button className="btn btn-secondary back-btn" onClick={() => setStatus('idle')}>
                            Join another email
                        </button>
                    </div>
                ) : (
                    <div className="form-state fade-in">
                        <div className="badge">
                            <Sparkles size={14} className="sparkle-icon" />
                            <span>Early Access</span>
                        </div>
                        <h2 className="waitlist-title">Get early access to Sezino.</h2>
                        <p className="waitlist-subtitle">Join the exclusive waitlist to be the first to host and discover beautiful events in your city.</p>

                        <form onSubmit={handleSubmit} className="waitlist-form">
                            <div className="input-group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className={`waitlist-input ${status === 'error' ? 'error-border' : ''}`}
                                    disabled={status === 'loading'}
                                />
                                <button
                                    type="submit"
                                    className={`btn btn-primary waitlist-submit ${status === 'loading' ? 'loading' : ''}`}
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        <>Join Now <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </div>
                            {status === 'error' && <p className="error-text slide-down">{errorMessage}</p>}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaitlistPage;