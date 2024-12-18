import React, { createContext, useState, useEffect, useContext } from 'react';
import { useSocket } from './SocketContext'; // Импортируем сокет-контекст
import { UserProvider, useUser } from './UserContext';

// Контекст для непрочитанных сообщений
const UnreadMessagesContext = createContext();

export const useUnreadMessages = () => {
    return useContext(UnreadMessagesContext);
};

export const UnreadMessagesProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0); // Состояние для хранения количества непрочитанных сообщений
    const [messages, setMessages] = useState([]); // Массив сообщений
    const [tickets, setTickets] = useState([]); // Массив тикетов
    const { userId } = useUser(); // Получаем userId из UserContext
    const socket = useSocket(); // Получаем WebSocket из SocketContext

    // Загрузка начальных данных сообщений и тикетов
    useEffect(() => {
        fetch('https://pandatur-api.com/messages')
            .then((res) => res.json())
            .then((data) => {
                console.log('Messages received from API:', data);
                setMessages(data); // Сохраняем полученные сообщения в состояние

                // Подсчитываем количество непрочитанных сообщений
                const unreadMessagesCount = data.filter(
                    (msg) =>
                        (!msg.seen_by || !msg.seen_by.includes(String(userId))) &&
                        msg.sender_id !== Number(userId)
                ).length;
                console.log('Unread messages count from API:', unreadMessagesCount);
                setUnreadCount(unreadMessagesCount); // Обновляем количество непрочитанных сообщений
            })
            .catch((error) => {
                console.error('Error fetching messages:', error);
            });
    }, [userId]);

    // Подсчёт непрочитанных сообщений при изменении сообщений или тикетов
    useEffect(() => {
        if (!userId || !messages.length || !tickets.length) return;

        console.log('Messages or tickets changed, recalculating unread messages...');
        const unreadMessages = tickets.reduce((total, ticket) => {
            const chatMessages = messages.filter((msg) => msg.client_id === ticket.id);
            console.log(`Chat messages for ticket ${ticket.id}:`, chatMessages);

            const unreadForTicket = chatMessages.filter(
                (msg) =>
                    (!msg.seen_by || !msg.seen_by.includes(String(userId))) &&
                    msg.sender_id !== Number(userId)
            ).length;
            console.log(`Unread messages for ticket ${ticket.id}:`, unreadForTicket);

            return total + unreadForTicket;
        }, 0);

        console.log('Total unread messages:', unreadMessages);
        setUnreadCount(unreadMessages); // Обновляем количество непрочитанных сообщений
    }, [userId, messages, tickets]);

    // Обработка WebSocket-сообщений
    useEffect(() => {
        if (socket) {
            console.log('Socket is ready, waiting for messages...');
            socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('Received WebSocket message:', message);
                    if (message.type === 'message' && !message.data.seen_at) {
                        console.log('Unread message detected from WebSocket');
                        setUnreadCount((prev) => prev + 1); // Увеличиваем количество непрочитанных сообщений
                    }
                } catch (error) {
                    console.error('Ошибка WebSocket:', error);
                }
            };
        }

        return () => {
            if (socket) socket.onmessage = null; // Очистка сокета при выходе
        };
    }, [socket]);

    // Логируем текущее состояние
    useEffect(() => {
        console.log('Unread count:', unreadCount);
        console.log('Messages:', messages);
        console.log('Tickets:', tickets);
        console.log('User ID:', userId);
    }, [unreadCount, messages, tickets, userId]);

    return (
        <UnreadMessagesContext.Provider value={{ unreadCount }}>
            {children}
        </UnreadMessagesContext.Provider>
    );
};