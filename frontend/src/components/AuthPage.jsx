import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';

// Custom Neo-Brutalist Theme tokens for Clerk components
const clerkNeoBrutalistAppearance = {
  elements: {
    rootBox: {
      width: '100%',
      maxWidth: '440px',
      margin: '0 auto',
    },
    card: {
      background: '#FFFFFF',
      border: '3.5px solid #000000',
      boxShadow: '7px 7px 0px #000000',
      borderRadius: '12px',
      padding: '2.5rem 2rem',
      width: '100%',
    },
    headerTitle: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: '900',
      fontSize: '1.65rem',
      color: '#000000',
      letterSpacing: '-0.03em',
      textAlign: 'center',
    },
    headerSubtitle: {
      color: '#475569',
      fontSize: '0.9rem',
      textAlign: 'center',
      marginBottom: '1rem',
    },
    socialButtonsBlockButton: {
      border: '2.5px solid #000000',
      borderRadius: '6px',
      boxShadow: '3px 3px 0px #000000',
      fontWeight: '800',
      fontFamily: 'Outfit, sans-serif',
      transition: 'all 0.1s ease',
      height: '44px',
      '&:hover': {
        background: '#F8FAFC',
        transform: 'translate(-1px, -1px)',
        boxShadow: '4px 4px 0px #000000',
      }
    },
    socialButtonsBlockButtonText: {
      fontWeight: '800',
      color: '#000000',
    },
    dividerLine: {
      background: '#000000',
      height: '1.5px',
    },
    dividerText: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: '800',
      fontSize: '0.75rem',
      color: '#64748B',
      textTransform: 'uppercase',
    },
    formFieldLabel: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: '800',
      fontSize: '0.8rem',
      color: '#000000',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    },
    formFieldInput: {
      border: '2px solid #000000',
      borderRadius: '6px',
      boxShadow: '2px 2px 0px #000000',
      fontWeight: '600',
      fontSize: '0.95rem',
      padding: '0.75rem 1rem',
      '&:focus': {
        background: '#FFFDF0',
        borderColor: '#000000',
        boxShadow: '4px 4px 0px #000000',
      }
    },
    formButtonPrimary: {
      background: '#FFE600',
      color: '#000000',
      border: '2.5px solid #000000',
      borderRadius: '6px',
      boxShadow: '3px 3px 0px #000000',
      fontWeight: '900',
      fontFamily: 'Outfit, sans-serif',
      fontSize: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      height: '46px',
      transition: 'all 0.1s ease',
      '&:hover': {
        background: '#FFD700',
        transform: 'translate(-2px, -2px)',
        boxShadow: '5px 5px 0px #000000',
      }
    },
    footerActionLink: {
      color: '#000000',
      fontWeight: '900',
      textDecoration: 'underline',
      '&:hover': {
        color: '#000000',
      }
    },
    footerActionText: {
      fontWeight: '600',
      color: '#475569',
    },
    identityPreview: {
      border: '2px solid #000000',
      borderRadius: '6px',
      boxShadow: '2px 2px 0px #000000',
    }
  }
};

export default function AuthPage({ 
  onBack, 
  initialMode = 'signin'
}) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'

  return (
    <div className="minimal-auth-viewport">
      {/* Top Header Row with Return Button */}
      <div className="minimal-auth-top">
        <button className="auth-back-btn" onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span>Back to Home</span>
        </button>
        <span className="neo-tag tag-green">CLERK SSO ACTIVE</span>
      </div>

      {/* Centered Single Clerk Auth Container */}
      <div className="clerk-single-centered-wrap">
        {mode === 'signin' ? (
          <SignIn 
            routing="hash"
            appearance={clerkNeoBrutalistAppearance}
            signUpUrl="#signup"
            afterSignInUrl="/"
          />
        ) : (
          <SignUp 
            routing="hash"
            appearance={clerkNeoBrutalistAppearance}
            signInUrl="#signin"
            afterSignUpUrl="/"
          />
        )}
      </div>
    </div>
  );
}
