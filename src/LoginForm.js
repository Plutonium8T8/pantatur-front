import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';
import { useSocket } from './SocketContext';

const LoginForm = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUserId } = useUser();
  const socket = useSocket(); // Получаем WebSocket из контекста
  const [tickets, setTickets] = useState([]);
  const [ticketIds, setTicketIds] = useState([]); // Состояние для ID тикетов

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*\W).{1,180}$/;

    return (
      emailPattern.test(form.email) &&
      (!isLogin || form.username.length <= 180) &&
      passwordPattern.test(form.password) &&
      form.email.length <= 180 &&
      form.password.length <= 180
    );
  };

  const handleSubmit = async () => {
    // if (!validateForm()) {
    //   setMessage('Некорректные данные');
    //   return;
    // }

    setIsLoading(true);
    const url = isLogin
      ? 'https://pandatur-api-1022490157093.europe-north1.run.app/api/login'
      : 'https://pandatur-api-1022490157093.europe-north1.run.app/api/register';
    const data = isLogin ? { email: form.email, password: form.password } : form;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const responseData = await response.json();
      setMessage(responseData.message);

      if (isLogin && response.ok) {
        Cookies.set('jwt', responseData.token, { expires: 7, secure: true, sameSite: 'strict' });
        setUserId(responseData.user_id);
        onLoginSuccess();
        await fetchTicketsID();
      }
    } catch (error) {
      setMessage('Произошла ошибка');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketsID = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('jwt');
      const response = await fetch('https://pandatur-api-1022490157093.europe-north1.run.app/api/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        setMessage('Ошибка авторизации. Попробуйте снова.');
        return;
      }

      if (!response.ok) {
        throw new Error('Ошибка при получении ID тикетов');
      }

      const data = await response.json();
      const tickets = data[0];
      const ticketIds = tickets.map((ticket) => ticket.id);

      setTicketIds(ticketIds);
      setTickets(tickets);

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'connect', data: { client_id: ticketIds } }));
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setMessage('Ошибка при загрузке тикетов');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="body-login-form">
      <div className="login-form">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleInputChange}
          placeholder="Email"
          className="input-field-loghin"
        />

        {!isLogin && (
          <input
            name="username"
            value={form.username}
            onChange={handleInputChange}
            placeholder="Username"
            className="input-field-loghin"
          />
        )}

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleInputChange}
          placeholder="Password"
          className="input-field-loghin"
        />

        <button onClick={handleSubmit} className="submit-button" disabled={isLoading}>
          {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="switch-button"
          disabled={isLoading}
        >
          Switch to {isLogin ? 'Register' : 'Login'}
        </button>

        {isLoading && (
          <div className="spinner-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;