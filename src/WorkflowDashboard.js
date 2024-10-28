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

    const closeModal = () => setSelectedTicket(null);

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Workflow Dashboard</h2>

            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tickets..."
                className='search-input'
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
                {workflowOptions.map((workflow) => (
                    <div
                        key={workflow}
                        onDrop={(e) => handleDrop(e, workflow)}
                        onDragOver={(e) => e.preventDefault()}
                        style={{
                            flex: '0 0 200px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '1rem',
                        }}
                    >
                        <h3>{workflow}</h3> 
                        {filteredTickets
                            .filter(ticket => ticket.workflow === workflow)
                            .map(ticket => (
                                <div
                                    key={ticket.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, ticket.id)}
                                    onClick={() => handleTicketClick(ticket)}
                                    style={{
                                        padding: '1rem',
                                        border: `1px solid ${priorityStyles[ticket.priority]?.borderColor || '#ddd'}`,
                                        borderRadius: '4px',
                                        marginBottom: '1rem',
                                        backgroundColor: priorityStyles[ticket.priority]?.backgroundColor || '#f9f9f9',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <h4>{ticket.title}</h4>
                                    <p>{ticket.description}</p>
                                </div>
                            ))}
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
