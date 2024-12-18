import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { UserProvider } from './UserContext'; // Импортируем UserProvider

ReactDOM.render(
  <UserProvider> {/* Оборачиваем App в UserProvider */}
    <App />
  </UserProvider>,
  document.getElementById('root')
);