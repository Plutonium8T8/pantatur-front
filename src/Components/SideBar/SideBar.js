import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './SideBar.css';
import { useUnreadMessages } from '../../Unread';
import { FaUser, FaChartBar, FaTasks, FaComments, FaBell, FaClipboardList, FaSignOutAlt, FaUserSecret } from 'react-icons/fa';

const CustomSidebar = ({ onOpenNotifications, onOpenTasks, onOpenAccount }) => {
    const location = useLocation();
    const navigate = useNavigate();
    // const { unreadCount } = useUnreadMessages();

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
                        onClick={onOpenAccount}
                    >
                        <FaUser size={24} />
                        <span>Account</span>
                    </div>
                    <div
                        className={`menu-item ${isActive('dashboard') ? 'active' : ''}`}
                        onClick={() => handleNavigate('dashboard')}
                    >
                        <FaChartBar size={24} />
                        <span>Dashboard</span>
                    </div>
                    <div
                        className={`menu-item ${isActive('leads') ? 'active' : ''}`}
                        onClick={() => handleNavigate('leads')}
                    >
                        <FaClipboardList size={24} />
                        <span>Leads</span>
                    </div>
                    <div
                        className={`menu-item ${isActive('chat') ? 'active' : ''}`}
                        onClick={() => handleNavigate('chat')}
                    >
                        <FaComments size={24} />
                        <span>Chat</span>
                        {/* {unreadCount > 0 && (
                            <span className="unread-indicator">{unreadCount}</span>
                        )} */}
                    </div>
                    <div
                        className={`menu-item ${isActive('notifications') ? 'active' : ''}`}
                        onClick={onOpenNotifications}
                    >
                        <FaBell size={24} />
                        <span>Notifications</span>
                    </div>
                    <div
                        className={`menu-item ${isActive('tasks') ? 'active' : ''}`}
                        onClick={onOpenTasks}
                    >
                        <FaTasks size={24} />
                        <span>Tasks</span>
                    </div>
                    <div
                        className={`menu-item ${isActive('admin-panel') ? 'active' : ''}`}
                        onClick={() => handleNavigate('admin-panel')}
                    >
                        <FaUserSecret size={24} />
                        <span>Admin</span>
                    </div>
                </div>
            </div>
            <div className="container-log-out">
                <div className="menu-item" onClick={handleLogOut}>
                    <FaSignOutAlt size={24} />
                    <span>Log Out</span>
                </div>
            </div>
        </div>
    );
};

export default CustomSidebar;