import React, { createContext, useState, useEffect, useContext } from 'react';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Устанавливаем соединение WebSocket после логина
    const socketInstance = new WebSocket('ws://34.65.204.80:8080'); // Укажите ваш WebSocket сервер

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