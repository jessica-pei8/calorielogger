import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <Link to="/" style={styles.navLink}>
            Home
          </Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/records" style={styles.navLink}>
            Activity Records
          </Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/meals" style={styles.navLink}>
            Meal Records
          </Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/schedule" style={styles.navLink}>
            Schedule
          </Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/complete-profile" style={styles.navLink}>
            Edit Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#333',
    padding: '10px 20px',
  },
  navList: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
  },
  navItem: {
    marginRight: '20px',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
  },
};

export default Navbar;
