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
import { templateOptions } from '../../FormOptions/MessageTemplate';
import { evaluareOdihnaOptions } from '../../FormOptions/EvaluareVacantaOptions';
import { valutaOptions } from '../../FormOptions/ValutaOptions';
import { ibanOptions } from '../../FormOptions/IbanOptions';
import Input from "../InputComponent/InputComponent";
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
        "Messages": ["platform", "sender_id"]
    };


    const filterDefaults = {
        creation_date: "",
        last_interaction_date: "",
        technician_id: [],
        sender_id: "",
        workflow: workflowOptions.filter(wf => wf !== "Realizat cu succes" && wf !== "Închis și nerealizat"),
        priority: [],
        tags: "",
        platform: [],
        sursa_lead: [],
        status_sunet_telefonic: [],
        promo: [],
        marketing: [],
        tipul_serviciului: [],
        tara: [],
        tip_de_transport: [],
        denumirea_excursiei_turului: [],
        procesarea_achizitionarii: [],
        data_venit_in_oficiu: "",
        data_plecarii: "",
        data_intoarcerii: "",
        data_cererii_de_retur: "",
        buget: "",
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
        console.log(`🔹 Выбраны ${name}:`, selectedValues);
        setFilters(prev => ({
            ...prev,
            [name]: selectedValues,
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFilters(prev => ({
            ...prev,
            [name]: name === "tags" ? value.split(",").map(tag => tag.trim().toLowerCase()) : value,
        }));
    };

    const handleApplyFilter = () => {
        console.log("🚀 Применяем фильтр с параметрами:", filters);
        onApplyFilter(filters);
        onClose();
    };

    const handleResetFilters = () => {
        console.log("♻️ Сброс фильтра до:", filterDefaults);
        setFilters(filterDefaults);
        onApplyFilter(filterDefaults);
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
                                <label>Workflow</label>
                                <CustomMultiSelect
                                    options={workflowOptions}
                                    placeholder="Выберите этапы"
                                    onChange={values => handleMultiSelectChange("workflow", values)}
                                    selectedValues={filters.workflow}
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
                                <label>Приоритет</label>
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
                                <label>Ответственный</label>
                                <CustomMultiSelect
                                    options={technicians}
                                    placeholder="Выберите ответственного"
                                    onChange={values => handleMultiSelectChange("technician_id", values)}
                                    selectedValues={filters.technician_id}
                                />
                            </>
                        )}

                        {filterGroups[activeTab].includes("sender_id") && (
                            <>
                                <label>ID отправителя</label>
                                <input
                                    type="text"
                                    name="sender_id"
                                    value={filters.sender_id || ""}
                                    onChange={handleInputChange}
                                />
                            </>
                        )}

                        {filterGroups[activeTab].includes("tags") && (
                            <>
                                <label>Теги</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={Array.isArray(filters.tags) ? filters.tags.join(", ") : ""}
                                    onChange={handleInputChange}
                                    placeholder="Введите теги через запятую"
                                />
                                <label>Surs Lead</label>
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

                                <label>Страна</label>
                                <CustomMultiSelect
                                    options={countryOptions}
                                    placeholder="Выберите страну"
                                    onChange={values => handleMultiSelectChange("tara", values)}
                                    selectedValues={filters.tara}
                                />

                                <label>Транспорт</label>
                                <CustomMultiSelect
                                    options={transportOptions}
                                    placeholder="Выберите транспорт"
                                    onChange={values => handleMultiSelectChange("tip_de_transport", values)}
                                    selectedValues={filters.tip_de_transport}
                                />

                                <label>Экскурсия</label>
                                <CustomMultiSelect
                                    options={nameExcursionOptions}
                                    placeholder="Выберите экскурсию"
                                    onChange={values => handleMultiSelectChange("denumirea_excursiei_turului", values)}
                                    selectedValues={filters.denumirea_excursiei_turului}
                                />

                                <label>Дата визита в офис</label>
                                <input
                                    type="datetime-local"
                                    name="data_venit_in_oficiu"
                                    value={filters.data_venit_in_oficiu || ""}
                                    onChange={handleInputChange}
                                />

                                <label>Дата отъезда</label>
                                <input
                                    type="datetime-local"
                                    name="data_plecarii"
                                    value={filters.data_plecarii || ""}
                                    onChange={handleInputChange}
                                />

                                <label>Дата возврата</label>
                                <input
                                    type="datetime-local"
                                    name="data_intoarcerii"
                                    value={filters.data_intoarcerii || ""}
                                    onChange={handleInputChange}
                                />
                                <label>Vânzare €</label>

                                <Input
                                    type="number"
                                    value={filters.buget || ""}
                                    onChange={handleInputChange}
                                    className={'input-field'}
                                    placeholder="Indicați suma în euro"
                                />

                                <label>tipul_serviciului</label>
                                <CustomMultiSelect
                                    options={serviceTypeOptions}
                                    placeholder="Alege serviciu"
                                    onChange={(values) => handleMultiSelectChange("tipul_serviciului", values)}
                                    selectedValues={filters.tipul_serviciului}
                                />

                                <label>procesarea_achizitionarii</label>
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
                                <label>Платформа</label>
                                <CustomMultiSelect
                                    options={platformOptions}
                                    placeholder="Выберите платформу"
                                    onChange={values => handleMultiSelectChange("platform", values)}
                                    selectedValues={filters.platform}
                                />
                            </>
                        )}

                        <div className="modal-buttons">
                            <button onClick={handleApplyFilter} className="apply-btn">Применить</button>
                            <button onClick={handleResetFilters} className="reset-btn">Сбросить</button>
                            <button onClick={onClose} className="cancel-btn">Закрыть</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketFilterModal;