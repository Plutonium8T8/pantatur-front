import React, { useState, useEffect } from 'react';
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import { useAppContext } from '../../AppContext';
import Cookies from 'js-cookie';
import './Modal.css';

const platformOptions = ["telegram", "viber", "whatsapp", "facebook", "instagram", "sipuni"];

const TicketFilterModal = ({ isOpen, onClose, onApplyFilter }) => {
    const [technicians, setTechnicians] = useState([]);

    const [filters, setFilters] = useState({
        creation_date: '',
        last_interaction_date: '',
        technician_id: '',
        sender_id: '',
        workflow: '',
        priority: '',
        tags: '',
        platform: '',
    });

    // Закрытие по ESC
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Фетчим список техников
    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const token = Cookies.get('jwt');
                const response = await fetch("https://pandatur-api.com/users-technician", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Origin: 'https://plutonium8t8.github.io',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при получении списка техников: ${response.status}`);
                }

                const data = await response.json();

                // Преобразуем в массив `{ id, fullName }`
                const formattedTechnicians = data.map(item => ({
                    id: item.id.id,
                    fullName: `${item.id.name} ${item.id.surname}`.trim(), // Формируем "Имя Фамилия"
                }));

                setTechnicians(formattedTechnicians);
            } catch (error) {
                console.error("Ошибка при загрузке техников:", error);
                setTechnicians([]);
            }
        };

        if (isOpen) {
            fetchTechnicians();
        }
    }, [isOpen]);

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

    // Функция сброса фильтров
    const handleResetFilters = () => {
        setFilters({
            creation_date: '',
            last_interaction_date: '',
            technician_id: '',
            sender_id: '',
            workflow: '',
            priority: '',
            tags: '',
            platform: '',
        });
        onApplyFilter({}); // Передаем пустые фильтры для сброса
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-filter">
            <div className="modal-content-filter">
                <div className='options-container'>
                    <div className='header-filter'>Filter ticket</div>

                    <label>Create date</label>
                    <input type="date" name="creation_date" value={filters.creation_date} onChange={handleInputChange} />

                    <label>Last interaction date</label>
                    <input type="date" name="last_interaction_date" value={filters.last_interaction_date} onChange={handleInputChange} />

                    <label>Workflow</label>
                    <select className='select-filter' name="workflow" value={filters.workflow} onChange={handleInputChange}>
                        <option value="">All Workflows</option>
                        {workflowOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    <label>Priority</label>
                    <select className='select-filter' name="priority" value={filters.priority} onChange={handleInputChange}>
                        <option value="">All Priorities</option>
                        {priorityOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    <label>Responsabil Lead</label>
                    <select className='select-filter' name="technician_id" value={filters.technician_id} onChange={handleInputChange}>
                        <option value="">All Technicians</option>
                        {technicians.map(tech => (
                            <option key={tech.id} value={tech.id}>{`${tech.id}: ${tech.fullName}`}</option>
                        ))}
                    </select>

                    <label>Sender ID</label>
                    <select className='select-filter' name="sender_id" value={filters.sender_id} onChange={handleInputChange}>
                        <option value="">All Senders</option>
                        {technicians.map(tech => (
                            <option key={tech.id} value={tech.id}>{`${tech.id}: ${tech.fullName}`}</option>
                        ))}
                    </select>

                    <label>Tags</label>
                    <input type="text" name="tags" value={filters.tags} onChange={handleInputChange} placeholder="Enter tags" />

                    <label>Platform</label>
                    <select className='select-filter' name="platform" value={filters.platform} onChange={handleInputChange}>
                        <option value="">All Platforms</option>
                        {platformOptions.map(platform => (
                            <option key={platform} value={platform}>{platform}</option>
                        ))}
                    </select>

                    <div className="modal-buttons">
                        <button onClick={handleApplyFilter} className="apply-btn">Apply</button>
                        <button onClick={handleResetFilters} className="reset-btn">Reset Filters</button>
                        <button onClick={onClose} className="cancel-btn">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketFilterModal;