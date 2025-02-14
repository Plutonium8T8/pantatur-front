import React, { useState, useEffect, useRef } from "react";
import { priorityOptions } from "../../FormOptions/PriorityOption";
import { workflowOptions } from "../../FormOptions/WorkFlowOption";
import Cookies from "js-cookie";
import "./Modal.css";
import { translations } from "../utils/translations";

const platformOptions = ["telegram", "viber", "whatsapp", "facebook", "instagram", "sipuni"];

const TicketFilterModal = ({ isOpen, onClose, onApplyFilter }) => {
    const [technicians, setTechnicians] = useState([]);
    const language = localStorage.getItem("language") || "RO";
    const modalRef = useRef(null);

    const defaultFilters = {
        creation_date: "",
        last_interaction_date: "",
        technician_id: "",
        sender_id: "",
        workflow: "",
        priority: "",
        tags: "",
        platform: "",
    };

    const [filters, setFilters] = useState(defaultFilters);

    const tabs = [
        "Active leads",
        "My leads",
        "Won leads",
        "Lost leads",
        "Leads without Tasks",
        "Leads with Overdue Tasks",
    ];

    const [activeTab, setActiveTab] = useState(tabs[0]);

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const token = Cookies.get("jwt");

                const response = await fetch("https://pandatur-api.com/api/users-technician", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Origin: "https://plutonium8t8.github.io",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при получении списка техников: ${response.status}`);
                }

                const data = await response.json();

                const formattedTechnicians = data.map((item) => ({
                    id: item.id.id,
                    fullName: `${item.id.name} ${item.id.surname}`.trim(),
                }));

                setTechnicians(formattedTechnicians);
            } catch (error) {
                console.error("Ошибка при загрузке техников:", error);
                setTechnicians([]);
            }
        };

        if (isOpen) fetchTechnicians();
    }, [isOpen]);

    // Закрытие модального окна при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

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
        setFilters(defaultFilters);
        onApplyFilter(defaultFilters);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" ref={modalRef}>
                <div className="filter-container">
                    {/* Левая колонка - Вкладки */}
                    <div className="tabs">
                        {tabs.map((tab) => (
                            <div
                                key={tab}
                                className={`tab ${activeTab === tab ? "active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>

                    {/* Правая колонка - Фильтры */}
                    <div className="filters">
                        <h3>{translations["Filtru lead"][language]}</h3>

                        <label>{translations["Data de creare"][language]}</label>
                        <input type="date" name="creation_date" value={filters.creation_date} onChange={handleInputChange} />

                        <label>{translations["Ultima interacțiune"][language]}</label>
                        <input type="date" name="last_interaction_date" value={filters.last_interaction_date} onChange={handleInputChange} />

                        <label>{translations["Etapa de lucru"][language]}</label>
                        <select name="workflow" value={filters.workflow} onChange={handleInputChange}>
                            <option value="">{translations["Toate etapele"][language]}</option>
                            {workflowOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>

                        <label>{translations["Prioritate"][language]}</label>
                        <select name="priority" value={filters.priority} onChange={handleInputChange}>
                            <option value="">{translations["Toate prioritățile"][language]}</option>
                            {priorityOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>

                        <label>{translations["După responsabil lead"][language]}</label>
                        <select name="technician_id" value={filters.technician_id} onChange={handleInputChange}>
                            <option value="">{translations["Toți managerii"][language]}</option>
                            {technicians.map((tech) => (
                                <option key={tech.id} value={tech.id}>
                                    {`${tech.id}: ${tech.fullName}`}
                                </option>
                            ))}
                        </select>

                        <label>{translations["Platformă"][language]}</label>
                        <select name="platform" value={filters.platform} onChange={handleInputChange}>
                            <option value="">{translations["Toate platformele"][language]}</option>
                            {platformOptions.map((platform) => (
                                <option key={platform} value={platform}>
                                    {platform}
                                </option>
                            ))}
                        </select>

                        <div className="modal-buttons">
                            <button onClick={handleApplyFilter} className="apply-btn">
                                {translations["Aplică"][language]}
                            </button>
                            <button onClick={handleResetFilters} className="reset-btn">
                                {translations["Resetează filtre"][language]}
                            </button>
                            <button onClick={onClose} className="cancel-btn">
                                {translations["Închide"][language]}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketFilterModal;