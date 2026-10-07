import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import AuthPage from './components/AuthPage';
import Footer from './components/Footer';
import { 
  INITIAL_FUNCTIONS, 
  INITIAL_CONTAINERS, 
  INITIAL_LOGS, 
  STRATEGIES_INFO 
} from './data/initialData';

// Component that syncs Clerk user state when ClerkProvider is active
function ClerkAuthSync({ onSyncUser }) {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      onSyncUser({
        name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || "Clerk Developer",
        email: user.primaryEmailAddress?.emailAddress || "developer@podlaunch.io",
        role: "Clerk Authenticated Engineer",
        avatar: user.imageUrl || (user.firstName ? user.firstName[0] : "C"),
        token: user.id
      });
    }
  }, [isSignedIn, user, onSyncUser]);

  return null;
}

export default function App({ isClerkEnabled = false }) {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard' | 'auth'
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

  const handleOpenAuth = (mode = 'signin', openPage = true) => {
    setAuthMode(mode);
    if (openPage) {
      setCurrentView('auth');
    } else {
      setIsAuthOpen(true);
    }
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
      {/* Sync Clerk Session if enabled */}
      {isClerkEnabled && <ClerkAuthSync onSyncUser={setCurrentUser} />}

      {/* Top Navbar */}
      <Navbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onOpenAuth={(mode) => handleOpenAuth(mode, true)}
        onLogout={handleLogout}
        activeStrategy={activeStrategy}
        onOpenStrategyModal={() => setCurrentView('dashboard')}
      />

      {/* Main View Area */}
      <main className="main-content">
        {currentView === 'landing' && (
          <LandingPage 
            onLaunchConsole={() => setCurrentView('dashboard')}
            onOpenAuth={(mode) => handleOpenAuth(mode, true)}
            activeStrategy={activeStrategy}
            setActiveStrategy={setActiveStrategy}
          />
        )}

        {currentView === 'dashboard' && (
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

        {currentView === 'auth' && (
          <AuthPage 
            initialMode={authMode}
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentView('dashboard')}
            isClerkEnabled={isClerkEnabled}
            clerkUser={currentUser}
            onClerkSignOut={handleLogout}
          />
        )}
      </main>

      {/* Quick Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Academic Capstone Footer */}
      <Footer 
        onNavigate={(view) => {
          setCurrentView(view);
        }}
      />
    </div>
  );
}
