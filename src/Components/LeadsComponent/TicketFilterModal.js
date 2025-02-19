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
        const { workflow, platform, tags, ...formattedFilters } = filters;

        // ✅ Преобразуем `tags` в строку (если массив) перед отправкой
        if (Array.isArray(tags) && tags.length > 0) {
            formattedFilters.tags = tags.join(","); // Преобразуем массив в строку с запятыми
        }

        // ✅ Преобразуем `tags` в формат {Grecia}
        if (Array.isArray(tags) && tags.length > 0) {
            formattedFilters.tags = `{${tags.join(",")}}`;
        } else {
            delete formattedFilters.tags; // ❗ Если пусто, не отправляем `tags`
        }

        const hasValidFilters = Object.values(formattedFilters).some(value =>
            Array.isArray(value) ? value.length > 0 : value
        );

        if (!hasValidFilters) {
            console.warn("⚠️ Фильтры пустые, запрос не отправляется.");
            return;
        }

        console.log("🚀 Отправляем данные в API:", formattedFilters);

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

            let ticketData = await response.json();
            const ticketIds = ticketData.flat().map(ticket => ticket.id);

            console.log("✅ Отфильтрованные ID тикетов:", ticketIds);
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

        // ✅ Добавляем/удаляем класс 'filled-field'
        const field = document.querySelector(`[name="${name}"]`);
        if (field) {
            if (value && value.length > 0) {
                field.classList.add("filled-field");
            } else {
                field.classList.remove("filled-field");
            }
        }
    };

    const handleMultiSelectChange = (name, selectedValues) => {
        setFilters((prev) => ({
            ...prev,
            [name]: selectedValues,
        }));

        // ✅ Добавляем/удаляем класс 'filled-field' для мультиселектов
        const field = document.querySelector(`[name="${name}"]`);
        if (field) {
            if (selectedValues.length > 0) {
                field.classList.add("filled-field");
            } else {
                field.classList.remove("filled-field");
            }
        }
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
                                <div className="container-extra-group">

                                    <label>Data creare Lead</label>
                                    <input
                                        type="date"
                                        name="creation_date"
                                        value={filters.creation_date || ""}
                                        onChange={handleInputChange}
                                        className={filters.numar_de_contract ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />
                                    <label>Data ultima actualizare Lead</label>
                                    <input
                                        type="date"
                                        name="last_interaction_date"
                                        value={filters.last_interaction_date || ""}
                                        onChange={handleInputChange}
                                        className={filters.last_interaction_date ? "filled-field" : ""} // ✅ Если заполнено, выделяем
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
                                        value={filters.tags.length > 0 ? filters.tags.join(", ") : ""} // ✅ Проверяем, пуст ли массив
                                        onChange={handleInputChange}
                                        placeholder="Introdu tag-uri separate prin virgule"
                                        className={filters.tags.length > 0 ? "filled-field" : ""} // ✅ Подсвечиваем только если есть значения
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
                                        className={filters.data_venit_in_oficiu ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>Data plecarii</label>
                                    <input
                                        type="datetime-local"
                                        name="data_plecarii"
                                        value={filters.data_plecarii || ""}
                                        onChange={handleInputChange}
                                        className={filters.data_plecarii ? "filled-field" : ""} // ✅ Если заполнено, выделяем

                                    />

                                    <label>Data intoarcerii</label>
                                    <input
                                        type="datetime-local"
                                        name="data_intoarcerii"
                                        value={filters.data_intoarcerii || ""}
                                        onChange={handleInputChange}
                                        className={filters.data_intoarcerii ? "filled-field" : ""} // ✅ Если заполнено, выделяем

                                    />

                                    <label>Vânzare €</label>
                                    <input
                                        type="number"
                                        name="buget"
                                        value={filters.buget || ""}
                                        onChange={handleInputChange}
                                        placeholder="Indicați suma în euro"
                                        className={filters.buget ? "filled-field" : ""} // ✅ Если заполнено, выделяем

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
                                        className={filters.data_cererii_de_retur ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />
                                </div>

                                <div className="container-extra-group">

                                    <h3>Contract</h3>

                                    <label>Nr de contract</label>
                                    <input
                                        type="text"
                                        name="numar_de_contract"
                                        value={filters.numar_de_contract || ""}
                                        onChange={handleInputChange}
                                        placeholder="numar_de_contract"
                                        className={filters.numar_de_contract ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>Data contractului</label>
                                    <input
                                        type="datetime-local"
                                        name="data_contractului"
                                        value={filters.data_contractului || ""}
                                        onChange={handleInputChange}
                                        className={filters.data_contractului ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <div className="toggle-container">
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
                                    </div>

                                    <div className="toggle-container">
                                        <label className="toggle-label">Contract semnat</label>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(filters.contract_semnat)} // ✅ Преобразуем значение в Boolean, чтобы избежать ошибок
                                                onChange={(e) =>
                                                    setFilters((prev) => ({ ...prev, contract_semnat: e.target.checked })) // ✅ Обновляем `filters`
                                                }
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>

                                    <label>Operator turistic</label>
                                    <input
                                        type="text"
                                        name="tour_operator"
                                        value={filters.tour_operator || ""}
                                        onChange={handleInputChange}
                                        placeholder="Operator turistic"
                                        className={filters.tour_operator ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>Nr cererii de la operator</label>
                                    <input
                                        type="text"
                                        name="numarul_cererii_de_la_operator"
                                        value={filters.numarul_cererii_de_la_operator || ""}
                                        onChange={handleInputChange}
                                        placeholder="Nr cererii de la operator"
                                        className={filters.numarul_cererii_de_la_operator ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <div className="toggle-container">
                                        <label className="toggle-label">Achitare efectuată</label>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(filters.achitare_efectuata)} // ✅ Преобразуем значение в Boolean, чтобы избежать ошибок
                                                onChange={(e) =>
                                                    setFilters((prev) => ({ ...prev, achitare_efectuata: e.target.checked })) // ✅ Обновляем `filters`
                                                }
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-container">
                                        <label className="toggle-label">Rezervare confirmată</label>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(filters.rezervare_confirmata)} // ✅ Преобразуем значение в Boolean, чтобы избежать ошибок
                                                onChange={(e) =>
                                                    setFilters((prev) => ({ ...prev, rezervare_confirmata: e.target.checked })) // ✅ Обновляем `filters`
                                                }
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-container">
                                        <label className="toggle-label">Contract arhivat</label>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(filters.contract_arhivat)} // ✅ Преобразуем значение в Boolean, чтобы избежать ошибок
                                                onChange={(e) =>
                                                    setFilters((prev) => ({ ...prev, contract_arhivat: e.target.checked })) // ✅ Обновляем `filters`
                                                }
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>

                                    <label>Plată primită</label>
                                    <CustomMultiSelect
                                        options={paymentStatusOptions}
                                        placeholder="Selectează statutul plății"
                                        onChange={(values) => handleMultiSelectChange("statutul_platii", values)}
                                        selectedValues={filters.statutul_platii}
                                    />

                                    <label>Avans euro €</label>
                                    <input
                                        type="number"
                                        name="avans_euro"
                                        value={filters.avans_euro || ""}
                                        onChange={handleInputChange}
                                        placeholder="avans_euro"
                                        className={filters.avans_euro ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>Data avansului</label>
                                    <input
                                        type="datetime-local"
                                        name="data_avansului"
                                        value={filters.data_avansului || ""}
                                        onChange={handleInputChange}
                                        className={filters.data_avansului ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>Data de plată integrală</label>
                                    <input
                                        type="datetime-local"
                                        name="data_de_plata_integrala"
                                        value={filters.data_de_plata_integrala || ""}
                                        onChange={handleInputChange}
                                        className={filters.data_de_plata_integrala ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>Preț NETTO €</label>
                                    <input
                                        type="number"
                                        name="pret_netto"
                                        value={filters.pret_netto || ""}
                                        onChange={handleInputChange}
                                        placeholder="pret_netto"
                                        className={filters.pret_netto ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>Achitat client</label>
                                    <input
                                        type="number"
                                        name="achitat_client"
                                        value={filters.achitat_client || ""}
                                        onChange={handleInputChange}
                                        placeholder="achitat_client"
                                        className={filters.achitat_client ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>Comision companie €</label>
                                    <input
                                        type="number"
                                        name="comission_companie"
                                        value={filters.comission_companie || ""}
                                        onChange={handleInputChange}
                                        placeholder="comission_companie"
                                        className={filters.comission_companie ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <div className="toggle-container">
                                        <label className="toggle-label">Control Admin</label>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(filters.control_admin)} // ✅ Преобразуем значение в Boolean, чтобы избежать ошибок
                                                onChange={(e) =>
                                                    setFilters((prev) => ({ ...prev, control_admin: e.target.checked })) // ✅ Обновляем `filters`
                                                }
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>

                                </div>
                                <div className="container-extra-group">

                                    <h3>Invoice</h3>

                                    <label>F/serviciu</label>
                                    <input
                                        type="text"
                                        name="f_serviciu"
                                        value={filters.f_serviciu || ""}
                                        onChange={handleInputChange}
                                        placeholder="f_serviciu"
                                        className={filters.f_serviciu ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>F/factura</label>
                                    <input
                                        type="text"
                                        name="f_factura"
                                        value={filters.f_factura || ""}
                                        onChange={handleInputChange}
                                        placeholder="f_factura"
                                        className={filters.f_factura ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>F/numarul</label>
                                    <input
                                        type="number"
                                        name="f_numarul"
                                        value={filters.f_numarul || ""}
                                        onChange={handleInputChange}
                                        placeholder="f_numarul"
                                        className={filters.f_numarul ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>F/pret</label>
                                    <input
                                        type="number"
                                        name="f_pret"
                                        value={filters.f_pret || ""}
                                        onChange={handleInputChange}
                                        placeholder="f_pret"
                                        className={filters.f_pret ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>F/suma</label>
                                    <input
                                        type="number"
                                        name="f_suma"
                                        value={filters.f_suma || ""}
                                        onChange={handleInputChange}
                                        placeholder="f_suma"
                                        className={filters.f_suma ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />

                                    <label>Valuta contului</label>
                                    <CustomMultiSelect
                                        options={valutaOptions}
                                        placeholder="Selectează valuta_contului"
                                        onChange={(values) => handleMultiSelectChange("valuta_contului", values)}
                                        selectedValues={filters.valuta_contului}
                                    />

                                    <label>Iban</label>
                                    <CustomMultiSelect
                                        options={ibanOptions}
                                        placeholder="Selectează iban"
                                        onChange={(values) => handleMultiSelectChange("iban", values)}
                                        selectedValues={filters.iban}
                                    />

                                </div>

                                <div className="container-extra-group">

                                    <h3>Control calitate</h3>

                                    <label>Motivul refuzului</label>
                                    <CustomMultiSelect
                                        options={motivulRefuzuluiOptions}
                                        placeholder="Motivul refuzului"
                                        onChange={(values) => handleMultiSelectChange("motivul_refuzului", values)}
                                        selectedValues={filters.motivul_refuzului}
                                    />
                                    <label>Evaluare odihnă</label>
                                    <CustomMultiSelect
                                        options={evaluareOdihnaOptions}
                                        placeholder="Evaluare odihnă"
                                        onChange={(values) => handleMultiSelectChange("evaluareOdihnaOptions", values)}
                                        selectedValues={filters.evaluareOdihnaOptions}
                                    />
                                    <label>Următoarea vacanță</label>
                                    <input
                                        type="text"
                                        name="urmatoarea_vacanta"
                                        value={filters.urmatoarea_vacanta || ""}
                                        onChange={handleInputChange}
                                        placeholder="urmatoarea_vacanta"
                                        className={filters.urmatoarea_vacanta ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />
                                    <label>Manager</label>
                                    <input
                                        type="text"
                                        name="manager"
                                        value={filters.manager || ""}
                                        onChange={handleInputChange}
                                        placeholder="Manager"
                                        className={filters.manager ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />
                                    <label>Vacanța</label>
                                    <input
                                        type="text"
                                        name="vacanta"
                                        value={filters.vacanta || ""}
                                        onChange={handleInputChange}
                                        placeholder="vacanta"
                                        className={filters.vacanta ? "filled-field" : ""} // ✅ Если заполнено, выделяем
                                    />
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
                                <h2>Filtru pentru mesaje (coming soon)</h2>
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