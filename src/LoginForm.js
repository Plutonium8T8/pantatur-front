import React, { useState } from 'react';
import './LoginForm.css';
import Cookies from 'js-cookie';

function LoginForm({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*\W).{1,180}$/;

    if (form.email.length > 180 || !emailPattern.test(form.email)) return false;
    if (!isLogin && form.username.length > 180) return false;
    if (form.password.length > 180 || !passwordPattern.test(form.password)) return false;

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setMessage('Validation failed');
      return;
    }

    setIsLoading(true);
    const url = isLogin
      ? 'https://pandaturapi-293102893820.europe-central2.run.app/api/login'
      : 'https://pandaturapi-293102893820.europe-central2.run.app/api/register';
    const data = isLogin ? { email: form.email, password: form.password } : form;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      setMessage(responseData.message);

      if (isLogin && response.ok) {
        // Установка JWT-куки
        const token = responseData.token; // Убедитесь, что токен приходит в ответе
        Cookies.set('jwt', token, { expires: 7, secure: true, sameSite: 'strict' });

        onLoginSuccess();
      } else {
        setMessage(responseData.message || 'An error occurred');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='body-login-form'>
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

        {isLoading && <div className="spinner"></div>}

        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
}

export default LoginForm;
