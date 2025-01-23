import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import Cookies from 'js-cookie';
import { useSnackbar } from 'notistack';
import { FaEnvelope, FaTrash } from 'react-icons/fa';
import { useUser } from './UserContext';
import { truncateText } from './stringUtils';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children, isLoggedIn }) => {
  const [socket, setSocket] = useState(null);
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
  const fetchTicketsAndSendSocket = async (socketInstance) => {
    try {
      setIsLoading(true);
      const token = Cookies.get('jwt');
      if (!token) {
        console.warn('Нет токена. Пропускаем загрузку тикетов.');
        return;
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
      const ticketIds = data.map((ticket) => ticket.client_id);

      setTickets(data);
      setTicketIds(ticketIds);

      console.log("tickets", data);

      if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
        const socketMessage = JSON.stringify({ type: 'connect', data: { client_id: ticketIds } });
        socketInstance.send(socketMessage);
      }
    } catch (error) {
      console.error('Ошибка при загрузке тикетов:', error);
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
      fetchTicketsAndSendSocket();

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
          updateUnreadMessages(updatedMessages);
          return updatedMessages;
        });

        const ticket = ticketsRef.current.find(t => t.client_id === message.data.client_id);

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
        console.log("Обновление тикета через WebSocket:", message.data);

        fetchTicketsAndSendSocket(socket);
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
        fetchTicketsAndSendSocket();
        break;
      }
      case 'pong':
        break;
      default:
        console.warn('Неизвестный тип сообщения:', message.type);
    }
  };

  // Инициализация WebSocket
  useEffect(() => {
    if (!isLoggedIn) {
      setTickets([]);
      setTicketIds([]);
      setMessages([]);
      setUnreadCount(0);
      setClientMessages([]);
      if (socket) {

      }
      return;
    }

    const socketInstance = new WebSocket('ws://34.88.101.80:8080');

    socketInstance.onopen = () => {
      console.log('WebSocket подключен');
      fetchTicketsAndSendSocket(socketInstance);
    };

    socketInstance.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Ошибка обработки сообщения WebSocket:', error);
      }
    };

    socketInstance.onclose = () => alert('WebSocket закрыт');
    socketInstance.onerror = (error) => console.error('WebSocket ошибка:', error);

    setSocket(socketInstance);

    return () => {

    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      getClientMessages();
    }
  }, [isLoggedIn]);

  return (
    <AppContext.Provider
      value={{
        socket,
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
        // unreadCount: unreadMessages.size, // Количество непрочитанных сообщений
      }}
    >
      {children}
    </AppContext.Provider>
  );
};