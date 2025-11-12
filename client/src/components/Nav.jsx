import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Nav() {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav className="nav">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 18 }}>MERN Blog</Link>
        <Link to="/">Home</Link>
        <Link to="/categories">Categories</Link>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ color: '#374151' }}>{user.name}</span>
            <Link to="/posts/new" className="button">New Post</Link>
            <button className="button" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="button">Login</Link>
            <Link to="/register" style={{ marginLeft: 6 }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}