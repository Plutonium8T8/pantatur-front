import React, { useEffect, useState, useRef } from 'react';
import TicketModal from './TicketModal';
import { workflowOptions } from './FormOptions/WorkFlowOption';
import { priorityOptions } from './FormOptions/PriorityOption';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './SocketContext'; // Используйте свой контекст для WebSocket
import { useUser } from './UserContext';
import { useSnackbar } from 'notistack';
import Cookies from 'js-cookie';

import './App.css';

export const updateTicket = async (updateData) => {
    try {
        const token = Cookies.get('jwt');

        if (!token) {
            throw new Error('Токен отсутствует. Авторизация необходима.');
        }

        const response = await fetch(`https://pandatur-api.com/api/tickets/${updateData.id}`, {
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
                `Ошибка при обновлении данных: ${response.status} ${response.statusText}. Детали: ${JSON.stringify(errorDetails)}`
            );
        }

        return await response.json();

    } catch (error) {
        console.error('Ошибка при обновлении тикета:', error.message || error);
        throw error;
    }
};

const Leads = (selectedTicketId) => {
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [IsModalOpen, setIsModalOpen] = useState(false);
    const [currentTicket, setCurrentTicket] = useState(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const contextMenuRef = useRef(null); // Ссылка на контекстное меню
    const socket = useSocket(); // Получаем сокет из контекста
    const { userId } = useUser();
    const { enqueueSnackbar } = useSnackbar(); // Хук для отображения уведомлений

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const token = Cookies.get('jwt');
            const response = await fetch('https://pandatur-api.com/api/tickets', {
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
        fetchTickets(); // Обновляем список после изменения workflow
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
        fetchTickets();
    }, [])

    const workflowStyles = {
        Interesat: { backgroundColor: '#ffff88', borderColor: '#1B5E20' },
        'Apel de intrare': { backgroundColor: '#89C0FE', borderColor: '#388E3C' },
        "De prelucrat": { backgroundColor: '#ff8f92', borderColor: '#43A047' },
        "Luat in lucru": { backgroundColor: '#ebffb1', borderColor: '#2E7D32' },
        "Oferta trimisa": { backgroundColor: '#ffcc66', borderColor: '#2E7D32' },
        "Aprobat cu client": { backgroundColor: '#ffc8c8', borderColor: '#2E7D32' },
        "Contract semnat": { backgroundColor: '#ff8f92', borderColor: '#2E7D32' },
        "Plata primita": { backgroundColor: '#fff000', borderColor: '#2E7D32' },
        "Contract incheiat": { backgroundColor: '#87f2c0', borderColor: '#2E7D32' },
    };

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
        navigate(`/chat/${ticket.id}`)
    };

    const closeModal = () => {
        setCurrentTicket(null);
        fetchTickets();
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

    const parseTags = (tags) => {
        if (Array.isArray(tags)) {
            return tags; // Если это массив, возвращаем как есть
        }
        if (typeof tags === 'string' && tags.startsWith('{') && tags.endsWith('}')) {
            const content = tags.slice(1, -1).trim(); // Убираем фигурные скобки и пробелы
            if (content === '') {
                return []; // Если содержимое пустое, возвращаем пустой массив
            }
            return content.split(',').map(tag => tag.trim()); // Разделяем и обрезаем пробелы
        }
        return []; // Если формат неизвестен, возвращаем пустой массив
    };

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
                                    `💬 Mesaj nou de la ${message.data.client_id}: ${messageText}`,
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
    }, [socket, selectedTicketId, enqueueSnackbar, userId]);

    return (
        <div className='dashboard-container'>
            <div className='dashboard-header'>
                <div className='header'>
                    <button onClick={openCreateTicketModal} className='button-add-ticket'>Add Ticket</button>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tickets..."
                        className='search-input'
                    />
                </div>
            </div>
            <div className='container-tickets'>
                {workflowOptions.map((workflow) => {
                    // Подсчитываем количество тикетов в текущем workflow
                    const ticketCount = tickets.filter(ticket => ticket.workflow === workflow).length;

                    return (
                        <div
                            className="colone-ticket"
                            key={workflow}
                            onDrop={(e) => handleDrop(e, workflow)}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <div className="name-workflow"
                                style={{
                                    backgroundColor: workflowStyles[workflow]?.backgroundColor || '',
                                }}
                            >
                                {/* Отображаем название workflow и количество тикетов */}
                                <div className='name-workflow'>
                                    {workflow} ({ticketCount})
                                </div>
                            </div>

                            <div className="scrollable-list">
                                <div className="scrollable-list">
                                    {Array.isArray(tickets) ? (
                                        tickets
                                            .filter(ticket => ticket.workflow === workflow)
                                            .filter(ticket =>
                                            (ticket.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                ticket.id?.toString().includes(searchTerm) ||
                                                parseTags(ticket.tags).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                                searchTerm.trim() === '')
                                            )
                                            .map(ticket => {
                                                // Преобразуем строку с тегами в массив
                                                const tags = parseTags(ticket.tags);

                                                return (
                                                    <div
                                                        key={ticket.id}
                                                        className="ticket"
                                                        onContextMenu={(e) => handleContextMenu(e, ticket)} // Контекстное меню
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                                                        onClick={() => handleTicketClick(ticket)}
                                                    >
                                                        <div className='foto-description'>
                                                            <div><img className='foto-user' src="/user fon.png" alt="example" /></div>
                                                            <div className='tickets-descriptions'>
                                                                <div>{ticket.contact || "no contact"}</div>
                                                                <div>Id ticket:{ticket.id || "no id"}</div>
                                                                {tags.length > 0 ? (
                                                                    <div>
                                                                        {tags.map((tag, index) => (
                                                                            <span
                                                                                key={index}
                                                                                style={{
                                                                                    display: 'inline-block',
                                                                                    backgroundColor: '#007bff',
                                                                                    color: '#fff',
                                                                                    padding: '5px 10px',
                                                                                    borderRadius: '20px',
                                                                                    marginRight: '5px',
                                                                                    fontSize: '12px',
                                                                                }}
                                                                            >
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span>no tags</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='container-time-tasks'>
                                                            <div className='time-task'>{ticket.creation_date}</div>
                                                            <div>tasks</div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <div>Loading tickets...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="spinner-overlay">
                        <div className="spinner"></div>
                    </div>
                )}
            </div>
            {contextMenu && (
                <div
                    ref={contextMenuRef} // Привязываем ссылку к контекстному меню
                    style={{
                        position: 'absolute',
                        top: contextMenu.mouseY,
                        left: contextMenu.mouseX,
                        backgroundColor: 'white',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        padding: '10px',
                        borderRadius: '4px',
                    }}
                >
                    <button onClick={() => handleEditTicket(contextMenu.ticket)}>Editeaza</button>
                </div>
            )}
            {currentTicket && (
                <TicketModal
                    ticket={currentTicket}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default Leads;