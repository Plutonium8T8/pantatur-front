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
  const language = localStorage.getItem('language') || 'RO';
  const [selectTicketId, setSelectTicketId] = useState(null);

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

    // Получаем WebSocket-соединение
    const socketInstance = socketRef.current;

    // **Обновляем `messages`, чтобы пометить их как прочитанные**
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.ticket_id === ticketId) {
          return { ...msg, seen_by: JSON.stringify({ [userId]: true }), seen_at: new Date().toISOString() };
        }
        return msg;
      })
    );

    // **Обновляем `unreadMessages`, удаляя все сообщения этого тикета**
    setUnreadMessages((prevUnread) => {
      const updatedUnread = new Map(prevUnread);
      updatedUnread.forEach((msg, msgId) => {
        if (msg.ticket_id === ticketId) {
          updatedUnread.delete(msgId);
        }
      });
      return updatedUnread;
    });

    // **Обновляем `unseen_count` в `tickets`**
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, unseen_count: 0 } : ticket
      )
    );

    // **Отправляем WebSocket `seen`, только если были непрочитанные**
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
      console.warn("WebSocket не подключён, не удалось отправить seen.");
    }
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

      // Обрабатываем данные тикетов
      const processedTickets = data.map(ticket => ({
        ...ticket,
        client_ids: ticket.client_id
          ? ticket.client_id.replace(/[{}]/g, "").split(',').map(id => Number(id))
          : [],
        last_message: ticket.last_message || "Нет сообщений",
        time_sent: ticket.time_sent || null,
        unseen_count: ticket.unseen_count || 0
      }));

      setTickets(processedTickets);
      setTicketIds(processedTickets.map(ticket => ticket.id));

      return processedTickets;
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
    console.log("Обновление сообщений для тикета:", ticket_id);
    try {
      const token = Cookies.get('jwt');
      if (!token) return;

      const response = await fetch(`https://pandatur-api.com/api/messages/ticket/${ticket_id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Ошибка: ${response.status} ${response.statusText}`);

      const data = await response.json();

      if (Array.isArray(data)) {
        setMessages((prevMessages) => {
          console.log("Старые сообщения в state:", prevMessages);
          console.log("Пришедшие новые сообщения:", data);

          // Оставляем все старые сообщения, кроме тех, что принадлежат текущему тикету
          const otherMessages = prevMessages.filter((msg) => msg.ticket_id !== ticket_id);

          return [...otherMessages, ...data];
        });

        console.log("Обновленный state сообщений:", data);

        // **Перерасчёт `unseen_count`**
        const unseenMessages = data.filter(
          (msg) => msg.seen_by === '{}' && msg.sender_id !== userId
        );

        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === ticket_id
              ? { ...ticket, unseen_count: unseenMessages.length }
              : ticket
          )
        );
      }
    } catch (error) {
      console.error('Ошибка при получении сообщений:', error.message);
    }
  };

  // Обработка сообщений через WebSocket
  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'message': {
        console.log("Новое сообщение из WebSocket:", message.data);

        const { ticket_id, message: msgText, time_sent, sender_id } = message.data;

        setMessages((prevMessages) => [...prevMessages, message.data]);

        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === ticket_id
              ? {
                ...ticket,
                last_message: msgText,
                time_sent: time_sent,
                unseen_count:
                  ticket_id === selectTicketId
                    ? 0  // Если тикет открыт, сбрасываем непрочитанные
                    : ticket.unseen_count + (sender_id !== userId ? 1 : 0)
              }
              : ticket
          )
        );

        // Обновляем `unreadMessages`
        setUnreadMessages((prevUnread) => {
          const updatedUnread = new Map(prevUnread);

          if (ticket_id === selectTicketId) {
            // Если тикет открыт, удаляем все его непрочитанные сообщения
            updatedUnread.forEach((msg, msgId) => {
              if (msg.ticket_id === ticket_id) {
                updatedUnread.delete(msgId);
              }
            });
          } else if (sender_id !== userId) {
            // Добавляем новое сообщение в `unreadMessages`, если оно непрочитанное
            updatedUnread.set(message.data.id, message.data);
          }

          return updatedUnread;
        });

        break;
      }
      case 'seen': {
        const { ticket_id, seen_at } = message.data;

        console.log('🔄 Получен `seen` из WebSocket:', { ticket_id, seen_at });

        // **Обновляем `messages`**
        setMessages((prevMessages) => {
          return prevMessages.map((msg) =>
            msg.ticket_id === ticket_id ? { ...msg, seen_at } : msg
          );
        });

        // **Удаляем непрочитанные сообщения из `unreadMessages`**
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

        // **Обновляем unseen_count у тикетов**
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === ticket_id ? { ...ticket, unseen_count: 0 } : ticket
          )
        );

        break;
      }
      case 'ticket': {
        console.log("Пришел тикет:", message.data);

        // Извлекаем client_id из сообщения
        const ticketId = message.data.ticket_id;
        const clientId = message.data.client_id;

        if (!ticketId) {
          console.warn("Не удалось извлечь ticket_id из сообщения типа 'ticket'.");
          break;
        }

        // Запрашиваем тикет по ticket_id
        fetchSingleTicket(ticketId);

        const socketInstance = socketRef.current; // Используем socketRef.current
        if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
          const socketMessage = JSON.stringify({
            type: 'connect',
            data: { ticket_id: [ticketId] }, // Подключаемся только к комнате с этим client_id
          });

          socketInstance.send(socketMessage);
          // console.log(
          //   `Подключено к комнате клиента с client_id=${clientId}. Отправлено сообщение:`,
          //   socketMessage
          // );
        } else {
          console.warn("Не удалось подключиться к комнатам. WebSocket не готов.");
          console.log(
            "Состояние WebSocket:",
            socketInstance ? socketInstance.readyState : "Нет WebSocket соединения"
          );
        }
        break;
      }
      case 'ticket_update': {
        console.log("обновление тикета :", message.data);
        const ticketId = message.data.ticket_id;
        fetchSingleTicket(ticketId);
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

  useEffect(() => {
    // Пересчитываем `unreadCount` по `unseen_count` из тикетов
    const totalUnread = tickets.reduce((sum, ticket) => sum + ticket.unseen_count, 0);

    console.log(`🔄 Обновленный unreadCount: ${totalUnread}`);
    setUnreadCount(totalUnread);
  }, [tickets, unreadMessages]); // Обновляем при изменении тикетов и непрочитанных сообщений

  return (
    <AppContext.Provider value={{
      tickets,
      setTickets,
      selectTicketId,  // Делаем доступным везде
      setSelectTicketId,
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
    }}>
      {children}
    </AppContext.Provider>
  );
};