import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Импорт стилей для календаря

const AdminPanel = () => {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Panel</h1>
      <div>
        <h2>Календарь</h2>
        <Calendar 
          onChange={handleDateChange} 
          value={date} 
        />
        <p>Выбранная дата: {date.toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default AdminPanel;