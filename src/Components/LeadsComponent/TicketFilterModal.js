import React, { useState, useEffect, useRef } from "react";
import { priorityOptions } from "../../FormOptions/PriorityOption";
import { workflowOptions } from "../../FormOptions/WorkFlowOption";
import { transportOptions } from '../../FormOptions/TransportOptions';
import { motivulRefuzuluiOptions } from '../../FormOptions/MotivulRefuzuluiOptions';
import { countryOptions } from '../../FormOptions/CountryOptions';
import { marketingOptions } from '../../FormOptions/MarketingOptions';
import { nameExcursionOptions } from '../../FormOptions/NameExcursionOptions';
import { paymentStatusOptions } from '../../FormOptions/PaymentStatusOptions';
import { purchaseProcessingOptions } from '../../FormOptions/PurchaseProcessingOptions';
import { serviceTypeOptions } from '../../FormOptions/ServiceTypeOptions';
import { sourceOfLeadOptions } from '../../FormOptions/SourceOfLeadOptions';
import { promoOptions } from '../../FormOptions/PromoOptions';
import { evaluareOdihnaOptions } from '../../FormOptions/EvaluareVacantaOptions';
import { valutaOptions } from '../../FormOptions/ValutaOptions';
import { ibanOptions } from '../../FormOptions/IbanOptions';
import CustomMultiSelect from "../MultipleSelect/MultipleSelect";
import Cookies from "js-cookie";
import "./Modal.css";

const platformOptions = ["telegram", "viber", "whatsapp", "facebook", "instagram", "sipuni"];

const TicketFilterModal = ({ isOpen, onClose, onApplyFilter }) => {
    const [technicians, setTechnicians] = useState([]);
    const modalRef = useRef(null);

    const filterGroups = {
        "General": ["workflow"],
        "Ticket": [
            "creation_date",
            "last_interaction_date",
            "priority",
            "technician_id",
            "tags",
            "tipul_serviciului",
            "tara",
            "tip_de_transport",
            "denumirea_excursiei_turului",
            "procesarea_achizitionarii",
            "data_venit_in_oficiu",
            "data_plecarii",
            "data_intoarcerii",
            "data_cererii_de_retur",
            "buget",
            "sursa_lead",
            "status_sunet_telefonic",
            "promo",
            "marketing"
        ],
        "Messages": ["platform"]
    };


    const filterDefaults = {
        workflow: workflowOptions.filter(wf => wf !== "Realizat cu succes" && wf !== "Închis și nerealizat"),
        tags: [],
    };

    const handleApplyFilter = async () => {
        const { workflow, tags, platform, ...formattedFilters } = filters;

        const hasValidFilters = Object.values(formattedFilters).some(value =>
            Array.isArray(value) ? value.length > 0 : value
        );

        if (!hasValidFilters) {
            console.warn("⚠️ Фильтры пустые, запрос не отправляется.");
            return;
        }

        console.log("🚀 Отправляем данные на API (без workflow, tags и platform):", formattedFilters);

        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/api/apply-filter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formattedFilters),
            });

            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            let ticketData = await response.json(); // Сервер возвращает массив массивов

            console.log("✅ Отфильтрованные тикеты (до обработки):", ticketData);

            // 🔄 Разворачиваем массив массивов в плоский массив ID
            const ticketIds = ticketData.flat().map(ticket => ticket.id);

            console.log("✅ Отфильтрованные ID тикетов (после обработки):", ticketIds);

            // ✅ Передаем ticketIds в `onApplyFilter`
            onApplyFilter(filters, ticketIds.length > 0 ? ticketIds : []);
            onClose();
        } catch (error) {
            console.error("❌ Ошибка при фильтрации:", error);
        }
    };

    const tabs = Object.keys(filterGroups);
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [filters, setFilters] = useState(filterDefaults);

    useEffect(() => {
        console.log("✅ Модальное окно открыто, текущие фильтры:", filters);
    }, [isOpen]);

    useEffect(() => {
        console.log("🔹 Фильтр workflow изменился:", filters.workflow);
    }, [filters.workflow]);

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
                const formattedTechnicians = data.map(item => `${item.id.id}: ${item.id.name} ${item.id.surname}`.trim());
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

    const handleMultiSelectChange = (name, selectedValues) => {
        setFilters((prev) => ({
            ...prev,
            [name]: selectedValues,
        }));
    };

    // Локальный фильтр теперь тоже передает `[]`, а не `null`
    const handleApplyLocalFilter = () => {
        console.log("🔹 Локальное применение фильтра:", filters.workflow);
        onApplyFilter(filters, []);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: name === "tags" ? value.split(",").map(tag => tag.trim()) : value,
        }));
    };

    const handleResetFilters = () => {
        console.log("♻️ Сброс фильтра до:", filterDefaults);

        const resetFilters = {
            ...filterDefaults,
            workflow: filterDefaults.workflow || [],
            priority: filterDefaults.priority || [],
            technician_id: filterDefaults.technician_id || [],
            tags: filterDefaults.tags || [],
            sursa_lead: filterDefaults.sursa_lead || [],
            promo: filterDefaults.promo || [],
            marketing: filterDefaults.marketing || [],
            tara: filterDefaults.tara || [],
            tip_de_transport: filterDefaults.tip_de_transport || [],
            denumirea_excursiei_turului: filterDefaults.denumirea_excursiei_turului || [],
            procesarea_achizitionarii: filterDefaults.procesarea_achizitionarii || [],
            tipul_serviciului: filterDefaults.tipul_serviciului || [],
            platform: filterDefaults.platform || [],
        };

        setFilters(resetFilters);
        onApplyFilter(resetFilters);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-filter">
            <div className="modal-content-filter" ref={modalRef}>
                <div className="filter-container">
                    <div className="tabs">
                        {tabs.map(tab => (
                            <div key={tab} className={`tab ${activeTab === tab ? "active" : ""}`} onClick={() => handleTabClick(tab)}>
                                {tab}
                            </div>
                        ))}
                    </div>

                    <div className="filters">
                        <h3>Фильтр</h3>

                        {filterGroups[activeTab].includes("workflow") && (
                            <>
                                <div className="workflow-multi-select">
                                    <label>Workflow</label>
                                    <CustomMultiSelect
                                        options={workflowOptions}
                                        placeholder="Выберите этапы"
                                        onChange={values => handleMultiSelectChange("workflow", values)}
                                        selectedValues={filters.workflow}
                                    />
                                </div>
                            </>
                        )}

                        {filterGroups[activeTab].includes("creation_date") && (
                            <>
                                <label>Data creare ticket</label>
                                <input type="date" name="creation_date" value={filters.creation_date || ""} onChange={handleInputChange} />
                            </>
                        )}

                        {filterGroups[activeTab].includes("last_interaction_date") && (
                            <>
                                <label>Data ultima actualizare ticket</label>
                                <input
                                    type="date"
                                    name="last_interaction_date"
                                    value={filters.last_interaction_date || ""}
                                    onChange={handleInputChange}
                                />
                            </>
                        )}

                        {filterGroups[activeTab].includes("priority") && (
                            <>
                                <label>Prioritate ticket</label>
                                <CustomMultiSelect
                                    options={priorityOptions}
                                    placeholder="Выберите приоритет"
                                    onChange={values => handleMultiSelectChange("priority", values)}
                                    selectedValues={filters.priority}
                                />
                            </>
                        )}

                        {filterGroups[activeTab].includes("technician_id") && (
                            <>
                                <label>Responsabil Ticket</label>
                                <CustomMultiSelect
                                    options={technicians}
                                    placeholder="Выберите ответственного"
                                    onChange={values => handleMultiSelectChange("technician_id", values)}
                                    selectedValues={filters.technician_id}
                                />
                            </>
                        )}

                        {filterGroups[activeTab].includes("tags") && (
                            <>
                                <label>Tag-uri</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={filters.tags.join(", ")} // ✅ Преобразуем массив обратно в строку
                                    onChange={handleInputChange}
                                    placeholder="Введите теги через запятую"
                                />
                                <label>Sursa Ticket</label>
                                <CustomMultiSelect
                                    options={sourceOfLeadOptions}
                                    placeholder="Выберите источник"
                                    onChange={values => handleMultiSelectChange("sursa_lead", values)}
                                    selectedValues={filters.sursa_lead}
                                />

                                <label>Promo</label>
                                <CustomMultiSelect
                                    options={promoOptions}
                                    placeholder="Выберите Promo"
                                    onChange={values => handleMultiSelectChange("promo", values)}
                                    selectedValues={filters.promo}
                                />

                                <label>Marketing</label>
                                <CustomMultiSelect
                                    options={marketingOptions}
                                    placeholder="Выберите маркетинг"
                                    onChange={values => handleMultiSelectChange("marketing", values)}
                                    selectedValues={filters.marketing}
                                />

                                <label>Tara</label>
                                <CustomMultiSelect
                                    options={countryOptions}
                                    placeholder="Выберите страну"
                                    onChange={values => handleMultiSelectChange("tara", values)}
                                    selectedValues={filters.tara}
                                />

                                <label>Transport</label>
                                <CustomMultiSelect
                                    options={transportOptions}
                                    placeholder="Выберите транспорт"
                                    onChange={values => handleMultiSelectChange("tip_de_transport", values)}
                                    selectedValues={filters.tip_de_transport}
                                />

                                <label>Nume excursie</label>
                                <CustomMultiSelect
                                    options={nameExcursionOptions}
                                    placeholder="Выберите экскурсию"
                                    onChange={values => handleMultiSelectChange("denumirea_excursiei_turului", values)}
                                    selectedValues={filters.denumirea_excursiei_turului}
                                />

                                <label>Data vizita in oficiu</label>
                                <input
                                    type="datetime-local"
                                    name="data_venit_in_oficiu"
                                    value={filters.data_venit_in_oficiu || ""}
                                    onChange={handleInputChange}
                                />

                                <label>Data plecarii</label>
                                <input
                                    type="datetime-local"
                                    name="data_plecarii"
                                    value={filters.data_plecarii || ""}
                                    onChange={handleInputChange}
                                />

                                <label>Data intoarcerii</label>
                                <input
                                    type="datetime-local"
                                    name="data_intoarcerii"
                                    value={filters.data_intoarcerii || ""}
                                    onChange={handleInputChange}
                                />

                                <label>Vânzare €</label>
                                <input
                                    type="number"
                                    name="buget"
                                    value={filters.buget || ""}
                                    onChange={handleInputChange}
                                    placeholder="Indicați suma în euro"
                                />

                                <label>Tipul serviciului</label>
                                <CustomMultiSelect
                                    options={serviceTypeOptions}
                                    placeholder="Alege serviciu"
                                    onChange={(values) => handleMultiSelectChange("tipul_serviciului", values)}
                                    selectedValues={filters.tipul_serviciului}
                                />

                                <label>Procesare achizitionarii</label>
                                <CustomMultiSelect
                                    options={purchaseProcessingOptions}
                                    placeholder="Alege achiziție"
                                    onChange={(values) => handleMultiSelectChange("procesarea_achizitionarii", values)}
                                    selectedValues={filters.procesarea_achizitionarii}
                                />

                                <label>Data cererii de retur</label>
                                <input
                                    type="datetime-local"
                                    name="data_cererii_de_retur"
                                    value={filters.data_cererii_de_retur || ""}
                                    onChange={handleInputChange}
                                />
                            </>
                        )}

                        {filterGroups[activeTab].includes("platform") && (
                            <>
                                <div className="workflow-multi-select">

                                    <label>Platforma mesaj</label>
                                    <CustomMultiSelect
                                        options={platformOptions}
                                        placeholder="Выберите платформу"
                                        onChange={values => handleMultiSelectChange("platform", values)}
                                        selectedValues={filters.platform}
                                    />
                                </div>
                            </>
                        )}

                        <div className="modal-buttons">
                            <button onClick={handleApplyLocalFilter} className="apply-btn">Aply local</button>
                            <button onClick={handleApplyFilter} className="apply-btn">Aply Api</button>
                            <button onClick={handleResetFilters} className="reset-btn">Reset</button>
                            <button onClick={onClose} className="cancel-btn">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketFilterModal;