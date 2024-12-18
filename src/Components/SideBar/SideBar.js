import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Для работы с cookies
import './SideBar.css';
import { useUser } from '../../UserContext';

const CustomSidebar = ({ unreadCount }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userId } = useUser(); // Получаем userId из контекста
    const token = Cookies.get('jwt'); // Получаем токен
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0); // Для хранения количества непрочитанных сообщений

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

    // useEffect(() => {
    //     if (userId && token) { // Проверяем, что userId и token существуют
    //         console.log("Запрос на получение непрочитанных сообщений...");

    //         const fetchUnreadMessages = () => {
    //             fetch(`https://pandatur-api.com/messages/unseen/${userId}`, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             })
    //                 .then((response) => {
    //                     console.log("Ответ от сервера получен:", response); // Логируем сам ответ от сервера
    //                     return response.json();
    //                 })
    //                 .then((data) => {
    //                     console.log("Полученные данные:", data); // Логируем полученные данные

    //                     // Проверяем, что data не пустая и извлекаем unseen_message_count
    //                     if (data && data.length > 0) {
    //                         const unreadMessagesCount = data[0].unseen_message_count;
    //                         console.log("Непрочитанные сообщения:", unreadMessagesCount); // Логируем количество непрочитанных сообщений
    //                         setUnreadMessagesCount(unreadMessagesCount);
    //                     } else {
    //                         console.log("Нет непрочитанных сообщений.");
    //                     }
    //                 })
    //                 .catch((error) => {
    //                     console.error('Ошибка при получении сообщений:', error); // Логируем ошибку
    //                 });
    //         };

    //         // Вызов функции для получения сообщений
    //         fetchUnreadMessages();
    //     } else {
    //         console.log("Недостаточно данных для выполнения запроса: userId или token отсутствуют.");
    //     }
    // }, [userId, token]); // Эффект с зависимостями от userId и token

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