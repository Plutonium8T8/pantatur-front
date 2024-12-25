import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useSocket } from './SocketContext'; // Используйте свой контекст для WebSocket
import { UserProvider, useUser } from './UserContext';

const Notification = ({ selectedTicketId }) => {
  const socket = useSocket(); // Получаем сокет из контекста
  const { enqueueSnackbar } = useSnackbar(); // Хук для отображения уведомлений
  const { userId } = useUser();

  const truncateText = (text, maxLength = 100) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  useEffect(() => {
    if (socket) {
      const receiveMessage = (event) => {
        // console.log('Raw WebSocket message received notifications:', event.data);
        try {
          const message = JSON.parse(event.data);
          console.log('Parsed WebSocket message notifications:', message);
  
          switch (message.type) {
            case 'message':
              // Обрабатываем новое сообщение
              if (message.data.sender_id !== userId) {
                // Показ уведомления о новом сообщении
                const messageText = truncateText(message.data.message, 50); // Обрезаем сообщение до 100 символов
                enqueueSnackbar(
                  `Новое сообщение от клиента ${message.data.client_id}: ${messageText}`,
                  { variant: 'info' }
                );
              }
              break;
  
            case 'notification':
              // Показ уведомления
              const notificationText = truncateText(message.data.text || 'Уведомление получено!', 100);
              enqueueSnackbar(notificationText, { variant: 'success' });
              break;
  
            case 'task':
              // Показ уведомления о новой задаче
              enqueueSnackbar(`Новая задача: ${message.data.title}`, { variant: 'warning' });
              break;
  
            case 'seen':
              // Обработать событие seen
              break;
  
            default:
              // console.warn('Неизвестный тип сообщения:', message);
          }
        } catch (error) {
          console.error('Ошибка при разборе сообщения WebSocket:', error);
        }
      };
  
      // Устанавливаем обработчики WebSocket
      socket.onopen = () => console.log('WebSocket подключен');
      socket.onerror = (error) => console.error('WebSocket ошибка:', error);
      socket.onclose = () => console.log('WebSocket закрыт');
      socket.addEventListener('message', receiveMessage);
  
      // Очистка обработчиков при размонтировании
      return () => {
        socket.removeEventListener('message', receiveMessage);
        socket.onopen = null;
        socket.onerror = null;
        socket.onclose = null;
      };
    }
  }, [socket, selectedTicketId, enqueueSnackbar]);   

  return null; // Компонент не отображает UI, только управляет уведомлениями
};

export default Notification;