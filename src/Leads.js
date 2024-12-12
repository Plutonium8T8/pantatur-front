import React, { useEffect, useState } from 'react';
import TicketModal from './TicketModal';
import { workflowOptions } from './FormOptions/WorkFlowOption';
import { priorityOptions } from './FormOptions/PriorityOption';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Cookies from 'js-cookie';

import './App.css';

export const updateTicket = async (updateData) => {
    try {
        const token = Cookies.get('jwt');
        const response = await fetch(`https://pandatur-api.com/api/tickets/${updateData.id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...updateData }),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Ошибка при обновлении данных');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    }
};

const Leads = () => {
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [IsModalOpen,setIsModalOpen] = useState(false);
    const [currentTicket, setCurrentTicket] = useState(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
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
            setTickets(...data); // Устанавливаем данные тикетов
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
                window.location.reload(); // Перезагрузка страницы
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
                {workflowOptions.map((workflow) => (
                    <div
                        className="colone-ticket"
                        key={workflow}
                        onDrop={(e) => handleDrop(e, workflow)}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <div className="name-workflow"
                            style={{
                                backgroundColor: workflowStyles[workflow]?.backgroundColor || '',
                                // borderColor: workflowStyles[workflow]?.borderColor || '',
                                // borderWidth: '1px',
                                // borderStyle: 'solid'
                            }}
                        >
                            <div className='name-workflow'>{workflow}</div>
                        </div>

                        <div className="scrollable-list">
                            {tickets
                                .filter(ticket => ticket.workflow === workflow)
                                .filter(ticket =>
                                    (ticket.contact?.includes(searchTerm) || ticket.transport?.includes(searchTerm) || ticket.country?.includes(searchTerm) || searchTerm === '')
                                )
                                .map(ticket => (
                                    <div
                                        key={ticket.id}
                                        className="ticket"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                                        onClick={() => handleTicketClick(ticket)}
                                    >
                                        <div className='foto-description'>
                                            <div><img className='foto-user' src="/user fon.png" alt="example" /></div>
                                            <div className='tickets-descriptions'>
                                                <div>{ticket.contact || "no contact"}</div>
                                                <div>{ticket.transport || "no transport"}</div>
                                                <div>{ticket.country || "no country"}</div>
                                                <div>{ticket.id || "no id"}</div>
                                            </div>
                                        </div>
                                        <div className='container-time-tasks'>
                                            <div>time</div>
                                            <div>tasks</div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="spinner-overlay">
                        <div className="spinner"></div>
                    </div>
                )}
            </div>

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