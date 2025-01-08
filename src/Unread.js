import React, { createContext, useState, useEffect, useContext } from 'react';
import { useSocket } from './SocketContext'; // Импортируем сокет-контекст
import { useUser } from './UserContext'; // Получаем контекст пользователя

// Контекст для непрочитанных сообщений
const UnreadMessagesContext = createContext();

export const useUnreadMessages = () => {
    return useContext(UnreadMessagesContext);
};

export const UnreadMessagesProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [messages, setMessages] = useState([]); // Основное состояние сообщений
    const { userId } = useUser(); // Получаем userId из UserContext
    const socket = useSocket(); // Получаем WebSocket из SocketContext

    // Обновление количества непрочитанных сообщений
    const updateUnreadCount = (updatedMessages) => {
        // Убедимся, что updatedMessages — это массив
        if (!Array.isArray(updatedMessages)) {
            console.error('Expected an array for updatedMessages, but got:', updatedMessages);
            setUnreadCount(0);  // Если это не массив, устанавливаем 0
            return;
        }

        // Проверка на наличие сообщений
        if (updatedMessages.length === 0) {
            setUnreadCount(0);  // Если сообщений нет, устанавливаем 0
            return;
        }

        // Фильтрация непрочитанных сообщений
        const unreadMessages = updatedMessages.filter(
            (msg) =>
                (!msg.seen_at || !msg.seen_by?.includes(String(userId))) &&
                msg.sender_id !== Number(userId)
        );

        // Установка количества непрочитанных сообщений
        setUnreadCount(unreadMessages.length);
    };

    // Пометка сообщений как прочитанных
    const markMessagesAsRead = (clientId) => {
        setMessages((prev) => {
            // Если prev не является массивом, вернем пустой массив
            if (!Array.isArray(prev)) {
                console.error('prev is not an array:', prev);
                return [];
            }

            const updatedMessages = prev.map((msg) =>
                msg.client_id === clientId && !msg.seen_at
                    ? { ...msg, seen_at: new Date().toISOString() }
                    : msg
            );

            updateUnreadCount(updatedMessages); // Обновляем счётчик
            return updatedMessages;
        });
    };

    const fetchMessages = () => {
        fetch('https://pandatur-api.com/messages')
            .then((res) => res.json())
            .then((data) => {
                setMessages(data);
                updateUnreadCount(data);
            })
            .catch((error) => console.error('Error fetching messages:', error));
    };

    // Загрузка сообщений при монтировании компонента
    useEffect(() => {
        fetchMessages();
    }, [userId]);

    // Обработка WebSocket-сообщений
    useEffect(() => {
        if (socket) {
            const handleNewMessage = (event) => {
                const message = JSON.parse(event.data);
                // console.log('Received message:', message);

                if (message.type === 'message') {
                    setMessages((prev) => {
                        const updatedMessages = [...prev, message.data];
                        updateUnreadCount(updatedMessages);
                        return updatedMessages;
                    });
                } else if (message.type === 'seen') {
                    const { client_id, seen_at } = message.data;
                    setMessages((prev) => {
                        const updatedMessages = prev.map((msg) => {
                            if (msg.client_id === client_id && !msg.seen_at) {
                                // console.log('Message being updated:', msg, 'New seen_at:', seen_at);
                                return { ...msg, seen_at };
                            }
                            return msg;
                        });
                        fetchMessages();

                        // console.log('Updated messages for client_id:', client_id, updatedMessages.filter(msg => msg.client_id === client_id));
                        return updatedMessages;
                    });
                }
            };

            socket.addEventListener('message', handleNewMessage);

            return () => {
                socket.removeEventListener('message', handleNewMessage);
            };
        }
    }, [socket, userId]);

    // Обновление счётчика непрочитанных сообщений
    useEffect(() => {
        updateUnreadCount(messages);
    }, [messages]);

    return (
        <UnreadMessagesContext.Provider value={{ unreadCount, markMessagesAsRead }}>
            {children}
        </UnreadMessagesContext.Provider>
    );
};