import React, { useState } from 'react';
import TicketModal from './TicketModal';
import { workflowOptions } from './WorkFlowOption';
import { priorityOptions } from './PriorityOption';

function WorkflowDashboard({ tickets, updateTicket, deleteTicket, editTicket }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Определяем стили для приоритетов
    const priorityStyles = {
        low: { backgroundColor: '#fff3b0', borderColor: '#ffc107' },
        medium: { backgroundColor: '#ffcc80', borderColor: '#ff9800' },
        high: { backgroundColor: '#f99a9a', borderColor: '#dc3545' },
        critical: { backgroundColor: '#f64e4e', borderColor: '#721c24' }
    };


    const filteredTickets = tickets.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    // const openCreateTicketModal = () => {
    //     setCurrentTicket(null);
    //     setIsCreating(true);
    //     setIsModalOpen(true);
    // };

    const closeModal = () => setSelectedTicket(null);

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Workflow Dashboard</h2>
            {/* <div className='header'>
                <div className='container-name-header'>Tickets</div>
                <button onClick={openCreateTicketModal} className="open-modal-button">
                    Add ticket
                </button>
            </div> */}
            <div className='container-search-input'>
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
                        <div className="name-workflow">
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
                                            borderColor: priorityStyles[ticket.priority]?.borderColor || '#ddd',
                                            backgroundColor: priorityStyles[ticket.priority]?.backgroundColor || '#f9f9f9',
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
