import React, { useState } from 'react';
import Priority from './Components/PriorityComponent/PriorityComponent';
import Workflow from './Components/WorkFlowComponent/WorkflowComponent';
import Cookies from 'js-cookie';
import { updateTicket } from './WorkflowDashboard';
import { useUser } from './UserContext';

export const deleteTicketById = async (id) => {
  try {
    const token = Cookies.get('jwt');
    const response = await fetch(`https://pandaturapi.com/api/tickets/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка при delete данных');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Ошибка:', error);
  }
};

const saveTicketToServer = async (ticketData) => {
  try {
    const token = Cookies.get('jwt');
    console.log(token);
    const response = await fetch('https://pandaturapi.com/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ ...ticketData }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Ошибка при сохранении тикета на сервер:', error);
  }
};

const TicketModal = ({ ticket, onClose }) => {
  const [editedTicket, setEditedTicket] = useState(ticket);
  const { userId } = useUser(); // Получаем user_id из контекста

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTicket((prevTicket) => ({
      ...prevTicket,
      [name]: value
    }));
  };

  const onDelete = async (ticketId) => {
    deleteTicketById(ticketId).then(res => {
      console.log(res);
      onClose();
    }).catch(e => console.error(e));
  };

  const handleSave = () => {
    const ticketData = { ...editedTicket, user_id: userId }; // Добавляем user_id в данные тикета

    if (!editedTicket.id) {
      saveTicketToServer(ticketData)
        .then(res => {
          console.log(res);
          onClose();
        })
        .catch(e => console.error(e));
    } else {
      updateTicket(ticketData)
        .then(res => {
          console.log(res);
          onClose();
        })
        .catch(e => console.error(e));
    }
  };

  if (!ticket) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className='id-ticket'>ID Ticket #{editedTicket.id}</div>
        <>
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
          <div className="container-button-save-delete-close">
            {ticket.id && (
              <button
                onClick={() => onDelete(ticket.id)}
                className="button-delete"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              className="button-save"
            >
              {!editedTicket.id ? 'Create' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="button-close"
            >
              Close
            </button>
          </div>
        </>
      </div>
    </div>
  );
}

export default TicketModal;