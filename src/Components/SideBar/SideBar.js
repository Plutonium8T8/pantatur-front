import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './SideBar.css';
import { useUnreadMessages } from '../../Unread';

const CustomSidebar = ({ onOpenNotifications }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { unreadCount } = useUnreadMessages();

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
        Cookies.remove('jwt');
        window.location.reload();
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
                        {unreadCount > 0 && (
                            <span className="unread-indicator">{unreadCount}</span>
                        )}
                    </div>
                    <div
                        className={`menu-item ${isActive('notifications') ? 'active' : ''}`}
                        onClick={onOpenNotifications} // Вызываем функцию открытия модального окна
                    >
                        🔔 <br />Notifications
                    </div>
                    <div
                        className={`menu-item ${isActive('admin-panel') ? 'active' : ''}`}
                        onClick={() => handleNavigate('admin-panel')}
                    >
                        🗓️ <br />Admin Panel
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