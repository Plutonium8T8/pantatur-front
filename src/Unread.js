import React, { createContext, useState, useEffect, useContext } from 'react';
import { useSocket } from './SocketContext'; // Импортируем сокет-контекст
import { UserProvider, useUser } from './UserContext';

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
        const unreadMessagesCount = updatedMessages.filter(
            (msg) =>
                (!msg.seen_by || !msg.seen_by.includes(String(userId))) &&
                msg.sender_id !== Number(userId)
        ).length;
        setUnreadCount(unreadMessagesCount);
    };

    // Загрузка сообщений из API (только при монтировании компонента)
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

    // Пометка сообщений как прочитанных
    const markMessagesAsRead = (clientId) => {
        const relevantMessages = messages.filter(
            (msg) => msg.client_id === clientId && !msg.seen_at && msg.sender_id !== Number(userId)
        );

        if (relevantMessages.length === 0) return;

        const readMessageData = {
            type: 'seen',
            data: {
                client_id: clientId,
                sender_id: Number(userId),
            },
        };

        try {
            socket.send(JSON.stringify(readMessageData));
            console.log('Sent mark as read for client:', clientId);

            // Обновляем локально состояние
            setMessages((prev) =>
                prev.map((msg) =>
                    relevantMessages.includes(msg) ? { ...msg, seen_at: new Date().toISOString() } : msg
                )
            );
        } catch (error) {
            console.error('Error sending mark as read:', error);
        }
    };

    // Обработка WebSocket-сообщений
    useEffect(() => {
        if (socket) {
            // Очистка старого обработчика при изменении сокета
            const handleNewMessage = (event) => {
                const message = JSON.parse(event.data);

                if (message.type === 'message') {
                    setMessages((prev) => {
                        const updatedMessages = [...prev, message.data];
                        // Вызываем обновление количества непрочитанных сообщений
                        updateUnreadCount(updatedMessages);
                        return updatedMessages;
                    });
                } else if (message.type === 'seen') {
                    const { client_id, seen_at } = message.data;
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.client_id === client_id && !msg.seen_at
                                ? { ...msg, seen_at: seen_at }
                                : msg
                        )
                    );
                }
            };

            // Подписка на новые сообщения
            socket.addEventListener('message', handleNewMessage);

            // Очистка при размонтировании или изменении сокета
            return () => {
                socket.removeEventListener('message', handleNewMessage);
            };
        }
    }, [socket, userId]); // Привязка к сокету и userId

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