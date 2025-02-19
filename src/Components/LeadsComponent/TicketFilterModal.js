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

const TicketFilterModal = ({ isOpen, onClose, onApplyFilter, filteredTicketIds }) => {
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
        // ✅ Оставляем `tags` в `formattedFilters`, чтобы они отправлялись в API
        const { workflow, platform, ...formattedFilters } = filters;

        // ✅ Преобразуем `tags` в строку (если массив) перед отправкой
        if (filters.tags && Array.isArray(filters.tags)) {
            formattedFilters.tags = filters.tags.join(","); // Преобразуем массив в строку с запятыми
        }

        const hasValidFilters = Object.values(formattedFilters).some(value =>
            Array.isArray(value) ? value.length > 0 : value
        );

        if (!hasValidFilters) {
            console.warn("⚠️ Фильтры пустые, запрос не отправляется.");
            return;
        }

        console.log("🚀 Отправляем данные на API:", formattedFilters);

        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/api/apply-filter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formattedFilters), // ✅ Теперь отправляем `tags`
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

    const handleApplyLocalFilter = () => {
        console.log("🔹 Локальное применение фильтра:", filters.workflow);
        onApplyFilter(filters, filteredTicketIds);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: name === "tags" ? value.split(",").map(tag => tag.trim()) : value, // ✅ Преобразуем строку в массив
        }));
    };

    const handleResetFilters = () => {
        console.log("♻️ Сброс фильтров до значений по умолчанию");

        const resetFilters = {
            ...filterDefaults,
            workflow: filterDefaults.workflow || [],
        };

        setFilters(resetFilters);

        // ❗ Теперь `filteredTicketIds = null`, чтобы показать ВСЕ тикеты
        onApplyFilter(resetFilters, null);
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
                        {/* <h3>Filtru</h3> */}

                        {filterGroups[activeTab].includes("workflow") && (
                            <>
                                <h2>Filtru de sistem</h2>
                                <div className="workflow-multi-select">
                                    <label>Workflow</label>
                                    <CustomMultiSelect
                                        options={workflowOptions}
                                        placeholder="Alege workflow pentru afisare in sistem"
                                        onChange={values => handleMultiSelectChange("workflow", values)}
                                        selectedValues={filters.workflow}
                                    />
                                </div>
                                <div className="modal-buttons">
                                    <button onClick={handleApplyLocalFilter} className="apply-btn">Aplica filtru</button>
                                    <button onClick={handleResetFilters} className="reset-btn">Reset filter</button>
                                    <button onClick={onClose} className="cancel-btn">Close</button>
                                </div>
                            </>
                        )}

                        {filterGroups[activeTab].includes("tags") && (
                            <>
                                <h2>Filtru pentru tickete</h2>
                                <div className="container-extra-form">

                                    <label>Data creare Lead</label>
                                    <input
                                        type="date"
                                        name="creation_date"
                                        value={filters.creation_date || ""}
                                        onChange={handleInputChange}
                                    />
                                    <label>Data ultima actualizare Lead</label>
                                    <input
                                        type="date"
                                        name="last_interaction_date"
                                        value={filters.last_interaction_date || ""}
                                        onChange={handleInputChange}
                                    />
                                    <label>Prioritate Lead</label>
                                    <CustomMultiSelect
                                        options={priorityOptions}
                                        placeholder="Alege prioritatea"
                                        onChange={values => handleMultiSelectChange("priority", values)}
                                        selectedValues={filters.priority}
                                    />
                                    <label>Responsabil Lead</label>
                                    <CustomMultiSelect
                                        options={technicians}
                                        placeholder="Alege responsabil lead"
                                        onChange={values => handleMultiSelectChange("technician_id", values)}
                                        selectedValues={filters.technician_id}
                                    />

                                    <label>Tag-uri</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={filters.tags.join(", ")} // ✅ Преобразуем массив обратно в строку
                                        onChange={handleInputChange}
                                        placeholder="Introdu tag-uri separate prin virgule"
                                    />
                                    <label>Sursa Lead</label>
                                    <CustomMultiSelect
                                        options={sourceOfLeadOptions}
                                        placeholder="Alege sursa lead"
                                        onChange={values => handleMultiSelectChange("sursa_lead", values)}
                                        selectedValues={filters.sursa_lead}
                                    />

                                    <label>Promo</label>
                                    <CustomMultiSelect
                                        options={promoOptions}
                                        placeholder="Alege promo"
                                        onChange={values => handleMultiSelectChange("promo", values)}
                                        selectedValues={filters.promo}
                                    />

                                    <label>Marketing</label>
                                    <CustomMultiSelect
                                        options={marketingOptions}
                                        placeholder="Alege marketing"
                                        onChange={values => handleMultiSelectChange("marketing", values)}
                                        selectedValues={filters.marketing}
                                    />

                                    <label>Tara</label>
                                    <CustomMultiSelect
                                        options={countryOptions}
                                        placeholder="Alege tara"
                                        onChange={values => handleMultiSelectChange("tara", values)}
                                        selectedValues={filters.tara}
                                    />

                                    <label>Transport</label>
                                    <CustomMultiSelect
                                        options={transportOptions}
                                        placeholder="Alege transport"
                                        onChange={values => handleMultiSelectChange("tip_de_transport", values)}
                                        selectedValues={filters.tip_de_transport}
                                    />

                                    <label>Nume excursie</label>
                                    <CustomMultiSelect
                                        options={nameExcursionOptions}
                                        placeholder="Alege excursie"
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
                                </div>

                                <div className="container-extra-contract">

                                    <h3>Contract</h3>

                                    <label>Nr de contract</label>
                                    <input
                                        type="text"
                                        name="numar_de_contract"
                                        value={filters.numar_de_contract || ""}
                                        onChange={handleInputChange}
                                        placeholder="numar_de_contract"
                                    />

                                    <label>Data contractului</label>
                                    <input
                                        type="datetime-local"
                                        name="data_contractului"
                                        value={filters.data_contractului || ""}
                                        onChange={handleInputChange}
                                    />

                                    {/* <div className="toggle-container">
                                        <label className="toggle-label">Contract trimis</label>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(filters.contract_trimis)} // ✅ Преобразуем значение в Boolean, чтобы избежать ошибок
                                                onChange={(e) =>
                                                    setFilters((prev) => ({ ...prev, contract_trimis: e.target.checked })) // ✅ Обновляем `filters`
                                                }
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div> */}

                                </div>

                                <div className="modal-buttons">
                                    <button onClick={handleApplyFilter} className="apply-btn">Aplica filtru</button>
                                    <button onClick={handleResetFilters} className="reset-btn">Reset filtru</button>
                                    <button onClick={onClose} className="cancel-btn">Close</button>
                                </div>

                            </>
                        )}

                        {filterGroups[activeTab].includes("platform") && (
                            <>
                                <h2>Filtru pentru mesaj (coming soon)</h2>
                                <div className="workflow-multi-select">
                                    <label>Platforma mesaj</label>
                                    <CustomMultiSelect
                                        options={platformOptions}
                                        placeholder="Alege platforma mesaj"
                                        onChange={values => handleMultiSelectChange("platform", values)}
                                        selectedValues={filters.platform}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketFilterModal;