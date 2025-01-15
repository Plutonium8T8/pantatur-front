import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useSocket } from './SocketContext'; // Используйте свой контекст для WebSocket
import { useUser } from './UserContext';

const Notification = ({ selectedTicketId }) => {
  const socket = useSocket(); // Получаем сокет из контекста
  const { enqueueSnackbar } = useSnackbar(); // Хук для отображения уведомлений
  const { userId } = useUser();

  const truncateText = (text, maxLength = 100) => {
    if (!text || typeof text !== 'string') {
      console.warn('truncateText: Invalid input', text);
      return 'Сообщение отсутствует';
    }
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  useEffect(() => {
    if (socket) {
      const receiveMessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Parsed WebSocket message notifications:', message);

          switch (message.type) {
            case 'message':
              // Обрабатываем новое сообщение
              if (message.data.sender_id !== userId) {
                const messageText = truncateText(message.data.text, 50); // Исправлено с message.data.text
                enqueueSnackbar(
                  `Новое сообщение от клиента ${message.data.client_id}: ${messageText}`,
                  { variant: 'info' }
                );
              }
              break;

            case 'notification':
              // Показ уведомления
              const notificationText = truncateText(
                message.data.description || 'Уведомление с пустым текстом!',
                100
              );
              enqueueSnackbar(notificationText, { variant: 'info' });
              break;

            case 'task':
              // Показ уведомления о новой задаче
              enqueueSnackbar(`Новая задача: ${message.data.title}`, { variant: 'warning' });
              break;

            case 'ticket': {
              // Убедимся, что message.data существует и содержит client_id
              if (message.data && message.data.client_id) {
                // Подключение к комнате на основе client_id
                const socketMessageClient = JSON.stringify({
                  type: 'connect',
                  data: { client_id: [message.data.client_id] },
                });

                socket.send(socketMessageClient); // Отправка сообщения на сервер
                console.log(`Подключён к комнате клиента с ID: ${message.data.client_id}`);

                // Показываем уведомление
                enqueueSnackbar(
                  `Новый тикет: ${message.data.client_id || 'Без названия'}`, // Если title отсутствует, выводим "Без названия"
                  { variant: 'warning' }
                );
              } else {
                console.warn('Неверное сообщение о тикете:', message);
              }
              break;
            }

            case 'seen':
              // Обработать событие seen
              break;

            case 'pong':
              // Ответ на ping
              break;

            default:
              console.warn('Неизвестный тип сообщения:', message.type);
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
  }, [socket, selectedTicketId, enqueueSnackbar, userId]);

  return null; // Компонент не отображает UI, только управляет уведомлениями
};

export default Notification;