import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../SocketContext';
import { useUser } from '../../UserContext';
import { useSnackbar } from 'notistack';
import { truncateText } from '../utils/stringUtils';
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import SpinnerOverlay from './SpinnerOverlayComponent';
import WorkflowColumn from './WorkflowColumnComponent';
import ContextMenu from './ContextMenuComponent';
import TicketModal from './TicketModal/TicketModalComponent';
import Cookies from 'js-cookie';
import '../../App.css';

export const updateTicket = async (updateData) => {
  try {
    const token = Cookies.get('jwt');

    if (!token) {
      throw new Error('Token is missing. Authorization required.');
    }

    const response = await fetch(`https://pandatur-api.com/tickets/${updateData.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
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

    return await response.json();
  } catch (error) {
    console.error('Error updating ticket:', error.message || error);
    throw error;
  }
};

const Leads = (selectClientId) => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);
  const socket = useSocket();
  const { userId } = useUser();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('jwt');
      const response = await fetch('https://pandatur-api.com/tickets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch tickets.');

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateTicketWorkflow = (clientId, newWorkflow) => {
    // Update state locally for immediate UI feedback
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.client_id === clientId ? { ...ticket, workflow: newWorkflow } : ticket
      )
    );

    // Update the server
    updateTicket({ id: clientId, workflow: newWorkflow }).catch((error) =>
      console.error('Error updating ticket workflow:', error)
    );

    fetchTickets();
  };

  const openCreateTicketModal = () => {
    setCurrentTicket({
      contact: '',
      transport: '',
      country: '',
      priority: priorityOptions[0],
      workflow: workflowOptions[0],
      service_reference: '',
      technician_id: 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentTicket(null);
    setIsModalOpen(false);
  };

  const handleContextMenu = (event, ticket) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      ticket,
    });
  };

  const handleCloseContextMenu = () => setContextMenu(null);

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
                const messageText = truncateText(message.data.text, 50); // Ограничение длины текста
                enqueueSnackbar(
                  `💬 Mesaj nou de la ${message.data.client_id}: ${messageText}`,
                  {
                    variant: 'info',
                    action: (snackbarId) => (
                      <>
                        <button
                          onClick={() => {
                            navigate(`/chat/${message.data.client_id}`);
                            closeSnackbar(snackbarId); // Закрываем уведомление при переходе
                          }}
                          style={{
                            background: 'none',
                            color: 'green',
                            cursor: 'pointer',
                            marginRight: '10px',
                          }}
                        >
                          Перейти к чату
                        </button>
                        <button
                          onClick={() => closeSnackbar(snackbarId)}
                          style={{
                            background: 'none',
                            color: 'black',
                            cursor: 'pointer',
                          }}
                        >
                          Закрыть
                        </button>
                      </>
                    ),
                  }
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
              enqueueSnackbar(`Task nou: ${message.data.title}`, { variant: 'warning' });
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
                  `Ticket nou: ${message.data.client_id || 'Fara denumire'}`, // Если title отсутствует, выводим "Без названия"
                  { variant: 'warning' }

                );
              } else {
                console.warn('Неверное сообщение о тикете:', message);
              }
              fetchTickets();
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
  }, [socket, enqueueSnackbar, userId]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header">
          <button onClick={openCreateTicketModal} className="button-add-ticket">
            Add Ticket
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets..."
            className="search-input"
          />
        </div>
      </div>
      <div className="container-tickets">
        {workflowOptions.map((workflow) => (
          <WorkflowColumn
            key={workflow}
            workflow={workflow}
            tickets={tickets}
            searchTerm={searchTerm}
            onUpdateWorkflow={updateTicketWorkflow}
            onEditTicket={setCurrentTicket}
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>
      {isLoading && <SpinnerOverlay />}
      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          onClose={handleCloseContextMenu}
          onEditTicket={setCurrentTicket}
          ref={contextMenuRef}
        />
      )}
      {currentTicket && (
        <TicketModal
          ticket={currentTicket}
          onClose={closeModal}
          onSave={fetchTickets} // Reload tickets after saving
        />
      )}
    </div>
  );
};

export default Leads;
