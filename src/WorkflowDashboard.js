import React, { useEffect, useState } from 'react';
import TicketModal from './TicketModal';
import { workflowOptions } from './WorkFlowOption';
import { priorityOptions } from './PriorityOption';

import Cookies from 'js-cookie';

import './App.css';

export const updateTicket = async (updateData) => {
    try {
        const token = Cookies.get('jwt');
        const response = await fetch(`https://pandaturapi.com/api/tickets/${updateData.id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...updateData })
        });

        if (!response.ok) {
            throw new Error('Ошибка при обновлении данных');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Ошибка:', error);
    }

};



const WorkflowDashboard = () => {

    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTicket, setCurrentTicket] = useState(null);

    const fetchTickets = async () => {
        try {
            // Добавляем задержку на 2 секунды
            await new Promise(resolve => setTimeout(resolve, 500));
    
            const token = Cookies.get('jwt');
            const response = await fetch('https://pandaturapi.com/api/tickets', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error('Ошибка при получении данных');
            }
    
            const data = await response.json();
            setTickets(...data);
            console.log("+++ Загруженные тикеты:", ...data);
        } catch (error) {
            console.error('Ошибка:', error);
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
            })
            .finally(() => {

            })
        fetchTickets(); // Обновляем список после изменения workflow
    };


    const openCreateTicketModal = () => {
        setCurrentTicket({
            title: '',
            description: '',
            notes: '',
            priority: priorityOptions[0],
            workflow: workflowOptions[0],
            user_id: 0,
            service_reference: "",
            social_media_references: [{}],
            technician_id: [{}]  // Изменение на массив
        });
        // setIsCreating(true);
        setIsModalOpen(true);
    };



    useEffect(() => {
        fetchTickets();
    }, [])

    const priorityStyles = {
        low: { backgroundColor: '#fff3b0', borderColor: '#ffc107' },
        medium: { backgroundColor: '#ffcc80', borderColor: '#ff9800' },
        high: { backgroundColor: '#f99a9a', borderColor: '#dc3545' },
        critical: { backgroundColor: '#f64e4e', borderColor: '#721c24' }
    };

    const workflowStyles = {
        Backlog: { backgroundColor: '#E8F5E9', borderColor: '#1B5E20' },
        'In Progress': { backgroundColor: '#C8E6C9', borderColor: '#388E3C' },
        Review: { backgroundColor: '#A5D6A7', borderColor: '#43A047' },
        Completed: { backgroundColor: '#81C784', borderColor: '#2E7D32' }
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
    };

    const closeModal = () => {
        setCurrentTicket(null);
        fetchTickets();
    }

    return (
        <div>
            <h2>Workflow Dashboard</h2>
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
            <div className='container-tickets'>
                {workflowOptions.map((workflow) => (
                    <div
                        className="colone-ticket"
                        key={workflow}
                        onDrop={(e) => handleDrop(e, workflow)}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <div className="name-workflow" style={{
                            borderColor: workflowStyles[workflow]?.borderColor || '',
                            backgroundColor: workflowStyles[workflow]?.backgroundColor || '',
                            borderWidth: '1px',
                            borderStyle: 'solid'
                        }}>
                            <h3>{workflow}</h3>
                        </div>

                        <div className="scrollable-list">
                            {tickets
                                .filter(ticket => ticket.workflow === workflow)
                                .filter(ticket =>
                                    (ticket.title?.includes(searchTerm) || ticket.description?.includes(searchTerm) || ticket.notes?.includes(searchTerm) || searchTerm === '')
                                )
                                .map(ticket => {
                                    // console.log(ticket); // Вывод тикета для отладки
                                    return (
                                        <div
                                            key={ticket.id}
                                            className="ticket"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, ticket.id)}
                                            onClick={() => {
                                                setCurrentTicket(ticket);
                                                setIsModalOpen(true);
                                            }}
                                            style={{
                                                borderColor: priorityStyles[ticket.priority]?.borderColor,
                                                backgroundColor: priorityStyles[ticket.priority]?.backgroundColor,
                                                borderWidth: '1px',
                                                borderStyle: 'solid'
                                            }}
                                        >
                                            <h4>{ticket.title || "Без заголовка"}</h4>
                                            <p>{ticket.description || "Без описания"}</p>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}

            </div>

            {currentTicket && (
                <TicketModal
                    ticket={currentTicket}

                    onClose={closeModal}


                />
            )}
        </div>
    );
}

export default WorkflowDashboard;