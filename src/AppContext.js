import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import Cookies from 'js-cookie';
import { useSnackbar } from 'notistack';
import { FaEnvelope, FaTrash } from 'react-icons/fa';
import { useUser } from './UserContext';
import { truncateText } from './stringUtils';
import { translations } from './Components/utils/translations';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children, isLoggedIn }) => {
  const socketRef = useRef(null); // Вместо useState
  const [tickets, setTickets] = useState([]);
  const [ticketIds, setTicketIds] = useState([]);
  const [messages, setMessages] = useState([]);
  const [clientMessages, setClientMessages] = useState([]); // Сообщения клиента из API
  const [unreadCount, setUnreadCount] = useState(0); // Непрочитанные сообщения
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useUser(); // Получаем userId из UserContext
  const ticketsRef = useRef(tickets);
  const [unreadMessages, setUnreadMessages] = useState(new Map()); // Оптимизированное хранение непрочитанных сообщений
  const language = localStorage.getItem('language') || 'RO';

  useEffect(() => {
    let pingInterval;

    if (socketRef.current) {
      // Отправка пинга через каждые 4 минуты
      pingInterval = setInterval(() => {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          const pingMessage = JSON.stringify({ type: 'ping' });
          socketRef.current.send(pingMessage);
        }
      }, 5000); // Пинг каждые 4 минуты

      // Очистка интервала при размонтировании компонента или закрытии сокета
      return () => {
        clearInterval(pingInterval);
        if (socketRef.current) {
          socketRef.current.onmessage = null; // Очищаем обработчик сообщений
        }
      };
    }

    return () => { }; // Очистка, если сокет не подключен
  }, []); // useEffect без зависимости от socket, поскольку socketRef.current всегда актуален

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
        console.warn('Нет id для подключения к комнатам.');
        return;
      }

      const socketMessage = JSON.stringify({
        type: 'connect',
        data: { ticket_id: ticketIds },
      });

      socketInstance.send(socketMessage);
      // console.log('Подключён к комнатам клиентов:', ticketIds);
    };

    if (!socketRef.current) {
      const socketInstance = new WebSocket('wss://pandaturws.com');
      socketRef.current = socketInstance;

      socketInstance.onopen = async () => {
        console.log('WebSocket подключен');
        const tickets = await fetchTickets();
        const ticketIds = tickets.map((ticket) => ticket.id);
        connectToChatRooms(ticketIds);
      };

      socketInstance.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };

      socketInstance.onclose = () => {
        // alert(translations["WebSocket off"][language] || "WebSocket este oprit. Te rog să reîncarci pagina!");
        // window.location.reload();
      };
      // socketInstance.onerror = (error) => console.error('WebSocket ошибка:', error);
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


  useEffect(() => {
    const unread = messages.filter(
      (msg) =>
        msg.seen_by != null && msg.seen_by === '{}' &&
        msg.sender_id !== 1 && msg.sender_id !== userId
    );
    console.log("🔄 Обновляем `unreadCount`: ", unread.length);
    setUnreadCount(unread.length);
  }, [messages]);

  const markMessagesAsRead = (ticketId) => {
    if (!ticketId) return;

    const socketInstance = socketRef.current;
    if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
      const readMessageData = {
        type: 'seen',
        data: {
          ticket_id: ticketId,
          sender_id: Number(userId),
        },
      };
      socketInstance.send(JSON.stringify(readMessageData));
      console.log(`✅ Seen отправлен для ticket_id=${ticketId}`);
    } else {
      alert('WebSocket off. Please reload the page!');
    }

    setMessages((prevMessages) => {
      return prevMessages.map((msg) => {
        let seenBy = msg.seen_by;

        if (typeof seenBy === "string") {
          if (/^{\d+}$/.test(seenBy)) {
            seenBy = { [seenBy.replace(/\D/g, '')]: true };
          } else if (seenBy.startsWith("{") && seenBy.endsWith("}")) {
            try {
              seenBy = JSON.parse(seenBy);
            } catch (error) {
              seenBy = {};
            }
          } else {
            seenBy = {};
          }
        }

        if (msg.ticket_id === ticketId && Object.keys(seenBy).length === 0) {
          return {
            ...msg,
            seen_by: JSON.stringify({ [userId]: true }),
            seen_at: new Date().toISOString()
          };
        }
        return msg;
      });
    });
  };

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('jwt');

      if (!token) {
        console.warn('Нет токена. Пропускаем загрузку тикетов.');
        return [];
      }
      const response = await fetch('https://pandatur-api.com/api/light/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Origin: 'https://plutonium8t8.github.io'
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Ошибка при получении тикетов. Код статуса: ${response.status}`);
      }

      const data = await response.json();

      setTickets(data);
      setTicketIds(data.map((ticket) => ticket.id));

      return data;
    } catch (error) {
      console.error('Ошибка при загрузке тикетов:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSingleTicket = async (ticketId) => {
    try {
      setIsLoading(true);
      const token = Cookies.get('jwt');

      if (!token) {
        console.warn('Нет токена. Пропускаем загрузку тикета.');
        return null;
      }

      const response = await fetch(`https://pandatur-api.com/api/light/ticket/${ticketId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Origin: 'https://plutonium8t8.github.io'
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Ошибка при получении тикета. Код статуса: ${response.status}`);
      }

      const ticket = await response.json();
      console.log('Загруженный тикет:', ticket);

      setTickets((prevTickets) => {
        const existingTicket = prevTickets.find((t) => t.id === ticketId);
        if (existingTicket) {
          return prevTickets.map((t) =>
            t.id === ticketId ? ticket : t
          );
        } else {
          return [...prevTickets, ticket];
        }
      });

      return ticket;
    } catch (error) {
      console.error('Ошибка при загрузке тикета:', error);
      return null;
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

      const response = await fetch(`https://pandatur-api.com/api/tickets/${updateData.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Origin: 'https://plutonium8t8.github.io'
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

      // Синхронизация тикетов через WebSocket
      return updatedTicket;
    } catch (error) {
      console.error('Error updating ticket:', error.message || error);
      throw error;
    }
  };

  // Функция загрузки сообщений клиента
  // const getClientMessages = async () => {
  //   try {
  //     const token = Cookies.get('jwt');
  //     if (!token) {
  //       console.warn('Нет токена. Пропускаем загрузку сообщений.');
  //       return;
  //     }

  //     const response = await fetch('https://pandatur-api.com/api/messages', {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //         Origin: 'https://plutonium8t8.github.io'
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  //     }

  //     const data = await response.json();
  //     // console.log("Сообщения, загруженные из API:", data);

  //     setMessages(data); // Обновляем состояние всех сообщений
  //   } catch (error) {
  //     enqueueSnackbar('Не удалось получить сообщения!', { variant: 'error' });
  //     console.error('Ошибка при получении сообщений:', error.message);
  //   }
  // };

  // Функция для получения сообщений для конкретного client_id
  const getClientMessagesSingle = async (ticket_id) => {
    console.log("Загружаем сообщения для тикета:", ticket_id);
    try {
      const token = Cookies.get('jwt');
      if (!token) return;

      const response = await fetch(`https://pandatur-api.com/api/messages/ticket/${ticket_id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      const data = await response.json();

      setMessages(prevMessages => {
        const existingMessageIds = new Set(prevMessages.map(msg => msg.id));
        const newMessages = data.filter(msg => !existingMessageIds.has(msg.id));
        const updatedMessages = [...prevMessages, ...newMessages];

        // ✅ Определяем самое свежее сообщение
        const lastMsg = updatedMessages.sort((a, b) => new Date(b.time_sent) - new Date(a.time_sent))[0];

        // ✅ Обновляем тикет, если новое последнее сообщение свежее
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === ticket_id
              ? {
                ...ticket,
                last_message: lastMsg?.message || ticket.last_message,
                time_sent: lastMsg?.time_sent || ticket.time_sent,
              }
              : ticket
          )
        );

        return updatedMessages;
      });

      console.log("Сообщения загружены:", data);
    } catch (error) {
      console.error('Ошибка при получении сообщений:', error.message);
    }
  };

  // Обработка сообщений через WebSocket
  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'message': {
        console.log("Новое сообщение из WebSocket:", message.data);
        const ticketId = message.data.ticket_id;

        // ✅ Запрос на обновление сообщений (не затираем старые)
        getClientMessagesSingle(ticketId)
          .then(() => console.log(`Сообщения для тикета ${ticketId} обновлены.`))
          .catch(err => console.error("Ошибка при обновлении сообщений с сервера:", err));

        setMessages(prevMessages => {
          if (!prevMessages.some(msg => msg.id === message.data.id)) {
            return [...prevMessages, message.data];
          }
          return prevMessages;
        });

        // ✅ Обновляем последнее сообщение в тикете
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === ticketId
              ? {
                ...ticket,
                last_message: message.data.message || "No message",
                time_sent: message.data.time_sent || ticket.time_sent,
              }
              : ticket
          )
        );

        break;
      }
      case 'seen': {
        const { ticket_id, seen_at, client_id } = message.data;

        console.log('🔄 Получен `seen` из WebSocket:', { ticket_id, seen_at, client_id });

        // **Обновляем `messages`**
        setMessages((prevMessages) => {
          return prevMessages.map((msg) =>
            msg.ticket_id === ticket_id ? { ...msg, seen_at, seen_by: JSON.stringify({ [userId]: true }) } : msg
          );
        });

        // **Обновляем `unreadMessages` и `unreadCount` после `seen`**
        setTimeout(() => {
          setUnreadMessages((prevUnreadMessages) => {
            const updatedUnreadMap = new Map(prevUnreadMessages);

            updatedUnreadMap.forEach((msg, msgId) => {
              if (msg.ticket_id === ticket_id) {
                updatedUnreadMap.delete(msgId);
              }
            });

            console.log("✅ Обновленные `unreadMessages` после `seen`:", updatedUnreadMap.size);
            return updatedUnreadMap;
          });

        }, 100);

        break;
      }
      case 'ticket': {
        console.log("Пришел тикет:", message.data);

        const ticketId = message.data.ticket_id;
        const clientId = message.data.client_id;

        if (!ticketId) {
          console.warn("Не удалось извлечь ticket_id из сообщения типа 'ticket'.");
          break;
        }

        fetchSingleTicket(ticketId);

        const socketInstance = socketRef.current;
        if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
          const socketMessage = JSON.stringify({
            type: 'connect',
            data: { ticket_id: [ticketId] },
          });

          socketInstance.send(socketMessage);
        } else {
          console.warn("Не удалось подключиться к комнатам. WebSocket не готов.");
        }
        break;
      }
      case 'ticket_update': {
        console.log("Обновление тикета:", message.data);
        const ticketId = message.data.ticket_id;
        fetchSingleTicket(ticketId);
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
        console.log("пришел понг");
        break;
      default:
        console.warn('Неизвестный тип сообщения:', message.type);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // getClientMessages();
      fetchTickets();
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
        socketRef,
        getClientMessagesSingle
        // unreadCount: unreadMessages.size, // Количество непрочитанных сообщений
      }}
    >
      {children}
    </AppContext.Provider>
  );
};