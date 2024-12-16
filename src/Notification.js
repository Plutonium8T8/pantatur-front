import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useSocket } from './SocketContext'; // Используйте свой контекст для WebSocket

const Notification = ({ selectedTicketId, onUpdateUnreadMessages }) => {
  const [unreadMessages, setUnreadMessages] = useState({});
  const socket = useSocket(); // Получаем сокет из контекста
  const { enqueueSnackbar } = useSnackbar(); // Хук для отображения уведомлений

  useEffect(() => {
    if (socket) {
      socket.onopen = () => console.log('WebSocket подключен');
      socket.onerror = (error) => console.error('WebSocket ошибка:', error);
      socket.onclose = () => console.log('WebSocket закрыт');

      socket.onmessage = (event) => {
        console.log('Raw WebSocket message received:', event.data);
        try {
          const message = JSON.parse(event.data);
          console.log('Parsed WebSocket message:', message);

          switch (message.type) {
            case 'message':
              // Обрабатываем новое сообщение
              if (message.data.client_id !== selectedTicketId) {
                setUnreadMessages((prevUnreadMessages) => {
                  const updatedUnreadMessages = { ...prevUnreadMessages };
                  updatedUnreadMessages[message.data.client_id] =
                    (updatedUnreadMessages[message.data.client_id]) + 1;
                  return updatedUnreadMessages;
                });

                // Показ уведомления о новом сообщении
                enqueueSnackbar(
                  `Новое сообщение от клиента ${message.data.client_id}`,
                  { variant: 'info' }
                );
              }

              // Обновляем счетчик непрочитанных сообщений
              if (typeof onUpdateUnreadMessages === 'function') {
                setUnreadMessages((prevUnreadMessages) => {
                  const totalUnreadMessages = Object.values(prevUnreadMessages).reduce(
                    (sum, count) => sum + count,
                    0
                  );
                  onUpdateUnreadMessages(totalUnreadMessages + 1);
                  return prevUnreadMessages;
                });
              }
              break;

            case 'notification':
              // Показ уведомления
              enqueueSnackbar(message.data.text || 'Уведомление получено!', { variant: 'success' });
              break;

            case 'task':
              // Показ уведомления о новой задаче
              enqueueSnackbar(`Новая задача: ${message.data.title}`, { variant: 'warning' });
              break;

            case 'seen':
              // Обработать событие seen
              break;

            default:
              console.warn('Неизвестный тип сообщения:', message);
          }
        } catch (error) {
          console.error('Ошибка при разборе сообщения WebSocket:', error);
        }
      };
    }

    return () => {
      if (socket) {
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
      }
    };
  }, [socket, selectedTicketId, onUpdateUnreadMessages, enqueueSnackbar]);

  return null; // Компонент не отображает UI, только управляет уведомлениями
};

export default Notification;