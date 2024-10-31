import React, { useState, useEffect } from 'react';
import Priority from './store/Components/PriorityComponent/PriorityComponent';
import Workflow from './store/Components/WorkFlowComponent/WorkflowComponent';
import Cookies from 'js-cookie';
import { updateTicket } from './WorkflowDashboard';

export const deleteTicketById = async (id) => {
  try {
    const token = Cookies.get('jwt');
    const response = await fetch(`https://pandaturapi-293102893820.europe-central2.run.app/api/tickets/${id}`, {
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
    const response = await fetch('https://pandaturapi-293102893820.europe-central2.run.app/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Use the token for authorization
      },
      body: JSON.stringify({ ...ticketData, userId: ticketData.user_id, socialMediaReferences: ticketData.social_media_references, serviceReference: ticketData.service_reference }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.statusText}`);
    }

    const data = await response.json();
    //console.log('Успешно сохранен тикет:', data);
    return data;

  } catch (error) {
    console.error('Ошибка при сохранении тикета на сервер:', error);
  }
};

const TicketModal = ({ ticket, onClose }) => {

  const [editedTicket, setEditedTicket] = useState(ticket);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTicket((prevTicket) => ({
      ...prevTicket,
      [name]: value
    }));
    console.log("+++ ", name, value);
  };

  const onDelete = async (ticketId) => {
    deleteTicketById(ticketId).then(res => {
      console.log(res);
      onClose();
    }).catch(e => {

    })
    //setTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== ticketId));
    // Обновляем список тикетов после удаления

  };

  const handleSave = () => {
    console.log("ticket: ", editedTicket)
    if (!editedTicket.id) {
      saveTicketToServer(editedTicket)
        .then(res => {
          console.log(res);
          onClose();
        })
        .catch(e => {
          console.error(e);
        })
        .finally(() => {

        });
    } else {
      updateTicket({ ...editedTicket })
        .then(res => {
          console.log(res);
          onClose();
        })
        .catch(e => console.error(e))
    }
  };

  if (!ticket) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <>
          <label>
            userID
            <input
              type="text"
              name="user_id"
              value={editedTicket.userId}
              onChange={handleInputChange}
              placeholder="userID"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>
          {/* <label>
            serviceReference
            <input
              type="text"
              name="serviceReference"
              value={editedTicket.serviceReference}
              onChange={handleInputChange}
              placeholder="serviceReference"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label> */}
          {/* <label>
            platform
            <input
              type="text"
              name="platform"
              value={editedTicket.social_media_references[0].platform}
              onChange={handleInputChange}
              placeholder="platform"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label> */}
          {/* <label>
            chatID
            <input
              type="text"
              name="chatId"
              value={editedTicket.social_media_references[0].chat_id ?? ""}
              onChange={handleInputChange}
              placeholder="chatID"
              style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label> */}
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
            {ticket.id && (
              <button onClick={() => onDelete(ticket.id)} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Delete
              </button>
            )}
            <button onClick={handleSave} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
              {!editedTicket.id ? 'Create' : 'Save'}
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
