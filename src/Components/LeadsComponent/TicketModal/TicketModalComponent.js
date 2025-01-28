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

  const [editedTicket, setEditedTicket] = useState(() => {
    const defaultTicket = {
      contact: '',
      description: '',
      tags: [],
      priority: '',
      workflow: '',
    };

    return {
      ...defaultTicket,
      ...ticket,
      tags: parseTags(ticket?.tags), // Преобразуем теги в массив
    };
  });

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

  const handleSave = async () => {
    const ticketData = {
      ...editedTicket,
      client_id: editedTicket.client_id || userId,
      technician_id: userId,
      contact: editedTicket.contact || '',
    };

    try {
      const token = Cookies.get('jwt');
      const isEditing = Boolean(editedTicket?.client_id); // Проверяем, редактируем ли тикет
      const method = isEditing ? 'PATCH' : 'POST'; // Выбираем метод
      const url = isEditing
        ? `https://pandatur-api.com/tickets/${editedTicket.client_id}`
        : `https://pandatur-api.com/tickets`;

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

      // Локально обновляем тикеты
      setTickets((prevTickets) => {
        if (isEditing) {
          // Обновляем тикет в списке
          return prevTickets.map((ticket) =>
            ticket.client_id === updatedTicket.client_id ? updatedTicket : ticket
          );
        } else {
          // Добавляем новый тикет в список
          return [...prevTickets, updatedTicket];
        }
      });

      console.log('Тикеты локально обновлены:', updatedTicket);

      onClose();
    } catch (e) {
      console.error('Ошибка при сохранении тикета:', e);
    }
  };

  const deleteTicketById = async () => {
    try {
      const token = Cookies.get('jwt');
      const response = await fetch(`https://pandatur-api.com/tickets/${editedTicket?.client_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Origin: 'https://plutonium8t8.github.io',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error deleting ticket');
      }

      // Локальное обновление списка тикетов
      setTickets((prevTickets) => prevTickets.filter((t) => t.client_id !== editedTicket.client_id));

      onClose(); // Закрыть модальное окно
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>
            <FaUser /> {translations['Lead nou'][language]}
          </h2>
        </header>
        <div className="ticket-modal-form">
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
          <TagInput
            initialTags={editedTicket.tags || []} // Передаем массив тегов
            onChange={handleTagsChange}
          />
          <div className="input-group">
            <label>{translations['Descriere'][language]}:</label>
            <textarea
              name="description"
              value={editedTicket.description || ''}
              onChange={handleInputChange}
              placeholder={translations['Adaugă descriere lead'][language]}
            />
          </div>
          <div className="container-select-priority-workflow">
            <Priority ticket={editedTicket} onChange={handleInputChange} />
            <Workflow ticket={editedTicket} onChange={handleInputChange} />
          </div>
          <div className="button-container">
            {ticket?.client_id && (
              <button
                className="clear-button"
                onClick={() => deleteTicketById()}
              >
                <FaTrash /> {translations['Șterge'][language]}
              </button>
            )}
            <button
              className="submit-button"
              onClick={handleSave}
            >
              {ticket?.client_id ? translations['Salvează'][language] : translations['Creează'][language]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;