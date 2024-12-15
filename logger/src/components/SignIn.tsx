import React, { useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';

interface SignInProps {
  onClose: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onClose }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onClose(); // Close popup on successful sign-in
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear user state after sign-out
      onClose(); // Optionally close the popup after sign-out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
        {user ? (
          <div>
            <h2>Welcome, {user.displayName}</h2>
            <img
              src={user.photoURL}
              alt="Profile"
              style={{ borderRadius: '50%', marginTop: '10px', width: '80px', height: '80px' }}
            />
            <p>Email: {user.email}</p>
            <button
              onClick={handleSignOut}
              style={signOutButtonStyle}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <h1>Sign in with Google</h1>
            <button
              onClick={handleSignIn}
              style={signInButtonStyle}
            >
              Sign In with Google
            </button>
          </div>
        )}
        <button onClick={onClose} style={closeButtonStyle}>
          Close
        </button>
      </div>
    </div>
  );
};

// Styling for the popup and buttons
const overlayStyle = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const popupStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  textAlign: 'center' as const,
  width: '300px',
};

const signInButtonStyle = {
  padding: '10px 20px',
  backgroundColor: 'steelblue',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginBottom: '10px',
};

const signOutButtonStyle = {
  padding: '10px 20px',
  backgroundColor: 'red',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px',
};

const closeButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#555',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px',
};

export default SignIn;
