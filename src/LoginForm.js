import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';

function LoginForm({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Начальное состояние для загрузки
  const { setUserId } = useUser();

  // Проверка сессии при загрузке компонента
  useEffect(() => {
    const jwtToken = Cookies.get('jwt');
    if (jwtToken) {
      fetch('https://pandaturapi.com/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        credentials: 'include',
      })
        .then(response => response.json())
        .then(data => {
          if (data.user_id) {
            setUserId(data.user_id);
            onLoginSuccess(); // Переход к основному контенту при успешной проверке сессии
          }
        })
        .catch(error => console.error('Ошибка при проверке сессии:', error))
        .finally(() => setIsLoading(false)); // Убираем индикатор загрузки
    } else {
      setIsLoading(false); // Если токен отсутствует, сразу убираем индикатор загрузки
    }
  }, [onLoginSuccess, setUserId]);

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
    //   setMessage('Validation failed');
    //   return;
    // }

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
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>; // Показ индикатора загрузки
  }

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
          className="input-field"
        />

        {!isLogin && (
          <input
            name="username"
            value={form.username}
            onChange={handleInputChange}
            placeholder="Username"
            className="input-field"
          />
        )}

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleInputChange}
          placeholder="Password"
          className="input-field"
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