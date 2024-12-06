import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SideBar.css';

const CustomSidebar = ({ unreadMessagesCount }) => {
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

    return (
        <div className='container-side-bar'>
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
                        className={`menu-item ${isActive('workflowdashboard') ? 'active' : ''}`}
                        onClick={() => handleNavigate('workflowdashboard')}
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
                </div>
            </div>
        </div>
    );
};

export default CustomSidebar;