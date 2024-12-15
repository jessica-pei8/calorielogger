import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import SignIn from './SignIn';

const Header: React.FC = () => {
  const { user } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  const toggleSignInPopup = () => {
    setShowSignIn((prev) => !prev);
  };

  return (
    <header style={headerStyle}>
      <h2>Logger</h2>
      {user ? (
        <div style={userInfoStyle} onClick={toggleSignInPopup}>
          <img
            src={user.photoURL ?? 'https://via.placeholder.com/40'}
            alt="Profile"
            style={profileImgStyle}
            referrerPolicy="no-referrer"
          />
          <span>{user.displayName}</span>
        </div>
      ) : (
        <button onClick={toggleSignInPopup} style={signInButtonStyle}>
          Sign In
        </button>
      )}
      {showSignIn && <SignIn onClose={toggleSignInPopup} />}
    </header>
  );
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  backgroundColor: '#f4f4f4',
};

const userInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
};

const profileImgStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  marginRight: '10px',
};

const signInButtonStyle = {
  padding: '10px 20px',
  backgroundColor: 'steelblue',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default Header;
