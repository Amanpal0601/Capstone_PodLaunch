import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { 
  INITIAL_FUNCTIONS, 
  INITIAL_CONTAINERS, 
  INITIAL_LOGS, 
  STRATEGIES_INFO 
} from './data/initialData';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [currentUser, setCurrentUser] = useState({
    name: "Aman Pal",
    email: "amanpal@podlaunch.local",
    role: "Function Registry & API Lead (Group-22)",
    avatar: "AP",
    token: "jwt_mock_podlaunch_amanpal"
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  // Core Platform Global State
  const [activeStrategy, setActiveStrategy] = useState('predictive');
  const [functions, setFunctions] = useState(INITIAL_FUNCTIONS);
  const [containers, setContainers] = useState(INITIAL_CONTAINERS);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  const handleOpenAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeStrategy={activeStrategy}
        onOpenStrategyModal={() => setCurrentView('dashboard')}
      />

      {/* Main View Area */}
      <main className="main-content">
        {currentView === 'landing' ? (
          <LandingPage 
            onLaunchConsole={() => setCurrentView('dashboard')}
            onOpenAuth={handleOpenAuth}
            activeStrategy={activeStrategy}
            setActiveStrategy={setActiveStrategy}
          />
        ) : (
          <Dashboard 
            functions={functions}
            setFunctions={setFunctions}
            containers={containers}
            setContainers={setContainers}
            logs={logs}
            setLogs={setLogs}
            activeStrategy={activeStrategy}
            setActiveStrategy={setActiveStrategy}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Academic Capstone Footer */}
      <Footer 
        onNavigate={(view, tab) => {
          setCurrentView(view);
        }}
      />
    </div>
  );
}
