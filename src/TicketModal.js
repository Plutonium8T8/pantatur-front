import React, { useState } from 'react';
import Priority from './Components/PriorityComponent/PriorityComponent';
import Workflow from './Components/WorkFlowComponent/WorkflowComponent';
import TagInput from './TagComponent';
import Cookies from 'js-cookie';
import { updateTicket } from './Leads';
import { useUser } from './UserContext';

const deleteTicketById = async (id) => {
  try {
    const token = Cookies.get('jwt');
    const response = await fetch(`https://pandatur-api.com/api/tickets/${id}`, {
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
    console.log('Отправляемые данные:', ticketData);
    const response = await fetch('https://pandatur-api.com/api/tickets', {
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
  const parseTags = (tags) => {
    if (Array.isArray(tags)) {
      return tags; // Если это уже массив, возвращаем как есть
    }
    if (typeof tags === 'string' && tags.startsWith('{') && tags.endsWith('}')) {
      // Убираем фигурные скобки и разделяем строку по запятым
      return tags.slice(1, -1).split(',').map(tag => tag.trim());
    }
    return []; // Если формат неизвестен, возвращаем пустой массив
  };

  const [editedTicket, setEditedTicket] = useState({
    ...ticket,
    tags: parseTags(ticket?.tags), // Используем безопасный парсер
  });

  const { userId } = useUser();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTicket((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagsChange = (updatedTags) => {
    setEditedTicket((prev) => ({
      ...prev,
      tags: updatedTags,
    }));
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
    const ticketData = {
      ...editedTicket,
      client_id: userId,
      technician_id: userId,
    };

    console.log('Данные для отправки:', ticketData);

    try {
      const res = editedTicket?.id == null
        ? await saveTicketToServer(ticketData)
        : await updateTicket(ticketData);
      console.log('Ответ сервера:', res);
      onClose();
    } catch (e) {
      console.error('Ошибка при сохранении тикета:', e);
    }
  };

  if (!editedTicket) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="id-ticket">ID Ticket #{editedTicket.id}</div>
        <label>
          Nume Client
          <input
            type="text"
            name="contact"
            value={editedTicket.contact || ""}
            onChange={handleInputChange}
            placeholder="Nume Client"
            style={{
              display: 'block',
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
            }}
          />
        </label>
        <div className="container-select-priority-workflow">
          <Priority ticket={editedTicket} onChange={handleInputChange} />
          <Workflow ticket={editedTicket} onChange={handleInputChange} />
        </div>
        <div>
          <strong>Tag-uri alese:</strong>
          <div
            style={{
              padding: '10px',
              backgroundColor: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '5px',
              marginTop: '10px',
              maxHeight: '100px',
              overflowY: 'auto',
            }}
          >
            {editedTicket.tags.length > 0 ? (
              editedTicket.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    margin: '5px',
                    fontSize: '12px',
                  }}
                >
                  {tag}
                </span>
              ))
            ) : (
              <em>Теги не выбраны</em>
            )}
          </div>
        </div>
        <div className="tags-container">
          <TagInput
            initialTags={editedTicket.tags}
            onChange={handleTagsChange}
          />
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