import React, { useState } from 'react';
import TicketModal from './TicketModal';
import { workflowOptions } from './WorkFlowOption';
import './App.css';

function WorkflowDashboard({ tickets, updateTicket, deleteTicket, editTicket, openCreateTicketModal }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);

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
                                .map(ticket => (
                                    <div
                                        key={ticket.id}
                                        className="ticket"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                                        onClick={() => handleTicketClick(ticket)}
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
