import { Link } from 'react-router-dom';
import { Plus, User, Compass, Settings, BarChart2 } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <img src={logo} alt="Sezino Logo" style={{ height: '32px', marginRight: '8px' }} />
                sezino
            </Link>
            <div className="navbar-actions">
                <Link to="/spaces" className="nav-link">
                    <Compass size={18} />
                    Explore
                </Link>
                <Link to="/dashboard" className="nav-link">
                    <BarChart2 size={18} />
                    Analytics
                </Link>
                <Link to="/create-event">
                    <button className="btn btn-secondary">
                        <Plus size={18} />
                        Create Event
                    </button>
                </Link>
                <Link to="/waitlist">
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                        Waitlist
                    </button>
                </Link>
                <Link to="/settings" className="nav-icon-link" title="Settings">
                    <Settings size={20} color="#a1a1aa" />
                </Link>
                <Link to="/auth" className="profile-avatar" title="Sign In">
                    <User size={20} color="#a1a1aa" />
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
