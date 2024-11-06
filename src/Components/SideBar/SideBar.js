import React, { useState } from 'react';
import './SideBar.css';

const CustomSidebar = ({ onNavigate }) => {
    const [isCollapsed, setIsCollapsed] = useState(false); // Состояние для отслеживания развернутости

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed); // Меняем состояние
    };

    return (
        <div className={`container-side-bar${isCollapsed ? 'collapsed' : ''}`}>
            <div className='menu-side-bar'>
                <div onClick={toggleSidebar} className='toggle-button'>
                    {isCollapsed ? '▶' : '◀'} {/* Символы для развернутого и свернутого состояния */}
                </div>
                <div className='container-item-menu'>
                    <div className={`menu-item ${isCollapsed ? 'collapsed-item' : ''}`} onClick={() => onNavigate('workflowdashboard')}>
                        {isCollapsed ? '📊' : '📊 Workflow Dashboard'} {/* Символ для пункта меню */}
                    </div>
                    <div className={`menu-item ${isCollapsed ? 'collapsed-item' : ''}`} onClick={() => onNavigate('chat')}>
                        {isCollapsed ? '💬' : '💬 Chat'} {/* Символ для пункта меню */}
                    </div>
                    <div className={`menu-item ${isCollapsed ? 'collapsed-item' : ''}`} onClick={() => onNavigate('test')}>
                        {isCollapsed ? '📋' : '📋 Test'} {/* Символ для пункта меню */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomSidebar;
