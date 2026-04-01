import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import '../styles/AuthPage.css';
import { register, login, mockGoogleAuth, mockAppleAuth } from '../services/api';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleGoogleAuth = async () => {
        setStatus('loading-google');
        setErrorMessage('');
        try {
            const result = await mockGoogleAuth();
            // Store token in localStorage
            localStorage.setItem('auth_token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            // Redirect to dashboard or home
            window.location.href = '/dashboard';
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.message || 'Google authentication failed. Please try again.');
        }
    };

    const handleAppleAuth = async () => {
        setStatus('loading-apple');
        setErrorMessage('');
        try {
            const result = await mockAppleAuth();
            // Store token in localStorage
            localStorage.setItem('auth_token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            // Redirect to dashboard or home
            window.location.href = '/dashboard';
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.message || 'Apple authentication failed. Please try again.');
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setErrorMessage('Please fill in all fields.');
            setStatus('error');
            return;
        }

        if (!isLogin && !name) {
            setErrorMessage('Please enter your name.');
            setStatus('error');
            return;
        }

        setStatus('loading-email');
        setErrorMessage('');

        try {
            let result;
            if (isLogin) {
                result = await login(email, password);
            } else {
                result = await register(email, password, name);
            }
            // Store token in localStorage
            localStorage.setItem('auth_token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            // Redirect to dashboard or home
            window.location.href = '/dashboard';
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background-glow"></div>
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <div className="badge">
                        <Sparkles size={14} className="sparkle-icon" />
                        <span>{isLogin ? 'Welcome Back' : 'Join Sezino'}</span>
                    </div>
                    <h2 className="auth-title">
                        {isLogin ? 'Log in to your account' : 'Create an account'}
                    </h2>
                    <p className="auth-subtitle">
                        {isLogin ? 'Enter your details to access your events.' : 'Start discovering and hosting beautiful events.'}
                    </p>
                </div>

                <div className="auth-social">
                    <button
                        className={`btn-google ${status === 'loading-google' ? 'loading' : ''}`}
                        onClick={handleGoogleAuth}
                        disabled={status.startsWith('loading')}
                    >
                        {status === 'loading-google' ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>
                    <button
                        className={`btn-apple ${status === 'loading-apple' ? 'loading' : ''}`}
                        onClick={handleAppleAuth}
                        disabled={status.startsWith('loading')}
                    >
                        {status === 'loading-apple' ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.6 3.59 7.58 9.93 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.8 1.5.12 2.55.72 3.25 1.72-2.93 1.82-2.23 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.03.03zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000"/>
                                </svg>
                                Continue with Apple
                            </>
                        )}
                    </button>
                </div>

                <div className="auth-divider">
                    <span>or continue with email</span>
                </div>

                <form onSubmit={handleEmailAuth} className="auth-form">
                    {!isLogin && (
                        <div className="input-group-vertical">
                            <label>Full name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="auth-input"
                                disabled={status.startsWith('loading')}
                            />
                        </div>
                    )}
                    <div className="input-group-vertical">
                        <label>Email address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="auth-input"
                            disabled={status.startsWith('loading')}
                        />
                    </div>
                    <div className="input-group-vertical">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="auth-input"
                            disabled={status.startsWith('loading')}
                        />
                    </div>

                    {status === 'error' && <p className="error-text slide-down">{errorMessage}</p>}

                    <button
                        type="submit"
                        className={`btn btn-primary auth-submit ${status === 'loading-email' ? 'loading' : ''}`}
                        disabled={status.startsWith('loading')}
                    >
                        {status === 'loading-email' ? (
                            <div className="spinner"></div>
                        ) : (
                            <>{isLogin ? 'Log In' : 'Sign Up'} <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            className="toggle-auth-mode"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setErrorMessage('');
                            }}
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;