import React, { useState, useEffect } from 'react';
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import Cookies from 'js-cookie';
import './Modal.css';
import { translations } from '../utils/translations';

const platformOptions = ["telegram", "viber", "whatsapp", "facebook", "instagram", "sipuni"];

const TicketFilterModal = ({ isOpen, onClose, onApplyFilter }) => {
    const [technicians, setTechnicians] = useState([]);
    const language = localStorage.getItem('language') || 'RO';

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

    const isActive = (field) => filters[field] !== '';

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

    // Фетчим список техников с локальным кэшированием
    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const token = Cookies.get('jwt');

                const response = await fetch("https://pandatur-api.com/api/users-technician", {
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

                const formattedTechnicians = data.map(item => ({
                    id: item.id.id,
                    fullName: `${item.id.name} ${item.id.surname}`.trim(),
                }));

                setTechnicians(formattedTechnicians);

                // Сохраняем в localStorage
                localStorage.setItem("technicians", JSON.stringify(formattedTechnicians));
                localStorage.setItem("technicians_timestamp", Date.now());
            } catch (error) {
                console.error("Ошибка при загрузке техников:", error);
                setTechnicians([]);
            }
        };

        if (isOpen) {
            const cachedTechnicians = localStorage.getItem("technicians");
            const cachedTimestamp = localStorage.getItem("technicians_timestamp");

            if (cachedTechnicians && cachedTimestamp) {
                const timeElapsed = Date.now() - parseInt(cachedTimestamp, 10);
                if (timeElapsed < 24 * 60 * 60 * 1000) {
                    setTechnicians(JSON.parse(cachedTechnicians));
                    return;
                }
            }

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
        onApplyFilter({});
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-filter">
            <div className="modal-content-filter">
                <div className='options-container'>
                    <div className='header-filter'>{translations["Filtru lead"][language]}</div>

                    <label>{translations["Data de creare"][language]}</label>
                    <input
                        type="date"
                        name="creation_date"
                        value={filters.creation_date}
                        onChange={handleInputChange}
                        className={isActive("creation_date") ? "active-filter" : ""}
                    />

                    <label>{translations["Ultima interacțiune"][language]}</label>
                    <input
                        type="date"
                        name="last_interaction_date"
                        value={filters.last_interaction_date}
                        onChange={handleInputChange}
                        className={isActive("last_interaction_date") ? "active-filter" : ""}
                    />

                    <label>{translations["Etapa de lucru"][language]}</label>
                    <select
                        className={`select-filter ${isActive("workflow") ? "active-filter" : ""}`}
                        name="workflow"
                        value={filters.workflow}
                        onChange={handleInputChange}
                    >
                        <option value="">{translations["Toate etapele"][language]}</option>
                        {workflowOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    <label>{translations["Prioritate"][language]}</label>
                    <select
                        className={`select-filter ${isActive("priority") ? "active-filter" : ""}`}
                        name="priority"
                        value={filters.priority}
                        onChange={handleInputChange}
                    >
                        <option value="">{translations["Toate prioritățile"][language]}</option>
                        {priorityOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    <label>{translations["După responsabil lead"][language]}</label>
                    <select
                        className={`select-filter ${isActive("technician_id") ? "active-filter" : ""}`}
                        name="technician_id"
                        value={filters.technician_id}
                        onChange={handleInputChange}
                    >
                        <option value="">{translations["Toți managerii"][language]}</option>
                        {technicians.map(tech => (
                            <option key={tech.id} value={tech.id}>{`${tech.id}: ${tech.fullName}`}</option>
                        ))}
                    </select>

                    <label>{translations["După ID participant"][language]}</label>
                    <select
                        className={`select-filter ${isActive("sender_id") ? "active-filter" : ""}`}
                        name="sender_id"
                        value={filters.sender_id}
                        onChange={handleInputChange}
                    >
                        <option value="">{translations["După participant"][language]}</option>
                        {technicians.map(tech => (
                            <option key={tech.id} value={tech.id}>{`${tech.id}: ${tech.fullName}`}</option>
                        ))}
                    </select>

                    <label>{translations["Taguri"][language]}</label>
                    <input
                        type="text"
                        name="tags"
                        value={filters.tags}
                        onChange={handleInputChange}
                        placeholder={translations["Introdu tag"][language]}
                        className={isActive("tags") ? "active-filter" : ""}
                    />

                    <label>{translations["Platformă"][language]}</label>
                    <select
                        className={`select-filter ${isActive("platform") ? "active-filter" : ""}`}
                        name="platform"
                        value={filters.platform}
                        onChange={handleInputChange}
                    >
                        <option value="">{translations["Toate platformele"][language]}</option>
                        {platformOptions.map(platform => (
                            <option key={platform} value={platform}>{platform}</option>
                        ))}
                    </select>

                    <div className="modal-buttons">
                        <button onClick={handleApplyFilter} className="apply-btn">{translations["Aplică"][language]}</button>
                        <button onClick={handleResetFilters} className="reset-btn">{translations["Resetează filtre"][language]}</button>
                        <button onClick={onClose} className="cancel-btn">{translations["Închide"][language]}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketFilterModal;