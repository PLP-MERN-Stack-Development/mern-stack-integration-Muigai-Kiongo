import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      nav('/');
    } catch (err) {
      alert('Failed to login');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '1rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Email
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={{ marginTop: 8 }}>Password
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <div style={{ marginTop: 10 }}>
          <button className="button" type="submit">Login</button>
          <Link to="/register" style={{ marginLeft: 10 }}>Create account</Link>
        </div>
      </form>
    </div>
  );
}