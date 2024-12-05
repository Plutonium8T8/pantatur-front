import React, { useState } from 'react';
import './LoginForm.css';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';
import { useSocket } from './SocketContext';

function LoginForm({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUserId } = useUser();
  const socket = useSocket(); // Получаем WebSocket из контекста
  const [errorMessage, setErrorMessage] = useState(''); // Состояние для ошибок
  const [tickets, setTickets] = useState([]);
  const [ticketIds, setTicketIds] = useState([]); // Состояние для хранения ID тикетов

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
    setIsLoading(true);
    const url = isLogin
      ? 'https://pandaturapi.com/api/login'
      : 'https://pandaturapi.com/api/register';
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
        await fetchTicketsID(); // Дожидаемся получения тикетов
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
      setIsLoading(true); // Показываем индикатор загрузки
      const token = Cookies.get('jwt');
      const response = await fetch('https://pandaturapi.com/api/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.warn('Ошибка 401: Неавторизован. Перенаправляем на логин.');
        setErrorMessage('Ошибка авторизации. Попробуйте снова.');
        return;
      }

      if (!response.ok) {
        throw new Error('Ошибка при получении ID тикетов');
      }

      const data = await response.json();
      const tickets = data[0]; // Доступ к первому элементу
      const TicketIds = tickets.map((ticket) => ticket.id);

      setTicketIds(TicketIds);
      setTickets(tickets);

      // Отправляем сообщение в WebSocket после успешного получения ID
      if (socket && socket.readyState === WebSocket.OPEN) {
        const message = {
          type: 'connect',
          data: {
            client_id: TicketIds, // Используем полученные ID
          },
        };
        socket.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setErrorMessage('Ошибка при загрузке ID тикетов');
    } finally {
      setIsLoading(false); // Скрываем индикатор загрузки
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

        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
}

export default LoginForm;