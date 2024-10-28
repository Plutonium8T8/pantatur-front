import React, { useState } from 'react';
import TicketModal from './TicketModal';
import { workflowOptions } from './WorkFlowOption';
import './App.css';

function WorkflowDashboard({ tickets, updateTicket, deleteTicket, editTicket, addTicket, openCreateTicketModal }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredTickets = tickets.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const priorityStyles = {
        low: { backgroundColor: '#fff3b0', borderColor: '#ffc107' },        // Желтый
        medium: { backgroundColor: '#ffcc80', borderColor: '#ff9800' },     // Оранжевый
        high: { backgroundColor: '#f99a9a', borderColor: '#dc3545' },
        critical: { backgroundColor: '#f64e4e', borderColor: '#721c24' }
    };

    const workflowStyles = {
        Backlog: { backgroundColor: '#E8F5E9', borderColor: '#1B5E20' }, // Light Green
        'In Progress': { backgroundColor: '#C8E6C9', borderColor: '#388E3C' }, // Medium Green
        Review: { backgroundColor: '#A5D6A7', borderColor: '#43A047' }, // Mid-Dark Green
        Completed: { backgroundColor: '#81C784', borderColor: '#2E7D32' } // Dark Green
    };    

    const handleDragStart = (e, ticketId) => {
        e.dataTransfer.setData('ticketId', ticketId);
    };

    const handleDrop = (e, workflow) => {
        const ticketId = e.dataTransfer.getData('ticketId');
        updateTicket(ticketId, workflow);
    };

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
    };

    const closeModal = () => setSelectedTicket(null);

    return (
        <div>
            <h2>Workflow Dashboard</h2>
            <div className='header'>
                <div className='container-name-header'>Tickets</div>
                <button onClick={openCreateTicketModal} className='button-add-ticket'>Add Ticket</button>
                <div className='container-search-input'>
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
                        <div
                            className="name-workflow"
                            style={{
                                borderColor: workflowStyles[workflow]?.borderColor || '', // Безопасный доступ к цвету границы
                                backgroundColor: workflowStyles[workflow]?.backgroundColor || '', // Безопасный доступ к фону
                                borderWidth: '1px',  // Задаем ширину границы
                                borderStyle: 'solid'  // Задаем стиль границы
                            }}>
                            <h3>{workflow}</h3>
                        </div>


                        <div className="scrollable-list">
                            {filteredTickets
                                .filter(ticket => ticket.workflow === workflow)
                                .map(ticket => (
                                    <div
                                        key={ticket.id}
                                        className="ticket"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                                        onClick={() => handleTicketClick(ticket)}
                                        style={{
                                            borderColor: priorityStyles[ticket.priority].borderColor,
                                            backgroundColor: priorityStyles[ticket.priority].backgroundColor,
                                            borderWidth: '1px',  // Ensure there's a border width if needed
                                            borderStyle: 'solid'  // Ensure the border style is solid
                                        }}
                                    >
                                        <h4>{ticket.title}</h4>
                                        <p>{ticket.description}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedTicket && (
                <TicketModal
                    ticket={selectedTicket}
                    onClose={closeModal}
                    onDelete={(id) => {
                        deleteTicket(id);
                        closeModal();
                    }}
                    onEdit={(updatedTicket) => {
                        editTicket(updatedTicket);
                        closeModal();
                    }}
                />
            )}
        </div>
    );
}

export default WorkflowDashboard;
