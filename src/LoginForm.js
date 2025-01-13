import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';

const LoginForm = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUserId } = useUser();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const validateForm = () => {
  //   const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  //   const passwordPattern = /^(?=.*[A-Z])(?=.*\\W).{1,180}$/;

  //   return (
  //     emailPattern.test(form.email) &&
  //     (!isLogin || form.username.length <= 180) &&
  //     passwordPattern.test(form.password) &&
  //     form.email.length <= 180 &&
  //     form.password.length <= 180
  //   );
  // };

  const handleSubmit = async () => {
    // if (!validateForm()) {
    //   setMessage('Некорректные данные');
    //   return;
    // }

    setIsLoading(true);
    const url = isLogin
      ? 'https://pandatur-api.com/api/login'
      : 'https://pandatur-api.com/api/register';
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

      if (response.ok) {
        if (isLogin) {
          Cookies.set('jwt', responseData.token, { expires: 7, secure: true, sameSite: 'strict' });
          setUserId(responseData.user_id);
          onLoginSuccess();
          console.log('Успешная авторизация');
        } else {
          console.log('Успешная регистрация');
        }
      } else {
        if (isLogin) {
          console.log('Неудачная авторизация');
        } else {
          console.log('Неудачная регистрация');
        }
      }
    } catch (error) {
      setMessage('Произошла ошибка');
      console.error('Ошибка сервера:', error);
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
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default LoginForm;