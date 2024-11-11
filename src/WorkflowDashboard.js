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
            service_reference: "",
            technician_id: 0  // Изменение на массив
        });
        // setIsCreating(true);
        setIsModalOpen(true);
    };



    useEffect(() => {
        fetchTickets();
    }, [])

    // const priorityStyles = {
    //     low: { backgroundColor: '#fff3b0', borderColor: '#ffc107' },
    //     medium: { backgroundColor: '#ffcc80', borderColor: '#ff9800' },
    //     high: { backgroundColor: '#f99a9a', borderColor: '#dc3545' },
    //     critical: { backgroundColor: '#f64e4e', borderColor: '#721c24' }
    // };

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



    // "Interesat",
    // "Apel de intrare",
    // "De prelucrat",
    // "Luat in lucru",
    // "Oferta trimisa",
    // "Aprobat cu client",
    // "Contract semnat",
    // "Plata primita",
    // "Contract incheiat"

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
                                // borderColor: workflowStyles[workflow]?.borderColor || '',
                                backgroundColor: workflowStyles[workflow]?.backgroundColor || '',
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
                                        // style={{
                                        //     borderColor: priorityStyles[ticket.priority]?.borderColor,
                                        //     backgroundColor: priorityStyles[ticket.priority]?.backgroundColor,
                                        //     borderWidth: '1px',
                                        //     borderStyle: 'solid'
                                        // }}
                                        >
                                            <div className='foto-description'>
                                                <div><img className='foto-user' src="/user fon.png" alt="example" /> </div>
                                                <div className='tickets-descriptions'>
                                                    {/* <div>ID #{ticket.id}</div> */}
                                                    <div>{ticket.title || "NameClient"}</div>
                                                    <div>{ticket.description || "Avion/autocar"}</div>
                                                    <div>{ticket.notes || "Turcia/Egipt"}</div>
                                                </div>
                                            </div>
                                            <div className='container-time-tasks'>
                                                <div>time</div>
                                                <div>tasks</div>
                                            </div>
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