import React, { createContext, useState, useEffect, useContext } from 'react';

const SocketContext = createContext(null);

export const useSocket = () => {
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

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useSnackbar } from 'notistack';

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//     const [socket, setSocket] = useState(null);
//     const [unreadMessages, setUnreadMessages] = useState({});
//     const { enqueueSnackbar } = useSnackbar();

//     useEffect(() => {
//         const ws = new WebSocket('ws://34.88.185.205:8080'); // Укажите свой URL WebSocket
//         setSocket(ws);

//         ws.onopen = () => console.log('WebSocket подключен');
//         ws.onerror = (error) => console.error('WebSocket ошибка:', error);
//         ws.onclose = () => console.log('WebSocket закрыт');

//         ws.onmessage = (event) => {
//             try {
//                 const message = JSON.parse(event.data);
//                 console.log('WebSocket message received:', message);

//                 switch (message.type) {
//                     case 'message':
//                         // Обновляем количество непрочитанных сообщений
//                         setUnreadMessages((prevUnreadMessages) => {
//                             const updatedUnreadMessages = { ...prevUnreadMessages };
//                             const clientId = message.data.client_id;
//                             updatedUnreadMessages[clientId] =
//                                 (updatedUnreadMessages[clientId] || 0) + 1;
//                             return updatedUnreadMessages;
//                         });

//                         // Показываем уведомление
//                         enqueueSnackbar(
//                             `Новое сообщение от клиента ${message.data.client_id}`,
//                             { variant: 'info' }
//                         );
//                         break;

//                     case 'notification':
//                         enqueueSnackbar(message.data.text || 'Уведомление получено!', { variant: 'success' });
//                         break;

//                     case 'task':
//                         enqueueSnackbar(`Новая задача: ${message.data.title}`, { variant: 'warning' });
//                         break;

//                     default:
//                         console.warn('Неизвестный тип сообщения:', message.type);
//                 }
//             } catch (error) {
//                 console.error('Ошибка обработки WebSocket сообщения:', error);
//             }
//         };

//         // return () => {
//         //     ws.close();
//         // };
//     }, [enqueueSnackbar]);

//     return (
//         <SocketContext.Provider value={{ socket, unreadMessages }}>
//             {children}
//         </SocketContext.Provider>
//     );
// };

// export const useSocket = () => useContext(SocketContext);


// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { useSnackbar } from 'notistack';

// const SocketContext = createContext(null);

// export const useSocket = () => {
//   return useContext(SocketContext);
// };

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [unreadMessages, setUnreadMessages] = useState({});
//   const { enqueueSnackbar } = useSnackbar();

//   useEffect(() => {
//     const socketInstance = new WebSocket('ws://34.88.185.205:8080');

//     socketInstance.onopen = () => {
//       console.log('WebSocket подключен');
//     };

//     socketInstance.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         console.log('Received message:', message);

//         if (message.type === 'message') {
//           const { client_id } = message.data;

//           // Обновление количества непрочитанных сообщений
//           setUnreadMessages((prev) => {
//             const updated = { ...prev };
//             updated[client_id] = (updated[client_id] || 0) + 1;
//             return updated;
//           });

//           // Показ уведомления
//           enqueueSnackbar(`Новое сообщение от клиента ${client_id}`, { variant: 'info' });
//         }
//       } catch (error) {
//         console.error('Ошибка при обработке сообщения WebSocket:', error);
//       }
//     };

//     socketInstance.onclose = () => {
//       console.log('WebSocket закрыт');
//     };

//     setSocket(socketInstance);

//     // return () => {
//     //   if (socketInstance) {
//     //     socketInstance.close();
//     //   }
//     // };
//   }, [enqueueSnackbar]);

//   return (
//     <SocketContext.Provider value={{ socket, unreadMessages }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };