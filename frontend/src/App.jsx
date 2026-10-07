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

import { syncUserWithSupabase } from './services/supabase';

// Component that syncs live Clerk user session
function ClerkAuthSync({ onSyncUser, currentView, setCurrentView }) {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        const profile = {
          name: user.fullName || user.username || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || "Developer",
          email: user.primaryEmailAddress?.emailAddress || "",
          role: "Clerk Authenticated Engineer",
          avatar: user.imageUrl || (user.firstName ? user.firstName[0] : "C"),
          token: user.id
        };
        onSyncUser(profile);

        // Automatically persist user profile into Supabase public.users table
        syncUserWithSupabase(user);

        if (currentView === 'auth') {
          setCurrentView('dashboard');
        }
      } else {
        onSyncUser(null);
      }
    }
  }, [isLoaded, isSignedIn, user, onSyncUser, currentView, setCurrentView]);

  return null;
}

export default function App({ isClerkEnabled = true }) {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard' | 'auth'
  const [currentUser, setCurrentUser] = useState(null); // null when logged out
  const [authMode, setAuthMode] = useState('signin');

  // Core Platform Global State
  const [activeStrategy, setActiveStrategy] = useState('predictive');
  const [functions, setFunctions] = useState(INITIAL_FUNCTIONS);
  const [containers, setContainers] = useState(INITIAL_CONTAINERS);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  const clerk = useClerk();

  const handleOpenAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setCurrentView('auth');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      if (clerk?.signOut) {
        await clerk.signOut();
      }
    } catch (err) {
      console.error("Clerk sign-out error:", err);
    }
    setCurrentUser(null);
    setAuthMode('signin');
    setCurrentView('auth'); // Immediately require login again
  };

  return (
    <div className="app-container">
      {/* Sync Clerk Session */}
      {isClerkEnabled && (
        <ClerkAuthSync 
          onSyncUser={setCurrentUser} 
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      )}

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
        {currentView === 'landing' && (
          <LandingPage 
            onLaunchConsole={() => setCurrentView(currentUser ? 'dashboard' : 'auth')}
            onOpenAuth={handleOpenAuth}
            activeStrategy={activeStrategy}
            setActiveStrategy={setActiveStrategy}
          />
        )}

        {currentView === 'dashboard' && (
          currentUser ? (
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
          ) : (
            <AuthPage 
              initialMode="signin"
              onLoginSuccess={handleLoginSuccess}
              onBack={() => setCurrentView('landing')}
              isClerkEnabled={isClerkEnabled}
            />
          )
        )}

        {currentView === 'auth' && (
          <AuthPage 
            initialMode={authMode}
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentView(currentUser ? 'dashboard' : 'landing')}
            isClerkEnabled={isClerkEnabled}
          />
        )}
      </main>

      {/* Academic Capstone Footer */}
      <Footer 
        onNavigate={(view) => {
          setCurrentView(view);
        }}
      />
    </div>
  );
}
