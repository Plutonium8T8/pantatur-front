import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../SocketContext';
import { useUser } from '../../UserContext';
import { useSnackbar } from 'notistack';
import { truncateText, parseTags } from '../utils/stringUtils';
import { workflowStyles } from '../utils/workflowStyles';
import SpinnerOverlay from './SpinnerOverlayComponent';
import WorkflowColumn from './WorkflowColumnComponent';
import ContextMenu from './ContextMenuComponent';
import TicketModal from './TicketModal/TicketModalComponent';
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import Cookies from 'js-cookie';
import '../../App.css';

const updateTicket = async (updateData) => {
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
            body: JSON.stringify(updateData),
            credentials: 'include',
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
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const fetchTicketsData = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const token = Cookies.get('jwt');
            const response = await fetch('https://pandatur-api.com/tickets', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                console.warn('Ошибка 401: Неавторизован. Перенаправляем на логин.');
                // window.location.reload(); // Перезагрузка страницы
                return;
            }

            if (!response.ok) {
                throw new Error('Ошибка при получении данных');
            }

            const data = await response.json();
            setTickets(data); // Устанавливаем данные тикетов
            console.log("+++ Загруженные тикеты:", data);
            // enqueueSnackbar('Тикеты успешно загружены!', { variant: 'success' });
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateTicketWorkflow = (ticketId, newWorkflow) => {

        setTickets((prevTickets) => {
            console.log("+", ticketId, newWorkflow);
            const updatedTickets = prevTickets.map((ticket) =>
                ticket.id == ticketId ? { ...ticket, workflow: newWorkflow } : ticket
            ); console.log(updatedTickets);

            return updatedTickets;
        });

        updateTicket({ id: ticketId, workflow: newWorkflow })
            .then(res => {
                console.log(res);
            })
            .catch(e => {
                console.error(e);
                // window.location.reload(); // Перезагрузка страницы
                return;
            })
            .finally(() => {

            })
        fetchTicketsData(); // Обновляем список после изменения workflow
    };

    const openCreateTicketModal = () => {
        setCurrentTicket({
            contact: '',
            transport: '',
            country: '',
            priority: priorityOptions[0],
            workflow: workflowOptions[0],
            service_reference: "",
            technician_id: 0
        });
        // setIsCreating(true);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchTicketsData();
    }, [])

    const handleDragStart = (e, ticketId) => {
        e.dataTransfer.setData('ticketId', ticketId);
    };

    const handleDrop = (e, workflow) => {
        e.preventDefault();
        const ticketId = e.dataTransfer.getData('ticketId');
        // console.log(ticketId, workflow);
        updateTicketWorkflow(ticketId, workflow);
    };

    const handleTicketClick = (ticket) => {
        setCurrentTicket(ticket);
        navigate(`/chat/${ticket.client_id}`)
    };

    const closeModal = () => {
        setCurrentTicket(null);
        fetchTicketsData();
    }

    const handleContextMenu = (event, ticket) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            ticket,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleEditTicket = (ticket) => {
        setCurrentTicket(ticket);
        setIsModalOpen(true);
        handleCloseContextMenu();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu(null); // Закрываем меню, если клик за его пределами
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                                    `💬 Mesaj nou de la ${message.data.client_id}: ${messageText} `,
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
                            fetchTicketsData();
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
    }, [socket, selectClientId, enqueueSnackbar, userId]);

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
                        onEditTicket={handleEditTicket}
                        onContextMenu={handleContextMenu}
                    />
                ))}
                {isLoading && <SpinnerOverlay />}
            </div>
            {contextMenu && (
                <ContextMenu
                    contextMenu={contextMenu}
                    onEditTicket={handleEditTicket}
                    onClose={handleCloseContextMenu}
                    ref={contextMenuRef}
                />
            )}
            {currentTicket && (
                <TicketModal ticket={currentTicket} onClose={() => closeModal()} />
            )}
        </div>
    );
};

export { Leads, updateTicket };

