import React, { useState, useEffect } from 'react';
import { workflowOptions } from './WorkFlowOption';
import { priorityOptions } from './PriorityOption';
import Priority from './store/Component/PriorityComponent/PriorityComponent';
import Workflow from './store/Component/WorkFlowComponent/WorkflowComponent';
import Cookies from 'js-cookie';

const saveTicketToServer = async (ticketData, isCreating) => {
  try {
    const token = Cookies.get('jwt');
    const response = await fetch('https://pandaturapi-293102893820.europe-central2.run.app/api/tickets', {
      method: isCreating ? 'POST' : 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Use the token for authorization
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Успешно сохранен тикет:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при сохранении тикета на сервер:', error);
  }
};

function TicketModal({ ticket, onClose, onDelete, onEdit, isCreating }) {
  const [editedTicket, setEditedTicket] = useState(ticket || {
    title: '',
    description: '',
    notes: '',
    priority: priorityOptions[0],
    workflow: workflowOptions[0],
    userId: "",
    serviceReference: "",
    socialMediaReferences: [{}],
    technician_id: [{}]  // Изменение на массив
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'platform' || name === 'chatId') {
      setEditedTicket((prevTicket) => ({
        ...prevTicket,
        socialMediaReferences: [{
          ...prevTicket.socialMediaReferences[0],
          [name]: value
        }]
      }));
    } else if (name === 'technician_id') {
      setEditedTicket((prevTicket) => ({
        ...prevTicket,
        technician_id: [value] // Установка technician_id как массив
      }));
    } else {
      setEditedTicket((prevTicket) => ({ ...prevTicket, [name]: value }));
    }
    console.log("+++ ", name, value);
  };

  const handleSave = async () => {
    const savedTicket = await saveTicketToServer(editedTicket, isCreating);
    if (savedTicket) {
      onEdit(savedTicket); // Update local state if server returns updated ticket
      onClose();
    }
  };

  if (!ticket && !isCreating) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <>
          <label>
            userID
            <input
              type="text"
              name="userId"
              value={editedTicket.userId}
              onChange={handleInputChange}
              placeholder="userID"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>
          <label>
            serviceReference
            <input
              type="text"
              name="serviceReference"
              value={editedTicket.serviceReference}
              onChange={handleInputChange}
              placeholder="serviceReference"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>
          <label>
            platform
            <input
              type="text"
              name="platform"
              value={editedTicket.socialMediaReferences[0].platform}
              onChange={handleInputChange}
              placeholder="platform"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>
          <label>
            chatID
            <input
              type="text"
              name="chatId"
              value={editedTicket.socialMediaReferences[0].chatId}
              onChange={handleInputChange}
              placeholder="chatID"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>
          <label>
            Title
            <input
              type="text"
              name="title"
              value={editedTicket.title}
              onChange={handleInputChange}
              placeholder="Title"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={editedTicket.description}
              onChange={(e) => {
                handleInputChange(e);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Description"
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                minHeight: 'fit-content',
                overflow: 'hidden'
              }}
            />
          </label>
          <label>
            Notes
            <textarea
              name="notes"
              value={editedTicket.notes}
              onChange={handleInputChange}
              placeholder="Notes"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>
          <div className='container-select-priority-workflow'>
            <Priority ticket={editedTicket} onChange={handleInputChange} />
            <Workflow ticket={editedTicket} onChange={handleInputChange} />
          </div>
          <div className='container-button-save-delete-close'>
            {!isCreating && (
              <button onClick={() => onDelete(ticket.id)} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Delete
              </button>
            )}
            <button onClick={handleSave} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
              {isCreating ? 'Create' : 'Save'}
            </button>
            <button onClick={onClose} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Close
            </button>
          </div>
        </>
      </div>
    </div>
  );
}

export default TicketModal;
