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
        if (!Array.isArray(updatedMessages)) {
            console.error('Expected an array for updatedMessages, but got:', updatedMessages);
            setUnreadCount(0);
            return;
        }

        if (updatedMessages.length === 0) {
            setUnreadCount(0);
            return;
        }

        const unreadMessages = updatedMessages.filter(
            (msg) =>
                (!msg.seen_at || !msg.seen_by?.includes(String(userId))) &&
                msg.sender_id !== Number(userId)
        );

        setUnreadCount(unreadMessages.length);
    };

    // Пометка сообщений как прочитанных
    const markMessagesAsRead = (clientId) => {
        setMessages((prev) => {
            if (!Array.isArray(prev)) {
                console.error('prev is not an array:', prev);
                return [];
            }

            const updatedMessages = prev.map((msg) =>
                msg.client_id === clientId && !msg.seen_at
                    ? { ...msg, seen_at: new Date().toISOString() }
                    : msg
            );

            updateUnreadCount(updatedMessages);
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

    // Выполнение запроса только после логина
    useEffect(() => {
        if (userId) {
            fetchMessages();
        }
    }, [userId]);

    // Обработка WebSocket-сообщений
    useEffect(() => {
        if (socket) {
            const handleNewMessage = (event) => {
                const message = JSON.parse(event.data);

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
                                return { ...msg, seen_at };
                            }
                            return msg;
                        });
                        fetchMessages();
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

    useEffect(() => {
        updateUnreadCount(messages);
    }, [messages]);

    return (
        <UnreadMessagesContext.Provider value={{ unreadCount, markMessagesAsRead }}>
            {children}
        </UnreadMessagesContext.Provider>
    );
};