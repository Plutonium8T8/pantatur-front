import React, { useState } from 'react';
import './SideBar.css';

const CustomSidebar = ({ onNavigate }) => {
    const [activeItem, setActiveItem] = useState('account'); // Начальное состояние для активного элемента

    const handleNavigate = (page) => {
        setActiveItem(page); // Устанавливаем активный элемент
        onNavigate(page); // Вызываем переданную функцию для навигации
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
