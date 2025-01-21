import React, { useEffect, useRef, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import './TicketModalComponent.css';
import Priority from '../../PriorityComponent/PriorityComponent';
import Workflow from '../../WorkFlowComponent/WorkflowComponent';
import TagInput from '../../TagsComponent/TagComponent';

const TicketModal = ({ ticket, onClose, onSave }) => {
  const modalRef = useRef(null);
  const [editedTicket, setEditedTicket] = useState({
    ...ticket,
    description: ticket?.description || '',
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

  const handleSave = () => {
    if (onSave) {
      onSave(editedTicket);
    }
    onClose();
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>
            <FaUser /> Ticket #{ticket?.id || 'New'}
          </h2>
        </header>
        <div className="ticket-modal-form">
          <label className="input-group">
            Name:
            <input
              type="text"
              name="name"
              value={editedTicket.name || ''}
              onChange={handleInputChange}
              placeholder="Client Name"
            />
          </label>
          <label className="input-group">
            Description:
            <textarea
              name="description"
              value={editedTicket.description || ''}
              onChange={handleInputChange}
              placeholder="Add ticket details"
            />
          </label>

          <label className="input-group">
          <div className="container-select-priority-workflow">
            <Priority ticket={editedTicket} onChange={handleInputChange} />
            <Workflow ticket={editedTicket} onChange={handleInputChange} />
          </div>
          </label>
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
                <em>No tags selected</em>
              )}
            </div>
          </div>
          <div className="tags-container">
            <TagInput
              initialTags={editedTicket.tags}
              onChange={handleTagsChange}
            />
          </div>
          <div className="button-container">
            <button className="submit-button" onClick={handleSave}>
              {ticket?.id ? 'Save' : 'Create'}
            </button>
            {ticket?.id && (
              <button className="clear-button" onClick={() => onSave(null)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;