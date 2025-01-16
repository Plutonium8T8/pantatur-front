import React, { useState } from 'react';
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

  const handleSubmit = async () => {
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
        }
      }
    } catch (error) {
      setMessage('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitch = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="body-login">
      <div className="body-login-form">
        <div className="login-form">
          <h2>{isLogin ? 'Login' : 'Register'}</h2>

          <input
            name="username"
            value={form.username}
            onChange={handleInputChange}
            placeholder="Username"
            className={`input-field-login ${isLogin ? 'hidden' : ''}`}
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Email"
            className={`input-field-login ${isLogin ? 'slide' : ''}`}
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Password"
            className={`input-field-login ${isLogin ? 'slide' : ''}`}
          />

          <div className="button-container">
            <button onClick={handleSubmit} className="submit-button" disabled={isLoading}>
              {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
            </button>

            <button
              onClick={handleSwitch}
              className="switch-button"
              disabled={isLoading}
            >
              Switch to {isLogin ? 'Register' : 'Login'}
            </button>
          </div>

          {isLoading && (
            <div className="spinner-overlay">
              <div className="spinner"></div>
            </div>
          )}
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
