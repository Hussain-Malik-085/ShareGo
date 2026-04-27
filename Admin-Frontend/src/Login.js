import React, { useState } from 'react';
import './Login.css';
import Dashboard from './Dashboard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Hardcoded credentials for the four members
  const validUsers = [
    { email: 'fa21-bce-087@cuilahore.edu.pk', password: '1234' },
    { email: 'fa21-bce-083@cuilahore.edu.pk', password: '1234' },
    { email: 'fa21-bce-085@cuilahore.edu.pk', password: '1234' },
    { email: 'fa21-bce-016@cuilahore.edu.pk', password: '1234' },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const user = validUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
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