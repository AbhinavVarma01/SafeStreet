import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Reports', path: '/reports' },
    { name: 'Status', path: '/status' },
    { name: 'Settings', path: '/Settings' },
  ];

  return (
    <>
      {/* Top bar with small bell icon */}
      <div style={styles.topbar}>
        <div style={styles.bellIcon}>
          <FaBell size={12} />
        </div>
      </div>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>Smart Road</h2>
          <ul style={styles.navLinks}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    ...styles.link,
                    backgroundColor: location.pathname === item.path ? '#2e2e48' : 'transparent',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

const styles = {
  topbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '48px',
    backgroundColor: '#1e1e2f',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0 15px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    zIndex: 1100,
  },
  bellIcon: {
    padding: '6px',
    borderRadius: '50%',
    cursor: 'pointer',
    backgroundColor: '#2e2e48',
    color: '#ffffff',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
  },
  sidebar: {
    width: '220px',
    height: '100vh',
    position: 'fixed',
    top: '48px', // adjust to match topbar height
    left: 0,
    backgroundColor: '#1e1e2f',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    justifyContent: 'flex-start',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  logo: {
    fontSize: '24px',
    marginBottom: '30px',
    fontWeight: 'bold',
    color: '#00ffff',
  },
  navLinks: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 15px',
    borderRadius: '8px',
    transition: 'background-color 0.3s',
  },
};

export default Navbar;
