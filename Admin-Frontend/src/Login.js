import React, { useState } from 'react';
import './Login.css';
import Dashboard from './Dashboard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Admin panel: only these emails; password is always 1234 (client-side gate; do not expose backend secrets here).
  const ADMIN_EMAILS = ['zain03mns@edu.pk', 'ahsan14mns@edu.pk'];
  const ADMIN_PASSWORD = '1234';

  const handleLogin = (e) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    const allowed = ADMIN_EMAILS.some((a) => a.toLowerCase() === normalized);
    const ok = allowed && password === ADMIN_PASSWORD;

    if (ok) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid email or password');
    }
  };

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Admin Login</h2>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default Login;