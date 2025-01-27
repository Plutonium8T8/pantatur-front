import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const [message, setMessage] = useState([]);
  const [ticketIds, setTicketIds] = useState([]);
  const socket = useContext(SocketContext);
  const { userId } = useUser();

  const fetchTicketsID = async (socketInstance) => {
    try {
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
          Origin: 'https://plutonium8t8.github.io'
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

  // const handleSocketMessage = (event) => {
  //   try {
  //     const message = JSON.parse(event.data);
  //     console.log('Получено сообщение WebSocket:', message);

  //     switch (message.type) {
  //       case 'message':
  //         setMessage((prevMessages) => [...prevMessages, message.data]);
  //         break;

  //       case 'ticket': {
  //         // Подключение к комнате с использованием client_id
  //         const socketMessageClient = JSON.stringify({
  //           type: 'connect',
  //           data: { client_id: message.data.client_id },
  //         });
  //         socket.send(socketMessageClient);
  //         console.log(`Подключён к клиенту с ID: ${message.data.client_id}`);
  //         break;
  //       }

  //       default:
  //         console.warn('Неизвестный тип сообщения:', message.type);
  //     }
  //   } catch (error) {
  //     console.error('Ошибка при обработке сообщения WebSocket:', error.message);
  //   }
  // };

  useEffect(() => {
    if (socket) {
      fetchTicketsID(socket);

      // // Назначаем обработчик для событий WebSocket
      // socket.onmessage = handleSocketMessage;

      // return () => {
      //   // Очищаем обработчики при размонтировании
      //   socket.onmessage = null;
      // };
    }
  }, [socket]);

  return useContext(SocketContext);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

      const response = await fetch('https://pandatur-api.com/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Origin: 'https://plutonium8t8.github.io'
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
    const socketInstance = new WebSocket('wss://34.88.101.80:9090');

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