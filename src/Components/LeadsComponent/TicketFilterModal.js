import React, { useState } from 'react';
import './Modal.css';

const TicketFilterModal = ({ isOpen, onClose, onApplyFilter }) => {
    const [filters, setFilters] = useState({
        creation_date: '',
        technician_id: '',
        last_interaction_date: '',
        workflow: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleApplyFilter = () => {
        onApplyFilter(filters);
        onClose(); // Закрываем модалку после применения фильтра
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Filter ticket</h2>

                <label>Create date:</label>
                <input
                    type="date"
                    name="creation_date"
                    value={filters.creation_date}  // ✅ Исправлено
                    onChange={handleInputChange}
                />

                <label>Last interaction date:</label>
                <input
                    type="date"
                    name="last_interaction_date"  // ✅ Исправлено
                    value={filters.last_interaction_date}  // ✅ Исправлено
                    onChange={handleInputChange}
                />

                <label>Workflow:</label>
                <input
                    type="text"
                    name="workflow"
                    value={filters.workflow}
                    onChange={handleInputChange}
                    placeholder="Workflow"
                />

                <label>Technician ID:</label>
                <input
                    type="text"
                    name="technician_id"
                    value={filters.technician_id}
                    onChange={handleInputChange}
                    placeholder="Technician ID"
                />

                <div className="modal-buttons">
                    <button onClick={handleApplyFilter} className="apply-btn">Save</button>
                    <button onClick={onClose} className="cancel-btn">Close</button>
                </div>
            </div>
        </div>
    );
};

export default TicketFilterModal;