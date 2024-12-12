import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';

const SocketContext = createContext(null);

export const useSocket = () => {
  const [message, setMessage] = useState([]);
  const [ticketIds, setTicketIds] = useState([]);
  const [tickets, setTickets] = useState([]);

  // Получаем socket через useContext
  const socket = useContext(SocketContext);
  
  const fetchTicketsID = async () => {
    try {
      console.log('Начало запроса тикетов...');
      
      const token = Cookies.get('jwt');
      console.log('Токен JWT:', token);
  
      const response = await fetch('https://pandatur-api.com/api/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Ответ от сервера:', response);
  
      if (response.status === 401) {
        setMessage('Ошибка авторизации. Попробуйте снова.');
        console.warn('Ошибка авторизации. Код статуса:', response.status);
        return;
      }
  
      if (!response.ok) {
        throw new Error(`Ошибка при получении ID тикетов. Код статуса: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Полученные данные:', data);
  
      const tickets = data[0];
      console.log('Список тикетов:', tickets);
  
      const ticketIds = tickets.map((ticket) => ticket.id);
      console.log('Список ID тикетов:', ticketIds);
  
      setTicketIds(ticketIds);
      setTickets(tickets);
  
      // Проверяем, если socket существует и открыт
      if (socket && socket.readyState === WebSocket.OPEN) {
        const socketMessage = JSON.stringify({ type: 'connect', data: { client_id: ticketIds } });
        console.log('Отправка данных через WebSocket:', socketMessage);
        socket.send(socketMessage);
      }
    } catch (error) {
      console.error('Ошибка:', error.message);
      setMessage('Ошибка при загрузке тикетов');
    } finally {
      console.log('Загрузка завершена.');
    }
  };

  useEffect(() => {
    fetchTicketsID();
  }, [socket]); // Перезапускать запросы при изменении socket

  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Устанавливаем соединение WebSocket после логина
    const socketInstance = new WebSocket('ws://34.88.185.205:8080'); // Укажите ваш WebSocket сервер

    socketInstance.onopen = () => {
      console.log('WebSocket подключен');
    };

    socketInstance.onclose = () => {
      console.log('WebSocket закрыт');
    };

    setSocket(socketInstance);

  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};