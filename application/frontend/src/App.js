import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import TodoList from './components/TodoList';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  const handleAuthSuccess = (newToken, newUserId, newUsername) => {
    setToken(newToken);
    setUserId(newUserId);
    setUsername(newUsername);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('username', newUsername);
  };

  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  };

  return (
    <div className="App">
      <h1>Todo Application</h1> {/* Moved H1 outside the main content container */}
      {token ? (
        <div className="todo-list-container"> {/* Apply container class directly */}
          <p>Welcome, {username}!</p>
          <button onClick={handleLogout}>Logout</button>
          <TodoList userId={userId} token={token} />
        </div>
      ) : (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;
