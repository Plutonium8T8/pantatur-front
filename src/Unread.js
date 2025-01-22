import React, { createContext, useState, useEffect, useContext } from 'react';
import { useSocket } from './SocketContext'; // Импортируем сокет-контекст
import { useUser } from './UserContext'; // Получаем контекст пользователя

const UnreadMessagesContext = createContext();

export const useUnreadMessages = () => {
    return useContext(UnreadMessagesContext);
};

export const UnreadMessagesProvider = ({ children, isLoggedIn }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [messages, setMessages] = useState([]); // Инициализируем как пустой массив
    const { userId } = useUser(); // Получаем userId из UserContext
    const socket = useSocket(); // Получаем WebSocket из SocketContext

    const updateUnreadCount = (updatedMessages) => {
        if (!Array.isArray(updatedMessages)) {
            console.error('Expected an array for updatedMessages, but got:', updatedMessages);
            setUnreadCount(0);
            return;
        }

        const unreadMessages = updatedMessages.filter(
            (msg) =>
                msg.seen_by != null && msg.seen_by == '{}' && msg.sender_id == msg.client_id

        );

        setUnreadCount(unreadMessages.length);
    };

    const markMessagesAsRead = (clientId) => {
        setMessages((prev = []) => {
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
                if (!Array.isArray(data)) {
                    console.error('Expected array but got:', data);
                    data = [];
                }
                setMessages(data);
                updateUnreadCount(data);
            })
            .catch((error) => console.error('Error fetching messages:', error));
    };

    useEffect(() => {
        if (isLoggedIn && userId) {
            fetchMessages(); // Запрос только после логирования и наличия userId
        }
    }, [isLoggedIn, userId]);

    useEffect(() => {
        if (socket) {
            const handleNewMessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'message') {
                        setMessages((prev = []) => {
                            message.data['seen_by'] = '{}';
                            message.data['seen_at'] = '';
                            const updatedMessages = [...prev, message.data];
                            fetchMessages();
                            updateUnreadCount(updatedMessages);
                            return updatedMessages;
                        });
                    } else if (message.type === 'seen') {
                        const { client_id, seen_at } = message.data;
                        setMessages((prev = []) => {
                            const updatedMessages = prev.map((msg) =>
                                msg.client_id === client_id && !msg.seen_at
                                    ? { ...msg, seen_at }
                                    : msg
                            );
                            return updatedMessages;
                        });
                        fetchMessages();
                    }
                } catch (error) {
                    console.error('Error handling new message:', error);
                }
            };

            socket.addEventListener('message', handleNewMessage);

            return () => {
                socket.removeEventListener('message', handleNewMessage);
            };
        }
    }, [socket]);

    useEffect(() => {
        updateUnreadCount(messages);
    }, [messages]);

    return (
        <UnreadMessagesContext.Provider value={{ unreadCount, markMessagesAsRead }}>
            {children}
        </UnreadMessagesContext.Provider>
    );
};