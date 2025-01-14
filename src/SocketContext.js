import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const [message, setMessage] = useState([]);
  const [ticketIds, setTicketIds] = useState([]);
  const [tickets, setTickets] = useState([]);
  const socket = useContext(SocketContext);
  const { userId } = useUser();

  // const fetchTicketsID = async (socketInstance) => {
  //   try {
  //     const token = Cookies.get('jwt');
  //     if (!token) {
  //       console.warn('Нет токена. Пропускаем загрузку тикетов.');
  //       return;
  //     }

  //     const response = await fetch('https://pandatur-api.com/api/tickets', {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Ошибка при получении тикетов. Код статуса: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     const ticketsData = data[0];
  //     const ticketIds = ticketsData.map((ticket) => ticket.id);

  //     setTicketIds(ticketIds);
  //     setTickets(ticketsData);

  //     // Отправляем сообщение для клиентских данных через WebSocket
  //     if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
  //       const socketMessageClient = JSON.stringify({ type: 'connect', data: { client_id: ticketIds } });
  //       socketInstance.send(socketMessageClient);
  //       const socketMessageNotification = JSON.stringify({ type: 'connect', data: { notificationRoomId: userId } });
  //       socketInstance.send(socketMessageNotification);
  //       const socketMessageTask = JSON.stringify({ type: 'connect', data: { taskRoomId: userId } });
  //       socketInstance.send(socketMessageTask);
  //     }
  //     console.log("tikets id", ticketIds);
  //   } catch (error) {
  //     console.error('Ошибка при загрузке тикетов:', error.message);
  //     setMessage('Ошибка при загрузке тикетов');
  //   }
  // };

  // useEffect(() => {
  //   if (socket) {
  //     fetchTicketsID(socket);  // Передаем socketInstance в fetchTicketsID
  //   }
  // }, [socket]);

  const fetchTicketsID = async (socketInstance) => {
    try {
      const token = Cookies.get('jwt');
      if (!token) {
        console.warn('Нет токена. Пропускаем загрузку тикетов.');
        return;
      }

      const response = await fetch('https://pandatur-api.com/api/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка при получении тикетов. Код статуса: ${response.status}`);
      }

      const data = await response.json();

      // Извлекаем только ID тикетов
      const ticketIds = data.map((ticket) => ticket.client_id);

      setTicketIds(ticketIds);

      // Отправляем сообщение через WebSocket
      if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
        const socketMessageClient = JSON.stringify({ type: 'connect', data: { client_id: ticketIds } });
        socketInstance.send(socketMessageClient);
        const socketMessageNotification = JSON.stringify({ type: 'connect', data: { notificationRoomId: userId } });
        socketInstance.send(socketMessageNotification);
        const socketMessageTask = JSON.stringify({ type: 'connect', data: { taskRoomId: userId } });
        socketInstance.send(socketMessageTask);
      }

      console.log("Tikets ID:", ticketIds);
      console.log("userID:", userId);

    } catch (error) {
      console.error('Ошибка при загрузке тикетов:', error.message);
      setMessage('Ошибка при загрузке тикетов');
    }
  };

  useEffect(() => {
    if (socket) {
      fetchTicketsID(socket);
    }
  }, [socket]);

  return useContext(SocketContext);
};

export const SocketProvider = ({ children, isLoggedIn }) => {
  const [socket, setSocket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketIds, setTicketIds] = useState([]);
  const [message, setMessage] = useState('');

  // Переносим fetchTicketsID сюда
  const fetchTicketsID = async (socketInstance) => {
    try {
      const token = Cookies.get('jwt');
      if (!token) {
        console.warn('Нет токена. Пропускаем загрузку тикетов.');
        return;
      }

      const response = await fetch('https://pandatur-api.com/api/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка при получении тикетов. Код статуса: ${response.status}`);
      }

      const data = await response.json();
      const ticketsData = data[0];
      const ticketIds = ticketsData.map((ticket) => ticket.client_id);

      setTicketIds(ticketIds);
      setTickets(ticketsData);

      // Отправляем сообщение для клиентских данных через WebSocket
      if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
        const socketMessageClient = JSON.stringify({ type: 'connect', data: { client_id: ticketIds } });
        socketInstance.send(socketMessageClient);
        // const socketMessageNotification = JSON.stringify({ type: 'connect', data: { notificationRoomId: ticketIds } });
        // socketInstance.send(socketMessageNotification);
      }
    } catch (error) {
      console.error('Ошибка при загрузке тикетов:', error.message);
      setMessage('Ошибка при загрузке тикетов');
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return;
    }

    // Устанавливаем соединение WebSocket после логина
    const socketInstance = new WebSocket('ws://34.88.101.80:8080');

    socketInstance.onopen = () => {
      console.log('WebSocket подключен');
      fetchTicketsID(socketInstance); // Загружаем тикеты только при открытии сокета
    };

    socketInstance.onclose = () => {
      console.log('WebSocket закрыт');
    };

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
      console.log('WebSocket закрыт при размонтировании.');
    };
  }, [isLoggedIn]);

  useEffect(() => {
    let pingInterval;

    if (socket) {
      // Отправка пинга через каждые 30 секунд
      pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          const pingMessage = JSON.stringify({ type: 'ping' });
          socket.send(pingMessage);
        }
      }, 240000); // Пинг каждые 4 минуты

      // Очистка интервала при размонтировании компонента или закрытии сокета
      return () => {
        clearInterval(pingInterval);  // Очищаем интервал
        if (socket) socket.onmessage = null;  // Очищаем обработчик сообщений
      };
    }

    return () => { };
  }, [socket]); // useEffect с зависимостью от сокета

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};