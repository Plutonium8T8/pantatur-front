import React, { useState, useEffect, useRef } from "react";
import { priorityOptions } from "../../FormOptions/PriorityOption";
import { workflowOptions } from "../../FormOptions/WorkFlowOption";
import CustomMultiSelect from "../MultipleSelect/MultipleSelect"; // Используем твой Multi-Select
import Cookies from "js-cookie";
import "./Modal.css";

const platformOptions = ["telegram", "viber", "whatsapp", "facebook", "instagram", "sipuni"];

const TicketFilterModal = ({ isOpen, onClose, onApplyFilter }) => {
    const [technicians, setTechnicians] = useState([]);
    const modalRef = useRef(null);

    const filterGroups = {
        "General": ["workflow"], // Только Workflow
        "Ticket": ["creation_date", "last_interaction_date", "priority", "technician_id", "sender_id", "tags", "platform"], // Остальные поля
    };

    const filterDefaults = {
        creation_date: "",
        last_interaction_date: "",
        technician_id: "",
        sender_id: "",
        workflow: [],
        priority: "",
        tags: "",
        platform: "",
    };

    const tabs = Object.keys(filterGroups);
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [filters, setFilters] = useState(filterDefaults);

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

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleWorkflowChange = (selectedWorkflows) => {
        setFilters((prev) => ({
            ...prev,
            workflow: selectedWorkflows,
        }));
    };

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
        setFilters(filterDefaults);
        onApplyFilter(filterDefaults);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-filter">
            <div className="modal-content-filter" ref={modalRef}>
                <div className="filter-container">
                    {/* Левая колонка - Группы фильтров */}
                    <div className="tabs">
                        {tabs.map((tab) => (
                            <div
                                key={tab}
                                className={`tab ${activeTab === tab ? "active" : ""}`}
                                onClick={() => handleTabClick(tab)}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>

                    {/* Правая колонка - Поля фильтров */}
                    <div className="filters">
                        <h3>Фильтр</h3>

                        {filterGroups[activeTab].includes("workflow") && (
                            <>
                                <label>Этап работы</label>
                                <CustomMultiSelect
                                    options={workflowOptions}
                                    placeholder="Выберите этапы"
                                    onChange={handleWorkflowChange}
                                />
                            </>
                        )}

                        {filterGroups[activeTab].includes("creation_date") && (
                            <>
                                <label>Дата создания</label>
                                <input type="date" name="creation_date" value={filters.creation_date || ""} onChange={handleInputChange} />
                            </>
                        )}

                        {filterGroups[activeTab].includes("last_interaction_date") && (
                            <>
                                <label>Последняя активность</label>
                                <input type="date" name="last_interaction_date" value={filters.last_interaction_date || ""} onChange={handleInputChange} />
                            </>
                        )}

                        {filterGroups[activeTab].includes("priority") && (
                            <>
                                <label>Приоритет</label>
                                <select name="priority" value={filters.priority || ""} onChange={handleInputChange}>
                                    <option value="">Все приоритеты</option>
                                    {priorityOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        {filterGroups[activeTab].includes("technician_id") && (
                            <>
                                <label>Ответственный</label>
                                <select name="technician_id" value={filters.technician_id || ""} onChange={handleInputChange}>
                                    <option value="">Все менеджеры</option>
                                    {technicians.map((tech) => (
                                        <option key={tech.id} value={tech.id}>
                                            {`${tech.id}: ${tech.fullName}`}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        {filterGroups[activeTab].includes("sender_id") && (
                            <>
                                <label>ID отправителя</label>
                                <input type="text" name="sender_id" value={filters.sender_id || ""} onChange={handleInputChange} />
                            </>
                        )}

                        {filterGroups[activeTab].includes("tags") && (
                            <>
                                <label>Теги</label>
                                <input type="text" name="tags" value={filters.tags || ""} onChange={handleInputChange} />
                            </>
                        )}

                        {filterGroups[activeTab].includes("platform") && (
                            <>
                                <label>Платформа</label>
                                <select name="platform" value={filters.platform || ""} onChange={handleInputChange}>
                                    <option value="">Все платформы</option>
                                    {platformOptions.map((platform) => (
                                        <option key={platform} value={platform}>
                                            {platform}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        <div className="modal-buttons">
                            <button onClick={handleApplyFilter} className="apply-btn">
                                Применить
                            </button>
                            <button onClick={handleResetFilters} className="reset-btn">
                                Сбросить
                            </button>
                            <button onClick={onClose} className="cancel-btn">
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketFilterModal;