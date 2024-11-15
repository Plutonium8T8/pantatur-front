import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SideBar.css';

const CustomSidebar = () => {
    const location = useLocation(); // Получаем текущий URL
    const navigate = useNavigate();
    
    // Устанавливаем начальный активный элемент на основе текущего пути
    const currentPage = location.pathname.substring(1) || 'account';

    const handleNavigate = (page) => {
        navigate(`/${page}`); // Навигация на нужную страницу
    };

    return (
        <div className='container-side-bar'>
            <div className="menu-side-bar">
                <div className="container-item-menu">
                    <div
                        className={`menu-item ${currentPage === 'account' ? 'active' : ''}`}
                        onClick={() => handleNavigate('account')}
                    >
                        👤 <br />Account
                    </div>
                    <div
                        className={`menu-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleNavigate('dashboard')}
                    >
                        📊 <br />Dashboard
                    </div>
                    <div
                        className={`menu-item ${currentPage === 'workflowdashboard' ? 'active' : ''}`}
                        onClick={() => handleNavigate('workflowdashboard')}
                    >
                        📝 <br />Leads
                    </div>
                    <div
                        className={`menu-item ${currentPage === 'chat' ? 'active' : ''}`}
                        onClick={() => handleNavigate('chat')}
                    >
                        💬 <br />Chat
                    </div>
                    <div
                        className={`menu-item ${currentPage === 'mail' ? 'active' : ''}`}
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