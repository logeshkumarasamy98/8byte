import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoList = ({ userId, token }) => {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    if (userId) {
      fetchTodos();
    }
  }, [userId]);

  const fetchTodos = async () => {
    setMessage('');
    setIsError(false);
    try {
      const response = await axios.get(`${API_BASE_URL}/todoget/${userId}`);
      // Sort todos: incomplete first, then completed
      const sortedTodos = response.data.sort((a, b) => {
        if (a.completed === b.completed) {
          return 0;
        }
        return a.completed ? 1 : -1; // If a is completed, it comes after b (incomplete)
      });
      setTodos(sortedTodos);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to fetch todos');
      setIsError(true);
    }
  };

  const handleAddOrUpdateTodo = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    if (!newTask.trim()) {
      setMessage('Task cannot be empty');
      setIsError(true);
      return;
    }

    try {
      // For simplicity, new tasks get a temporary negative ID, real ID will be assigned by backend
      // This logic should ideally be handled by the backend assigning IDs.
      const newTodoId = todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) + 1 : 1;
      const todoItem = { id: newTodoId, task: newTask, completed: false };
      
      const response = await axios.put(`${API_BASE_URL}/todoupdate/${userId}`, todoItem);
      setMessage(response.data.message);
      setIsError(false);
      setNewTask('');
      fetchTodos(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to add/update todo');
      setIsError(true);
    }
  };

  const handleToggleComplete = async (todoId, currentCompleted, task) => {
    setMessage('');
    setIsError(false);
    try {
      const todoItem = { id: todoId, task: task, completed: !currentCompleted };
      const response = await axios.put(`${API_BASE_URL}/todoupdate/${userId}`, todoItem);
      setMessage(response.data.message);
      setIsError(false);
      fetchTodos(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to update todo status');
      setIsError(true);
    }
  };

  return (
    <div className="todo-list-container">
      <h2>Your Todos</h2>
      <form onSubmit={handleAddOrUpdateTodo}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new todo"
          required
        />
        <button type="submit">Add Todo</button>
      </form>
      {message && <p className={isError ? 'error-message' : 'success-message'}>{message}</p>}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.task}
            </span>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleComplete(todo.id, todo.completed, todo.task)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
