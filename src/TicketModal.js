import React, { useState } from 'react';
import Priority from './Components/PriorityComponent/PriorityComponent';
import Workflow from './Components/WorkFlowComponent/WorkflowComponent';
import Cookies from 'js-cookie';
import { updateTicket } from './WorkflowDashboard';
import { useUser } from './UserContext';
import { transportOptions } from './FormOptions/TransportOptions';
import { countryOptions } from './FormOptions/CountryOptions';
import Select from './Components/SelectComponent/SelectComponent';

const deleteTicketById = async (id) => {
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
      throw new Error('Ошибка при удалении данных');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
  }
};

const saveTicketToServer = async (ticketData) => {
  try {
    const token = Cookies.get('jwt');
    const response = await fetch('https://pandaturapi.com/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при сохранении тикета на сервер:', error);
  }
};

const TicketModal = ({ ticket, onClose }) => {
  const [editedTicket, setEditedTicket] = useState(ticket || {});
  const { userId } = useUser();

  const handleInputChange = (e) => {
    const { name, value } = e.target || {};
    if (name) {
      setEditedTicket((prevTicket) => ({
        ...prevTicket,
        [name]: value,
      }));
    }
  };

  const onDelete = async (ticketId) => {
    try {
      const res = await deleteTicketById(ticketId);
      console.log(res);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    const ticketData = { ...editedTicket, client_id: userId };

    console.log('Sending ticketData:', ticketData);

    try {
      const res = editedTicket?.id == null
        ? await saveTicketToServer(ticketData)
        : await updateTicket(ticketData);
      console.log(res);
      onClose();
    } catch (e) {
      console.error('Error saving ticket:', e);
    }
  };

  if (!editedTicket) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className='id-ticket'>ID Ticket #{editedTicket.id}</div>
        <label>
          Nume Client
          <input
            type="text"
            name="contact"
            value={editedTicket.contact || ""}
            onChange={handleInputChange}
            placeholder="Nume Client"
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
        </label>
        <div className='select-container-modal'>
          <Select
            options={countryOptions}
            label="Country"
            id="country-select"
            value={editedTicket.country || ""}
            onChange={(value) => handleInputChange({ target: { name: 'country', value } })}
          />
          <Select
            options={transportOptions}
            label="Transport"
            id="transport-select"
            value={editedTicket.transport || ""}
            onChange={(value) => handleInputChange({ target: { name: 'transport', value } })}
          />
        </div>
        <div className='container-select-priority-workflow'>
          <Priority ticket={editedTicket} onChange={handleInputChange} />
          <Workflow ticket={editedTicket} onChange={handleInputChange} />
        </div>
        <div className="container-button-save-delete-close">
          {ticket?.id && (
            <button onClick={() => onDelete(ticket.id)} className="button-delete">
              Delete
            </button>
          )}
          <button onClick={handleSave} className="button-save">
            {!editedTicket.id ? 'Create' : 'Save'}
          </button>
          <button onClick={onClose} className="button-close">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;