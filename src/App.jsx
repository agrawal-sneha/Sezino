import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventPage from './pages/EventPage';
import SpacesPage from './pages/SpacesPage';
import SettingsPage from './pages/SettingsPage';
import WaitlistPage from './pages/WaitlistPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/event/:id" element={<EventPage />} />
            <Route path="/spaces" element={<SpacesPage />} />
            <Route path="/spaces/:category" element={<SpacesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
