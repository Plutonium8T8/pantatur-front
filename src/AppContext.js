import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import Cookies from 'js-cookie';
import { useSnackbar } from 'notistack';
import { FaEnvelope, FaTrash } from 'react-icons/fa';
import { useUser } from './UserContext';
import { truncateText } from './stringUtils';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children, isLoggedIn }) => {
  const socketRef = useRef(null); // Вместо useState
  const [tickets, setTickets] = useState([]);
  const [ticketIds, setTicketIds] = useState([]);
  const [messages, setMessages] = useState([]); // Все сообщения
  const [clientMessages, setClientMessages] = useState([]); // Сообщения клиента из API
  const [unreadCount, setUnreadCount] = useState(0); // Непрочитанные сообщения
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useUser(); // Получаем userId из UserContext
  const ticketsRef = useRef(tickets);
  const [unreadMessages, setUnreadMessages] = useState(new Map()); // Оптимизированное хранение непрочитанных сообщений

  // Инициализация WebSocket
  // Инициализация WebSocket и подключение к чат-румам при логине
  useEffect(() => {
    if (!isLoggedIn) {
      setTickets([]);
      setTicketIds([]);
      setMessages([]);
      setUnreadCount(0);
      setClientMessages([]);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    const connectToChatRooms = (ticketIds) => {
      const socketInstance = socketRef.current; // Используем socketRef.current
      if (!socketInstance || socketInstance.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket не подключён или недоступен.');
        return;
      }

      if (!ticketIds || ticketIds.length === 0) {
        console.warn('Нет client_id для подключения к комнатам.');
        return;
      }

      const socketMessage = JSON.stringify({
        type: 'connect',
        data: { client_id: ticketIds },
      });

      socketInstance.send(socketMessage);
      console.log('Подключён к комнатам клиентов:', ticketIds);
    };

    if (!socketRef.current) {
      const socketInstance = new WebSocket('ws://34.88.101.80:8080');
      socketRef.current = socketInstance;

      socketInstance.onopen = async () => {
        console.log('WebSocket подключен');
        const tickets = await fetchTickets();
        const ticketIds = tickets.map((ticket) => ticket.client_id);
        connectToChatRooms(ticketIds);
      };

      socketInstance.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };

      socketInstance.onclose = () => console.warn('WebSocket закрыт');
      socketInstance.onerror = (error) => console.error('WebSocket ошибка:', error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [isLoggedIn]);

  useEffect(() => {
    console.log("Количество непрочитанных сообщений:", unreadCount);
    // Здесь можно выполнить любое действие при изменении unreadCount
  }, [unreadCount]);


  const updateUnreadMessages = (newMessages) => {
    const unread = newMessages.filter(
      (msg) =>
        msg.seen_by != null && msg.seen_by == '{}' && msg.sender_id == msg.client_id

    );
    console.log("Все сообщения:", newMessages);
    console.log("Непрочитанные сообщения:", unread);
    console.log("Количество непрочитанных:", unread.length);

    setUnreadCount(unread.length);
  };


  const markMessagesAsRead = (clientId) => {
    setMessages((prevMessages) => {
      const updatedMessages = prevMessages.map((msg) =>
        msg.client_id === clientId && (!msg.seen_by || msg.seen_by === '{}')
          ? { ...msg, seen_by: `{${userId}}`, seen_at: new Date().toISOString() }
          : msg
      );

      // Удаляем прочитанные сообщения из `unreadMessages`
      const updatedUnreadMap = new Map(unreadMessages);
      updatedMessages.forEach((msg) => {
        if (msg.client_id === clientId && msg.seen_by !== '{}') {
          updatedUnreadMap.delete(msg.id);
        }
      });
      console.log("Обновленные сообщения после чтения:", updatedMessages);


      setUnreadMessages(updatedUnreadMap);
      return updatedMessages;
    });
  };

  // Функция загрузки тикетов
  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('jwt');

      if (!token) {
        console.warn('Нет токена. Пропускаем загрузку тикетов.');
        return [];
      }

      const response = await fetch('https://pandatur-api.com/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Ошибка при получении тикетов. Код статуса: ${response.status}`);
      }

      const data = await response.json();
      console.log("Загруженные тикеты:", data);

      setTickets(data); // Сохраняем тикеты в состоянии
      setTicketIds(data.map((ticket) => ticket.client_id)); // Сохраняем client_id

      return data; // Возвращаем массив тикетов
    } catch (error) {
      console.error('Ошибка при загрузке тикетов:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicket = async (updateData) => {
    try {
      const token = Cookies.get('jwt');
      if (!token) {
        throw new Error('Token is missing. Authorization required.');
      }

      const response = await fetch(`https://pandatur-api.com/tickets/${updateData.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          `Error updating ticket: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorDetails)}`
        );
      }

      const updatedTicket = await response.json();

      // // Локальное обновление тикетов
      // setTickets((prevTickets) =>
      //   prevTickets.map((ticket) =>
      //     ticket.client_id === updatedTicket.client_id ? updatedTicket : ticket
      //   )
      // );

      // Синхронизация тикетов через WebSocket
      return updatedTicket;
    } catch (error) {
      console.error('Error updating ticket:', error.message || error);
      throw error;
    }
  };

  // Функция загрузки сообщений клиента
  const getClientMessages = async () => {
    try {
      const token = Cookies.get('jwt');
      if (!token) {
        console.warn('Нет токена. Пропускаем загрузку сообщений.');
        return;
      }

      const response = await fetch('https://pandatur-api.com/messages', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Сообщения, загруженные из API:", data);

      setMessages(data); // Обновляем состояние всех сообщений
      updateUnreadMessages(data); // Считаем непрочитанные сообщения
    } catch (error) {
      enqueueSnackbar('Не удалось получить сообщения!', { variant: 'error' });
      console.error('Ошибка при получении сообщений:', error.message);
    }
  };

  // Обработка сообщений через WebSocket
  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'message': {
        console.log("Новое сообщение из WebSocket:", message.data);

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, message.data];

          // Проверяем, если сообщение от оператора
          if (message.data.sender_id === 1) {
            console.log("Сообщение от оператора через WebSocket:", message.data);
          } else {
            // Если сообщение от клиента, обновляем непрочитанные
            updateUnreadMessages(updatedMessages);
          }

          return updatedMessages;
        });

        const ticket = ticketsRef.current.find(
          (t) => t.client_id === message.data.client_id
        );

        if (ticket && ticket.technician_id === userId) {
          const messageText = truncateText(message.data.message, 40);
          enqueueSnackbar(
            '',
            {
              variant: 'info',
              action: (snackbarId) => (
                <div className="snack-bar-notification">
                  <div
                    className="snack-object"
                    onClick={() => closeSnackbar(snackbarId)}
                  >
                    <div className="snack-icon">
                      <FaEnvelope />
                    </div>
                    <div className="snack-message">
                      {message.data.client_id}: {messageText}
                    </div>
                  </div>
                  <div className="snack-close">
                    <button onClick={() => closeSnackbar(snackbarId)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ),
            }
          );
        }
        break;
      }
      case 'seen': {
        const { client_id, seen_at } = message.data;
        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.map((msg) =>
            msg.client_id === client_id ? { ...msg, seen_at } : msg
          );
          updateUnreadMessages(updatedMessages);
          return updatedMessages;
        });
        break;
      }
      case 'ticket': {
        fetchTickets();
        console.log("Пришел тикет:", message.data);

        // Извлекаем client_id из сообщения
        const clientId = message.data.client_id;

        if (!clientId) {
          console.warn("Не удалось извлечь client_id из сообщения типа 'ticket'.");
          break;
        }

        const socketInstance = socketRef.current; // Используем socketRef.current
        if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
          const socketMessage = JSON.stringify({
            type: 'connect',
            data: { client_id: [clientId] }, // Подключаемся только к комнате с этим client_id
          });

          socketInstance.send(socketMessage);
          console.log(
            `Подключено к комнате клиента с client_id=${clientId}. Отправлено сообщение:`,
            socketMessage
          );
        } else {
          console.warn("Не удалось подключиться к комнатам. WebSocket не готов.");
          console.log(
            "Состояние WebSocket:",
            socketInstance ? socketInstance.readyState : "Нет WebSocket соединения"
          );
        }
        break;
      }
      case 'notification': {
        const notificationText = truncateText(
          message.data.description || 'Уведомление с пустым текстом!',
          100
        );
        enqueueSnackbar(notificationText, { variant: 'info' });
        break;
      }
      case 'task': {
        enqueueSnackbar(`Новое задание: ${message.data.title}`, { variant: 'warning' });
        break;
      }
      case 'pong':
        break;
      default:
        console.warn('Неизвестный тип сообщения:', message.type);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      getClientMessages();
    }
  }, [isLoggedIn]);

  return (
    <AppContext.Provider
      value={{
        tickets,
        setTickets,
        ticketIds,
        messages,
        setMessages,
        unreadCount,
        markMessagesAsRead,
        clientMessages,
        isLoading,
        updateTicket,
        fetchTickets,
        socketRef
        // unreadCount: unreadMessages.size, // Количество непрочитанных сообщений
      }}
    >
      {children}
    </AppContext.Provider>
  );
};