import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      nav('/');
    } catch (err) {
      alert('Failed to register');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '1rem auto' }}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <label>Name
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label style={{ marginTop: 8 }}>Email
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={{ marginTop: 8 }}>Password
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <div style={{ marginTop: 10 }}>
          <button className="button" type="submit">Register</button>
        </div>
      </form>
    </div>
  );
}