import React, { useState } from 'react';
import axios from 'axios';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
      const endpoint = isLogin ? '/signin' : '/signup';
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, { username, password });
      setMessage(response.data.message);
      setIsError(false);
      if (response.data.user_id) {
        onAuthSuccess('some_token', response.data.user_id, username); // Token is not implemented in backend yet, using placeholder
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'An error occurred');
      setIsError(true);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <p>
        <a href="#" onClick={() => setIsLogin(!isLogin)} className="App-link">
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </a>
      </p>
      {message && <p className={isError ? 'error-message' : 'success-message'}>{message}</p>}
    </div>
  );
};

export default Auth;
