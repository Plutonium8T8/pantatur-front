import React, { useState } from 'react';
import './LoginForm.css';
import Cookies from 'js-cookie';
import { useUser } from '../../UserContext';

const LoginForm = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUserId } = useUser();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setMessage('Invalid email address.');
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return false;
    }
    if (!isLogin && !form.username) {
      setMessage('Username is required for registration.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const url = isLogin
      ? 'https://pandatur-api.com/api/login'
      : 'https://pandatur-api.com/api/register';
    const data = isLogin ? { email: form.email, password: form.password } : form;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          "Origin": 'https://pandaturcrm.com',
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessage(responseData.message || 'Success!');
        if (isLogin) {
          Cookies.set('jwt', responseData.token, {
            secure: true, // Ensures the cookie is sent over HTTPS
            sameSite: 'None', // Allows cross-origin requests
            expires: 1, // Cookie expiration in days
          });
          setUserId(responseData.user_id);
          console.log(responseData.user_id);
          onLoginSuccess();
        }
      } else {
        switch (response.status) {
          case 400:
            setMessage('Bad request. Please check your input.');
            break;
          case 401:
            setMessage('Unauthorized. Please check your credentials.');
            break;
          default:
            setMessage('An unexpected error occurred.');
        }
      }
    } catch (error) {
      setMessage('An error occurred while communicating with the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setForm({ ...form, username: '' });
    setMessage('');
  };

  return (
    <div className="body-login">
      <div className="body-login-form">
        <div className="login-form">
          <h2>{isLogin ? 'Login' : 'Register'}</h2>

          {!isLogin && (
            <input
              name="username"
              value={form.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="input-field-login"
              disabled={isLoading}
            />
          )}

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="input-field-login"
            disabled={isLoading}
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="input-field-login"
            disabled={isLoading}
          />

          <div className="button-container">
            <button onClick={handleSubmit} className="submit-button" id='login-button' disabled={isLoading}>
              {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
            </button>

            <button onClick={handleSwitch} className="switch-button" disabled={isLoading}>
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>

          {isLoading && (
            <div className="spinner-overlay-login">
              <div className="spinner-login"></div>
            </div>
          )}
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;