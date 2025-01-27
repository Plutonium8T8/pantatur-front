import React from 'react';
import ReactDOM from 'react-dom/client'; // Импортируем createRoot из 'react-dom/client'
import './index.css';
import App from './App';
import { UserProvider } from './UserContext'; // Импортируем UserProvider

const root = ReactDOM.createRoot(document.getElementById('root')); // Создаем корень для рендеринга
root.render(
  <UserProvider> {/* Оборачиваем App в UserProvider */}
    <App />
  </UserProvider>
);