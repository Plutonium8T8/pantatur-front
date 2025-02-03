import React, { useState } from 'react';
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import './Modal.css';

const TicketFilterModal = ({ isOpen, onClose, onApplyFilter }) => {
    
    const platformOptions = ["telegram", "viber", "whatsapp", "facebook", "instagram", "sipuni"];
    const [filters, setFilters] = useState({
        creation_date: '',
        last_interaction_date: '',
        technician_id: '',
        workflow: '',
        priority: '',
        tags: '',
        platform: '',
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
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-filter">
            <div className="modal-content-filter">
                <h2>Filter ticket</h2>

                <label>Create date</label>
                <input
                    type="date"
                    name="creation_date"
                    value={filters.creation_date}
                    onChange={handleInputChange}
                />

                <label>Last interaction date</label>
                <input
                    type="date"
                    name="last_interaction_date"
                    value={filters.last_interaction_date}
                    onChange={handleInputChange}
                />

                <label>Workflow</label>
                <select name="workflow" value={filters.workflow} onChange={handleInputChange}>
                    <option value="">All Workflows</option>
                    {workflowOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <label>Priority</label>
                <select name="priority" value={filters.priority} onChange={handleInputChange}>
                    <option value="">All Priorities</option>
                    {priorityOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <label>Responsabil lead</label>
                <input
                    type="text"
                    name="technician_id"
                    value={filters.technician_id}
                    onChange={handleInputChange}
                    placeholder="Technician ID"
                />

                <label>Tags</label>
                <input
                    type="text"
                    name="tags"
                    value={filters.tags}
                    onChange={handleInputChange}
                    placeholder="Enter tags (comma separated)"
                />

                <label>Platform</label>
                <select name="platform" value={filters.platform} onChange={handleInputChange}>
                    <option value="">All Platforms</option>
                    {platformOptions.map((platform) => (
                        <option key={platform} value={platform}>
                            {platform}
                        </option>
                    ))}
                </select>

                <div className="modal-buttons">
                    <button onClick={handleApplyFilter} className="apply-btn">Apply</button>
                    <button onClick={onClose} className="cancel-btn">Close</button>
                </div>
            </div>
        </div>
    );
};

export default TicketFilterModal;