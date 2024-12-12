import React, { useContext, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useSnackbar } from 'notistack';

const NotificationHandler = () => {
  const { socket } = useSocket() || {}; // Проверка на null
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!socket) return; // Если WebSocket ещё не создан, выходим

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'message') {
          enqueueSnackbar('Новое сообщение!', { variant: 'info' });
        } else if (message.type === 'notification') {
          enqueueSnackbar('Новое уведомление!', { variant: 'success' });
        }
      } catch (error) {
        console.error('Ошибка обработки сообщения WebSocket:', error);
      }
    };

    // return () => {
    //   socket.onmessage = null; // Очищаем слушатель при размонтировании
    // };
  }, [socket, enqueueSnackbar]);

//   return null; // Компонент не рендерит ничего визуально
};

export default NotificationHandler;