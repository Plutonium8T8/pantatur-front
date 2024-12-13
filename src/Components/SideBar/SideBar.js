import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Для работы с cookies
import './SideBar.css';

const CustomSidebar = ({ unreadMessagesCount, unreadNotificationsCount }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Определение активного раздела на основе пути
    const isActive = (page) => {
        if (page === 'chat') {
            return location.pathname.startsWith('/chat');
        }
        return location.pathname === `/${page}`;
    };

    const handleNavigate = (page) => {
        navigate(`/${page}`);
    };

    const handleLogOut = () => {
        // Удаление токена из cookies
        Cookies.remove('jwt');
        // Перенаправление на страницу входа
        window.location.reload(); // Перезагрузка страницы
    };

    return (
        <div className="container-side-bar">
            <div className="menu-side-bar">
                <div className="container-item-menu">
                    <div
                        className={`menu-item ${isActive('account') ? 'active' : ''}`}
                        onClick={() => handleNavigate('account')}
                    >
                        👤 <br />Account
                    </div>
                    <div
                        className={`menu-item ${isActive('dashboard') ? 'active' : ''}`}
                        onClick={() => handleNavigate('dashboard')}
                    >
                        📊 <br />Dashboard
                    </div>
                    <div
                        className={`menu-item ${isActive('leads') ? 'active' : ''}`}
                        onClick={() => handleNavigate('leads')}
                    >
                        📝 <br />Leads
                    </div>
                    <div
                        className={`menu-item ${isActive('chat') ? 'active' : ''}`}
                        onClick={() => handleNavigate('chat')}
                    >
                        💬 <br />Chat
                        {unreadMessagesCount > 0 && (
                            <span className="unread-indicator">{unreadMessagesCount}</span>
                        )}
                    </div>
                    <div
                        className={`menu-item ${isActive('mail') ? 'active' : ''}`}
                        onClick={() => handleNavigate('mail')}
                    >
                        ✉️ <br />Mail
                    </div>
                    <div
                        className={`menu-item ${isActive('notifications') ? 'active' : ''}`}
                        onClick={() => handleNavigate('notifications')}
                    >
                        🔔 <br />Notifications
                        {unreadNotificationsCount > 0 && (
                            <span className="unread-indicator">{unreadNotificationsCount}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="container-log-out">
                <div className="menu-item" onClick={handleLogOut}>
                    🚪 <br />Log Out
                </div>
            </div>
        </div>
    );
};

export default CustomSidebar;