import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Используем хук useNavigate
import './SideBar.css';

const CustomSidebar = ({ onNavigate }) => {
    const [activeItem, setActiveItem] = useState('account'); // Начальное состояние для активного элемента
    const navigate = useNavigate(); // Получаем функцию для навигации

    const handleNavigate = (page) => {
        setActiveItem(page); // Устанавливаем активный элемент
        if (page !== 'chat') {
            navigate(page); // Навигация на нужную страницу (для всего кроме чата)
        }
        onNavigate(page); // Передаем функцию для открытия чата (если это чат)
    };

    return (
        <div className='container-side-bar'>
            <div className="menu-side-bar">
                <div className="container-item-menu">
                    <div
                        className={`menu-item ${activeItem === 'account' ? 'active' : ''}`}
                        onClick={() => handleNavigate('account')}
                    >
                        👤 Account
                    </div>
                    <div
                        className={`menu-item ${activeItem === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleNavigate('dashboard')}
                    >
                        📊 Dashboard
                    </div>
                    <div
                        className={`menu-item ${activeItem === 'workflowdashboard' ? 'active' : ''}`}
                        onClick={() => handleNavigate('workflowdashboard')}
                    >
                        📝 <br/>Leads
                    </div>
                    <div
                        className={`menu-item ${activeItem === 'chat' ? 'active' : ''}`}
                        onClick={() => handleNavigate('chat')}
                    >
                        💬 <br/>Chat
                    </div>
                    <div
                        className={`menu-item ${activeItem === 'mail' ? 'active' : ''}`}
                        onClick={() => handleNavigate('mail')}
                    >
                        ✉️ <br/>Mail
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomSidebar;