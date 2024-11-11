import React, { useState } from 'react';
import './UserProfile.css';  // Импортируем стили

const UserProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Тут можно добавить логику отправки данных на сервер
    console.log('User data submitted:', formData);
  };

  return (
    <div className="container">
      <div className="left">
        <img
          src="/user fon.png" // Замените на свой URL изображения
          alt="User"
          className="profile-image"
        />
      </div>
      <div className="right">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
            />
          </div>

          <button type="submit" className="button">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;