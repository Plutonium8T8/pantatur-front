import React, { useState, useRef } from 'react';
import { FaUser, FaTrash } from 'react-icons/fa';
import './TicketModalComponent.css';
import Priority from '../../PriorityComponent/PriorityComponent';
import Workflow from '../../WorkFlowComponent/WorkflowComponent';
import TagInput from '../../TagsComponent/TagComponent';
import { useUser } from '../../../UserContext';
import Cookies from 'js-cookie';
import { translations } from "../../utils/translations";
import { useAppContext } from '../../../AppContext'; // Используем AppContext для работы с tickets

const TicketModal = ({ ticket, onClose, onSave }) => {
  const modalRef = useRef(null);
  const language = localStorage.getItem('language') || 'RO';

  const { setTickets } = useAppContext(); // Обновление тикетов через контекст
  const { userId } = useUser();

  // Функция для обработки тегов
  const parseTags = (tags) => {
    if (Array.isArray(tags)) {
      return tags;
    }
    if (typeof tags === 'string' && tags.startsWith('{') && tags.endsWith('}')) {
      return tags
        .slice(1, -1) // Убираем `{` и `}`
        .split(',') // Разделяем по запятой
        .map((tag) => tag.trim()) // Убираем пробелы
        .filter((tag) => tag !== ''); // Убираем пустые строки
    }
    return []; // Если формат неизвестен, возвращаем пустой массив
  };

  const [editedTicket, setEditedTicket] = useState(() => ({
    contact: '',
    description: '',
    tags: [],
    priority: '',
    workflow: '',
    nume: '',
    prenume: '',
    mail: '',
    telefon: '',
    ...ticket,
    tags: parseTags(ticket?.tags),
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTicket(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (updatedTags) => {
    setEditedTicket(prev => ({ ...prev, tags: updatedTags }));
  };

  const handleSave = async () => {
    const ticketData = {
      ...editedTicket,
      ticket_id: editedTicket.id || userId,
      technician_id: userId,
      contact: editedTicket.contact || '',
    };

    try {
      const token = Cookies.get('jwt');
      const isEditing = Boolean(editedTicket?.id);
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing
        ? `https://pandatur-api.com/api/tickets/${editedTicket.id}`
        : `https://pandatur-api.com/api/tickets`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://plutonium8t8.github.io',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to save ticket: ${response.status}. ${error.message}`);
      }

      const updatedTicket = await response.json();

      setTickets(prevTickets => isEditing
        ? prevTickets.map(ticket => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
        : [...prevTickets, updatedTicket]
      );

      onClose();
    } catch (e) {
      console.error('Ошибка при сохранении тикета:', e);
    }
  };

  const deleteTicketById = async () => {
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`https://pandatur-api.com/api/tickets/${editedTicket?.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Origin: 'https://plutonium8t8.github.io',
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error deleting ticket');

      setTickets(prevTickets => prevTickets.filter(t => t.id !== editedTicket.id));
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>
            <FaUser /> {translations['Lead nou'][language]}
          </h2>
        </header>
        <div className="ticket-modal-form">
          <div className="container-select-priority-workflow">
            <Priority ticket={editedTicket} onChange={handleInputChange} />
            <Workflow ticket={editedTicket} onChange={handleInputChange} />
          </div>
          <div className="input-group">
            <label>{translations['name'][language]}:</label>
            <input
              type="text"
              name="nume"
              value={editedTicket.nume || ''}
              onChange={handleInputChange}
              placeholder={translations['name'][language]}
            />
          </div>
          <div className="input-group">
            <label>{translations['surname'][language]}:</label>
            <input
              type="text"
              name="prenume"
              value={editedTicket.prenume || ''}
              onChange={handleInputChange}
              placeholder={translations['surname'][language]}
            />
          </div>
          <div className="input-group">
            <label>{translations['email'][language]}:</label>
            <input
              type="email"
              name="mail"
              value={editedTicket.mail || ''}
              onChange={handleInputChange}
              placeholder={translations['email'][language]}
            />
          </div>
          <div className="input-group">
            <label>{translations['phone'][language]}:</label>
            <input
              type="tel"
              name="telefon"
              value={editedTicket.telefon || ''}
              onChange={handleInputChange}
              placeholder={translations['phone'][language]}
            />
          </div>
          <div className="input-group">
            <label>{translations['Contact'][language]}:</label>
            <input
              type="text"
              name="contact"
              value={editedTicket.contact || ''}
              onChange={handleInputChange}
              placeholder={translations['Contact'][language]}
            />
          </div>
          <TagInput initialTags={editedTicket.tags || []} onChange={handleTagsChange} />
          <div className="input-group">
            <label>{translations['Descriere'][language]}:</label>
            <textarea
              name="description"
              value={editedTicket.description || ''}
              onChange={handleInputChange}
              placeholder={translations['Adaugă descriere lead'][language]}
            />
          </div>
          <div className="button-container">
            {ticket?.id && (
              <button className="clear-button" onClick={deleteTicketById}>
                <FaTrash /> {translations['Șterge'][language]}
              </button>
            )}
            <button className="submit-button" onClick={handleSave}>
              {ticket?.id ? translations['Salvează'][language] : translations['Creează'][language]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;