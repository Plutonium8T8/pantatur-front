import React, { useState, useEffect } from "react";
import Input from "../InputComponent/InputComponent";
import Select from "../SelectComponent/SelectComponent";
import ToggleSwitch from '../ToggleComponent/ToggleSwitch';
import ResponsabilLead from "../../FormOptions/ResponsabilLead";
import Workflow from "../WorkFlowComponent/WorkflowComponent";
import { useUser } from '../../UserContext';
import { enqueueSnackbar } from "notistack";
import { api } from "../../api";
import { evaluareOdihnaOptions } from '../../FormOptions/EvaluareVacantaOptions';
import { valutaOptions } from '../../FormOptions/ValutaOptions';
import { ibanOptions } from '../../FormOptions/IbanOptions';
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
import { translations } from "../utils/translations";

const ChatExtraInfo = ({
    selectTicketId,
    personalInfo = {},
    setPersonalInfo,
    messages = [],
    updatedTicket,
    updateTicket,
    isLoading,
    ticketId,
    selectedClient,
    setTickets,
    tickets,
}) => {
    const [activeTab, setActiveTab] = useState("extraForm");
    const { hasRole } = useUser();
    const [fieldErrors, setFieldErrors] = useState({});
    const [extraInfo, setExtraInfo] = useState({});
    const [selectedTechnicianId, setSelectedTechnicianId] = useState({});
    const isAdmin = hasRole("ROLE_ADMIN");
    const language = localStorage.getItem('language') || 'RO';

    useEffect(() => {
        if (selectTicketId) {
            fetchTicketExtraInfo(selectTicketId);
        }
    }, [selectTicketId]);

    const handleTechnicianChange = async (newTechnicianId) => {
        setSelectedTechnicianId(newTechnicianId);
        if (!selectTicketId || !newTechnicianId) {
            return;
        }
        try {
            await api.tickets.updateById(selectTicketId, { technician_id: newTechnicianId })
        } catch (error) {
        }
    };

    const fetchTicketExtraInfo = async (ticketId) => {
        try {
            const data = await api.tickets.ticket.getInfo(ticketId);
            setExtraInfo((prev) => ({
                ...prev,
                [ticketId]: data
            }));
        } catch (error) {
            enqueueSnackbar("Eroare de upload extra_info", { variant: "error" });
        }
    };

    const handleMergeTickets = async () => {
        const ticketOld = selectTicketId;
        const ticketNew = extraInfo[selectTicketId]?.ticket_id_new;

        if (!ticketOld || !ticketNew) {
            alert("Introduceți ambele ID-uri!");
            return;
        }

        try {
            await api.tickets.merge({
                ticket_old: ticketOld,
                ticket_new: ticketNew
            });
            enqueueSnackbar("Biletele au fost combinate cu succes!", { variant: 'success' });
        } catch (error) {
            console.error("Eroare:", error);
        }
    };

    const handleFieldChange = (field, value) => {
        setExtraInfo((prevState) => ({
            ...prevState,
            [selectTicketId]: {
                ...prevState[selectTicketId],
                [field]: value,
            },
        }));

        if (value) {
            setFieldErrors((prev) => ({ ...prev, [field]: false }));
        }
    };

    const handlePersonalDataSubmit = async (event) => {
        event.preventDefault();

        if (!updatedTicket?.client_id) {
            return;
        }

        const clientId = Number(updatedTicket.client_id.replace(/[{}]/g, "").trim());

        const payload = {
            name: personalInfo[clientId]?.name?.trim() || "",
            surname: personalInfo[clientId]?.surname?.trim() || "",
            date_of_birth: personalInfo[clientId]?.date_of_birth || "",
            id_card_series: personalInfo[clientId]?.id_card_series?.trim() || "",
            id_card_number: personalInfo[clientId]?.id_card_number?.trim() || "",
            id_card_release: personalInfo[clientId]?.id_card_release || "",
            idnp: personalInfo[clientId]?.idnp?.trim() || "",
            address: personalInfo[clientId]?.address?.trim() || "",
            phone: personalInfo[clientId]?.phone?.trim() || "",
        };

        try {
            const result = await api.users.updateExtended(clientId, payload);
            alert("Succes!");

            setPersonalInfo(prev => ({
                ...prev,
                [clientId]: result
            }));
        } catch (error) {
            alert("Eroare la salvare!");
        }
    };

    useEffect(() => {
        setExtraInfo({});
    }, [selectTicketId]);

    const workflowOptions = [
        "Interesat",
        "Apel de intrare",
        "De prelucrat",
        "Luat în lucru",
        "Ofertă trimisă",
        "Aprobat cu client",
        "Contract semnat",
        "Plată primită",
        "Contract încheiat",
        "Realizat cu succes",
        "Închis și nerealizat"
    ];

    const workflowIndices = workflowOptions.reduce((acc, workflow, index) => {
        acc[workflow] = index;
        return acc;
    }, {});

    const requiredFields = {
        "Luat în lucru": ["sursa_lead", "promo", "marketing"],
        "Ofertă trimisă": ["tipul_serviciului", "tara", "tip_de_transport", "denumirea_excursiei_turului"],
        "Aprobat cu client": ["procesarea_achizitionarii"],
        "Contract semnat": ["numar_de_contract", "data_contractului", "contract_trimis", "contract_semnat"],
        "Plată primită": ["achitare_efectuata"],
        "Contract încheiat": [
            "buget", "data_plecarii", "data_intoarcerii", "tour_operator",
            "numarul_cererii_de_la_operator", "rezervare_confirmata",
            "contract_arhivat", "statutul_platii", "pret_netto", "comission_companie"
        ],
        "Realizat cu succes": ["control_admin"]
    };

    const handleWorkflowChange = async (event) => {
        const newWorkflow = event.target.value;

        const workflowIndex = workflowIndices[newWorkflow];
        let newFieldErrors = {};

        for (const [step, fields] of Object.entries(requiredFields)) {
            if (workflowIndices[step] <= workflowIndex) {
                fields.forEach(field => {
                    if (!extraInfo[selectTicketId]?.[field]) {
                        newFieldErrors[field] = true;
                    }
                });
            }
        }

        if (newWorkflow === "Închis și nerealizat") {
            newFieldErrors = {};
            if (!extraInfo[selectTicketId]?.motivul_refuzului) {
                newFieldErrors.motivul_refuzului = true;
            }
        }

        setFieldErrors(newFieldErrors);

        if (Object.keys(newFieldErrors).length > 0) {
            enqueueSnackbar(`Completați toate câmpurile obligatorii pentru "${newWorkflow}" și etapele anterioare înainte de a face modificări!`, { variant: 'error' });
            return;
        }

        try {
            await updateTicket({ id: updatedTicket.id, workflow: newWorkflow });

            enqueueSnackbar('Statutul tichetului a fost actualizat!', { variant: 'success' });

            setTickets(prevTickets =>
                prevTickets.map(ticket =>
                    ticket.id === updatedTicket.id ? { ...ticket, workflow: newWorkflow } : ticket
                )
            );

            console.log("Workflow actualizat:", newWorkflow);
        } catch (error) {
            enqueueSnackbar('Eroare: Statutul tichetului nu a fost actualizat.', { variant: 'error' });
            console.error('Eroare la actualizarea workflow:', error.message);
        }
    };

    useEffect(() => {
        setFieldErrors({});
    }, [selectTicketId]);

    const getTabErrorIndicator = (tab) => {
        const tabFields = {
            extraForm: ["buget", "data_plecarii", "data_intoarcerii", "sursa_lead", "promo", "marketing"],
            Contract: ["numar_de_contract", "data_contractului", "contract_trimis", "contract_semnat", "tour_operator", "numarul_cererii_de_la_operator"],
            // Invoice: ["statutul_platii", "pret_netto", "comission_companie"],
            Media: [],
            "Control calitate": ["motivul_refuzului"]
        };

        return fieldErrors && tabFields[tab]?.some(field => fieldErrors[field]) ? "🔴" : "";
    };

    useEffect(() => {
        const pretNetto = extraInfo[selectTicketId]?.pret_netto;
        const buget = extraInfo[selectTicketId]?.buget;

        if (pretNetto !== "" && buget !== "" && pretNetto !== undefined && buget !== undefined) {
            const newComision = parseFloat(buget) - parseFloat(pretNetto);
            handleFieldChange("comission_companie", newComision.toFixed(2));
        }
    }, [extraInfo[selectTicketId]?.pret_netto, extraInfo[selectTicketId]?.buget, selectTicketId]);

    const handleSelectChangeExtra = (ticketId, field, value) => {
        setExtraInfo((prevState) => {
            const newState = {
                ...prevState,
                [ticketId]: {
                    ...prevState[ticketId],
                    [field]: value,
                },
            };
            return newState;
        });
    };

    const handleSelectChange = (clientId, field, value) => {
        setPersonalInfo(prev => ({
            ...prev,
            [clientId]: {
                ...prev[clientId],
                [field]: value
            }
        }));
    };

    const handleMergeClients = async () => {
        const oldUserId = selectedClient;
        const newUserId = extraInfo[selectedClient]?.new_user_id;

        if (!newUserId) {
            alert("Introduceți ID-ul nou al utilizatorului!");
            return;
        }

        try {
            await api.users.clientMerge({
                old_user_id: oldUserId,
                new_user_id: newUserId
            })

            enqueueSnackbar("Utilizatorii au fost combinați cu succes!", { variant: 'success' });

        } catch (error) {
            enqueueSnackbar("Eroare la combinarea utilizatorilor", { variant: 'error' });
        }
    };

    const sendExtraInfo = async () => {
        const ticketExtraInfo = extraInfo[selectTicketId];

        if (!ticketExtraInfo) {
            return;
        }

        const processedExtraInfo = Object.fromEntries(
            Object.entries(ticketExtraInfo).map(([key, value]) => [
                key, value === false ? "false" : value
            ])
        );

        try {
            const result = await api.tickets.ticket.create(selectTicketId, processedExtraInfo);

            enqueueSnackbar('Данные успешно обновлены', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Ошибка при обновлении дополнительной информации', { variant: 'error' });
        } finally {
        }
    };

    useEffect(() => {
        if (!selectedClient) return;

        const clientId = Number(selectedClient.replace(/[{}]/g, "").trim());

        const clientData = tickets
            .find(ticket => ticket.id === selectTicketId)?.clients
            ?.find(client => client.id === clientId) || {};

        if (clientData) {
            setPersonalInfo(prev => ({
                ...prev,
                [clientId]: {
                    name: clientData.name || "",
                    surname: clientData.surname || "",
                    address: clientData.address || "",
                    phone: clientData.phone || "",
                }
            }));
        }
    }, [selectedClient, selectTicketId, tickets, setPersonalInfo]);

    return (
        <div className="extra-info">
            {selectTicketId && (
                <div className="sticky-container">
                    <div className="tabs-container">
                        {["extraForm", "Contract", "Invoice", "Media", "Control calitate"].map((tab) => (
                            <button
                                key={tab}
                                className={`tab-button ${activeTab === tab ? "active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {[tab]?.[language] ?? tab} {getTabErrorIndicator(tab)}
                            </button>
                        ))}
                    </div>

                    <div className="tab-content-chat">
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <div className="input-group">
                                    <button onClick={sendExtraInfo} className="submit-button">
                                        {isLoading ? ["Încărcăm..."]?.[language] ?? "Загрузка..." : ["Actualizare"]?.[language] ?? "Actualizare"}
                                    </button>
                                </div>
                            </>
                        )}
                        <div>
                            <Workflow
                                ticket={updatedTicket}
                                workflow={updatedTicket?.workflow}
                                onChange={handleWorkflowChange}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="tab-content">
                {activeTab === 'extraForm' && selectTicketId && (
                    <div className="extra-info-content">
                        <div className="selects-container">

                            {isLoading ? (
                                <p>Loading...</p>
                            ) : (
                                <ResponsabilLead
                                    selectedTechnicianId={updatedTicket?.technician_id}
                                    onTechnicianChange={handleTechnicianChange}
                                />
                            )}
                            <Input
                                label="Vânzare €"
                                type="number"
                                value={extraInfo[selectTicketId]?.buget || ""}
                                onChange={(e) => handleFieldChange("buget", e.target.value)}
                                className={`input-field ${fieldErrors.buget ? "invalid-field" : ""}`}
                                placeholder="Indicați suma în euro"
                                id="buget-input"
                            />
                            <Input
                                label="Data venit in oficiu"
                                type="datetime-local"
                                value={extraInfo[selectTicketId]?.data_venit_in_oficiu || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'data_venit_in_oficiu', e.target.value)
                                }
                                className="input-field"
                            />
                            <Select
                                options={sourceOfLeadOptions}
                                label="Status sunet telefonic"
                                id="status_sunet_telefonic"
                                className="input-field"
                                value={extraInfo[selectTicketId]?.status_sunet_telefonic || ""}
                                onChange={(value) =>
                                    handleSelectChangeExtra(selectTicketId, 'status_sunet_telefonic', value)
                                }
                                disabled={true}
                            />
                            <Input
                                label="Data și ora plecării"
                                type="datetime-local"
                                value={extraInfo[selectTicketId]?.data_plecarii || ""}
                                onChange={(e) => handleFieldChange("data_plecarii", e.target.value)}
                                className={`input-field ${fieldErrors.data_plecarii ? "invalid-field" : ""}`}
                            />

                            <Input
                                label="Data și ora întoarcerii"
                                type="datetime-local"
                                value={extraInfo[selectTicketId]?.data_intoarcerii || ""}
                                onChange={(e) => handleFieldChange("data_intoarcerii", e.target.value)}
                                className={`input-field ${fieldErrors.data_intoarcerii ? "invalid-field" : ""}`}
                            />

                            <Select
                                options={sourceOfLeadOptions}
                                label="Sursă lead"
                                id="lead-source-select"
                                value={extraInfo[selectTicketId]?.sursa_lead || ""}
                                onChange={(value) => handleFieldChange("sursa_lead", value)}
                                hasError={fieldErrors.sursa_lead}
                            />

                            <Select
                                options={promoOptions}
                                label="Promo"
                                id="promo-select"
                                value={extraInfo[selectTicketId]?.promo || ""}
                                onChange={(value) => handleFieldChange("promo", value)}
                                hasError={fieldErrors.promo}
                            />

                            <Select
                                options={marketingOptions}
                                label="Marketing"
                                id="marketing-select"
                                value={extraInfo[selectTicketId]?.marketing || ""}
                                onChange={(value) => handleFieldChange("marketing", value)}
                                hasError={fieldErrors.marketing}
                            />

                            <Select
                                options={serviceTypeOptions}
                                label="Serviciu"
                                id="service-select"
                                value={extraInfo[selectTicketId]?.tipul_serviciului || ""}
                                onChange={(value) => handleFieldChange("tipul_serviciului", value)}
                                hasError={fieldErrors.tipul_serviciului}
                            />

                            <Select
                                options={countryOptions}
                                label="Țară"
                                id="country-select"
                                value={extraInfo[selectTicketId]?.tara || ""}
                                onChange={(value) => handleFieldChange("tara", value)}
                                hasError={fieldErrors.tara}
                            />

                            <Select
                                options={transportOptions}
                                label="Transport"
                                id="transport-select"
                                value={extraInfo[selectTicketId]?.tip_de_transport || ""}
                                onChange={(value) => handleFieldChange("tip_de_transport", value)}
                                hasError={fieldErrors.tip_de_transport}
                            />

                            <Select
                                options={nameExcursionOptions}
                                label="Excursie"
                                id="excursie-select"
                                value={extraInfo[selectTicketId]?.denumirea_excursiei_turului || ""}
                                onChange={(value) => handleFieldChange("denumirea_excursiei_turului", value)}
                                hasError={fieldErrors.denumirea_excursiei_turului}
                            />

                            <Select
                                options={purchaseProcessingOptions}
                                label="Achiziție"
                                id="purchase-select"
                                value={extraInfo[selectTicketId]?.procesarea_achizitionarii || ""}
                                onChange={(value) => handleFieldChange("procesarea_achizitionarii", value)}
                                hasError={fieldErrors.procesarea_achizitionarii}
                            />
                            <Input
                                label="Data cererii de retur"
                                type="datetime-local"
                                value={extraInfo[selectTicketId]?.data_cererii_de_retur || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'data_cererii_de_retur', e.target.value)
                                }
                                className="input-field"
                            />
                        </div>
                        <div className="merge-tickets">
                            <input
                                type="number"
                                value={ticketId}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'ticket_id_old', e.target.value)
                                }
                                className="input-field"
                                placeholder="Introduceți ID vechi"
                                disabled
                            />
                            <input
                                type="number"
                                value={extraInfo[selectTicketId]?.ticket_id_new || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'ticket_id_new', e.target.value)
                                }
                                className="input-field"
                                placeholder={translations?.["Introduceți ID lead"]?.[language]}
                            />
                            <button onClick={handleMergeTickets} className="submit-button">
                                {translations?.["Combina"][language]}
                            </button>
                        </div>

                        <div className="divider-line"></div>
                        <div className="personal-data-content">
                            <div className='extra-info-title'>{translations?.['Date personale']?.[language]}</div>
                            <form onSubmit={handlePersonalDataSubmit} className='personal-data-container'>
                                <Input
                                    label="Nume"
                                    type="text"
                                    value={personalInfo[selectedClient]?.name ?? ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedClient, 'name', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Nume"
                                />
                                <Input
                                    label="Prenume"
                                    type="text"
                                    value={personalInfo[selectedClient]?.surname ?? ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedClient, 'surname', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Prenume"
                                />
                                <Input
                                    label="Adresă"
                                    type="text"
                                    value={personalInfo[selectedClient]?.address ?? ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedClient, 'address', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Adresă"
                                />
                                <Input
                                    label="Telefon"
                                    type="tel"
                                    value={personalInfo[selectedClient]?.phone ?? ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedClient, 'phone', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Telefon"
                                />
                                <button type="submit" className="submit-button">
                                    {translations?.['Salvați datele personale']?.[language]}
                                </button>
                            </form>
                            <div className="merge-client">
                                <input
                                    type="number"
                                    value={selectedClient}
                                    className="input-field"
                                    placeholder="Introduceți ID vechi"
                                    disabled
                                />
                                <input
                                    type="number"
                                    value={extraInfo[selectedClient]?.new_user_id || ""}
                                    onChange={(e) =>
                                        handleSelectChangeExtra(selectedClient, 'new_user_id', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder={translations?.["Introduceți ID client"][language]}
                                />
                                <button onClick={handleMergeClients} className="submit-button">
                                    {translations?.["Combina"]?.[language]}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Contract' && selectTicketId && (
                    <div className="extra-info-content">
                        <Input
                            label="Nr de contract"
                            type="text"
                            value={extraInfo[selectTicketId]?.numar_de_contract || ""}
                            onChange={(e) => handleFieldChange("numar_de_contract", e.target.value)}
                            className={`input-field ${fieldErrors.numar_de_contract ? "invalid-field" : ""}`}
                            placeholder="Nr de contract"
                            id="contract-number-input"
                        />

                        <Input
                            label="Data contractului"
                            type="date"
                            value={extraInfo[selectTicketId]?.data_contractului || ""}
                            onChange={(e) => handleFieldChange("data_contractului", e.target.value)}
                            className={`input-field ${fieldErrors.data_contractului ? "invalid-field" : ""}`}
                        />

                        <ToggleSwitch
                            label={translations?.['Contract trimis']?.[language]}
                            checked={extraInfo[selectTicketId]?.contract_trimis || false}
                            onChange={(checked) => handleFieldChange("contract_trimis", checked)}
                            className={fieldErrors.contract_trimis ? "invalid-toggle" : ""}
                        />

                        <ToggleSwitch
                            label={translations?.['Contract semnat']?.[language]}
                            checked={extraInfo[selectTicketId]?.contract_semnat || false}
                            onChange={(checked) => handleFieldChange("contract_semnat", checked)}
                            className={fieldErrors.contract_semnat ? "invalid-toggle" : ""}
                        />

                        <Input
                            label="Operator turistic"
                            type="text"
                            value={extraInfo[selectTicketId]?.tour_operator || ""}
                            onChange={(e) => handleFieldChange("tour_operator", e.target.value)}
                            className={`input-field ${fieldErrors.tour_operator ? "invalid-field" : ""}`}
                            placeholder="Operator turistic"
                            id="tour-operator-input"
                        />

                        <Input
                            label="Nr cererii de la operator"
                            type="text"
                            value={extraInfo[selectTicketId]?.numarul_cererii_de_la_operator || ""}
                            onChange={(e) => handleFieldChange("numarul_cererii_de_la_operator", e.target.value)}
                            className={`input-field ${fieldErrors.numarul_cererii_de_la_operator ? "invalid-field" : ""}`}
                            placeholder="Nr cererii de la operator"
                            id="tour-operator-input"
                        />

                        <ToggleSwitch
                            label={translations?.['Achitare efectuată']?.[language]}
                            checked={extraInfo[selectTicketId]?.achitare_efectuata || false}
                            onChange={(checked) => handleFieldChange("achitare_efectuata", checked)}
                            className={fieldErrors.achitare_efectuata ? "invalid-toggle" : ""}
                        />

                        <ToggleSwitch
                            label={translations?.['Rezervare confirmată']?.[language]}
                            checked={extraInfo[selectTicketId]?.rezervare_confirmata || false}
                            onChange={(checked) => handleFieldChange("rezervare_confirmata", checked)}
                            className={fieldErrors.rezervare_confirmata ? "invalid-toggle" : ""}
                        />

                        <ToggleSwitch
                            label={translations?.["Contract arhivat"]?.[language]}
                            checked={extraInfo[selectTicketId]?.contract_arhivat || false}
                            onChange={(checked) => handleFieldChange("contract_arhivat", checked)}
                            className={fieldErrors.contract_arhivat ? "invalid-toggle" : ""}
                        />

                        <Select
                            options={paymentStatusOptions}
                            label="Plată primită"
                            id="payment-select"
                            value={extraInfo[selectTicketId]?.statutul_platii || ""}
                            onChange={(value) => handleFieldChange("statutul_platii", value)}
                            hasError={fieldErrors.statutul_platii}
                        />
                        <Input
                            label="Avans euro €"
                            value={extraInfo[selectTicketId]?.avans_euro || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'avans_euro', e.target.value)
                            }
                            className="input-field"
                            placeholder="Avans euro"
                            id="price-neto-input"
                        />
                        <Input
                            label="Data avansului"
                            type="date"
                            value={extraInfo[selectTicketId]?.data_avansului || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'data_avansului', e.target.value)
                            }
                            className="input-field"
                        />
                        <Input
                            label="Data de plată integrală"
                            type="date"
                            value={extraInfo[selectTicketId]?.data_de_plata_integrala || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'data_de_plata_integrala', e.target.value)
                            }
                            className="input-field"
                        />
                        <Input
                            label="Preț NETTO €"
                            value={extraInfo[selectTicketId]?.pret_netto || ""}
                            onChange={(e) => handleFieldChange("pret_netto", e.target.value)}
                            className={`input-field ${fieldErrors.pret_netto ? "invalid-field" : ""}`}
                            placeholder="Preț netto (euro)"
                            id="price-neto-input"
                        />
                        <Input
                            label="Achitat client"
                            value={extraInfo[selectTicketId]?.achitat_client || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'achitat_client', e.target.value)
                            }
                            className="input-field"
                            placeholder="Achitat client"
                            id="achitat-client"
                        />
                        <Input
                            label="Restanță client"
                            value={extraInfo[selectTicketId]?.restant_client || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'restant_client', e.target.value)
                            }
                            className="input-field"
                            placeholder="Restanță client"
                            id="price-neto-input"
                            disabled={true}
                        />
                        <Input
                            label="Comision companie €"
                            value={extraInfo[selectTicketId]?.comission_companie || ""}
                            onChange={(e) => handleFieldChange("comission_companie", e.target.value)}
                            className={`input-field ${fieldErrors.comission_companie ? "invalid-field" : ""}`}
                            placeholder="Comision companie"
                            id="commission-input"
                            disabled={true}
                        />
                        <Input
                            label="Statut achitare"
                            value={extraInfo[selectTicketId]?.restant_client || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'restant_client', e.target.value)
                            }
                            className="input-field"
                            placeholder="Statut achitare"
                            id="commission-input"
                            disabled={true}
                        />
                        {isAdmin && (
                            <ToggleSwitch
                                label="Control Admin"
                                checked={extraInfo[selectTicketId]?.control_admin || false}
                                onChange={(checked) => handleSelectChangeExtra(selectTicketId, 'control_admin', checked)}
                                className={fieldErrors.control_admin ? "invalid-toggle" : ""}
                            />
                        )}
                    </div>
                )}
                {activeTab === 'Invoice' && selectTicketId && (
                    <div className="extra-info-content">
                        <Input
                            label="F/service"
                            value={extraInfo[selectTicketId]?.f_serviciu || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'f_serviciu', e.target.value)
                            }
                            className="input-field"
                            placeholder="F/service"
                            id="f_serviciu"
                        />
                        <Input
                            label="F/factura"
                            value={extraInfo[selectTicketId]?.f_nr_factura || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'f_nr_factura', e.target.value)
                            }
                            className="input-field"
                            placeholder="F/factura"
                            id="f_nr_factura"
                        />
                        <Input
                            label="F/numarul"
                            value={extraInfo[selectTicketId]?.f_numarul || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'f_numarul', e.target.value)
                            }
                            className="input-field"
                            placeholder="F/numarul"
                            id="f_numarul"
                        />
                        <Input
                            label="F/preț"
                            value={extraInfo[selectTicketId]?.f_pret || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'f_pret', e.target.value)
                            }
                            className="input-field"
                            placeholder="F/preț"
                            id="f_pret"
                        />
                        <Input
                            label="F/sumă"
                            value={extraInfo[selectTicketId]?.f_suma || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'f_suma', e.target.value)
                            }
                            className="input-field"
                            placeholder="F/sumă"
                            id="f_suma"
                        />
                        <Select
                            options={valutaOptions}
                            label="Valuta contului"
                            id="payment-select"
                            value={extraInfo[selectTicketId]?.valuta_contului || ""}
                            onChange={(value) =>
                                handleSelectChangeExtra(selectTicketId, 'valuta_contului', value)
                            }
                        />
                        <Select
                            options={ibanOptions}
                            label="IBAN"
                            id="payment-select"
                            value={extraInfo[selectTicketId]?.iban || ""}
                            onChange={(value) =>
                                handleSelectChangeExtra(selectTicketId, 'iban', value)
                            }
                        />

                        {/* ToDo component list */}
                    </div>
                )}
                {activeTab === 'Media' && selectTicketId && (
                    <div className="extra-info-content">
                        {messages
                            .filter((msg) => ['audio', 'video', 'image', 'file'].includes(msg.mtype) && msg.ticket_id === selectTicketId)
                            .map((msg, index) => (
                                <div key={index} className="media-container">
                                    <div className="sent-time">
                                        {(() => {
                                            const parseCustomDate = (dateStr) => {
                                                if (!dateStr) return "—";
                                                const [datePart, timePart] = dateStr.split(" ");
                                                const [day, month, year] = datePart.split("-").map(Number);
                                                const [hours, minutes, seconds] = timePart.split(":").map(Number);
                                                return new Date(year, month - 1, day, hours, minutes, seconds);
                                            };
                                            return parseCustomDate(msg.time_sent).toLocaleString("ru-RU", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            });
                                        })()}
                                    </div>

                                    {msg.mtype === "image" ? (
                                        <img
                                            src={msg.message}
                                            alt="Изображение"
                                            className="image-preview-in-chat"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/300?text=Ошибка+загрузки";
                                            }}
                                            onClick={() => {
                                                window.open(msg.message, "_blank");
                                            }}
                                        />
                                    ) : msg.mtype === "video" ? (
                                        <video controls className="video-preview">
                                            <source src={msg.message} type="video/mp4" />
                                            {translations?.["Acest browser nu suporta video"]?.[language]}
                                        </video>
                                    ) : msg.mtype === "audio" ? (
                                        <audio controls className="audio-preview">
                                            <source src={msg.message} type="audio/ogg" />
                                            {translations?.["Acest browser nu suporta audio"]?.[language]}
                                        </audio>
                                    ) : msg.mtype === "file" ? (
                                        <a
                                            href={msg.message}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-link"
                                        >
                                            {translations?.["Deschide file"]?.[language] || "Открыть файл"}
                                        </a>
                                    ) : null}
                                </div>
                            ))}
                    </div>
                )}
                {activeTab === 'Control calitate' && selectTicketId && (
                    <div className="extra-info-content">
                        <Select
                            options={motivulRefuzuluiOptions}
                            label="Motivul refuzului"
                            id="motivul_refuzului"
                            value={extraInfo[selectTicketId]?.motivul_refuzului || ""}
                            onChange={(value) => handleFieldChange("motivul_refuzului", value)}
                            hasError={fieldErrors.motivul_refuzului}
                        />
                        <Select
                            options={evaluareOdihnaOptions}
                            label="Evaluare odihnă"
                            id="evaluare_de_odihna"
                            value={extraInfo[selectTicketId]?.evaluare_de_odihna || ""}
                            onChange={(value) =>
                                handleSelectChangeExtra(selectTicketId, 'evaluare_de_odihna', value)
                            }
                        />
                        <Input
                            label="Următoarea vacanță"
                            value={extraInfo[selectTicketId]?.urmatoarea_vacanta || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'urmatoarea_vacanta', e.target.value)
                            }
                            className="input-field"
                            placeholder="Următoarea vacanță"
                            id="urmatoarea_vacanta"
                        />
                        <Input
                            label="Manager"
                            value={extraInfo[selectTicketId]?.manager || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'manager', e.target.value)
                            }
                            className="input-field"
                            placeholder="Manager"
                            id="manager"
                        />
                        <Input
                            label="Vacanța"
                            value={extraInfo[selectTicketId]?.vacanta || ""}
                            onChange={(e) =>
                                handleSelectChangeExtra(selectTicketId, 'vacanta', e.target.value)
                            }
                            className="input-field"
                            placeholder="Vacanța"
                            id="vacanta"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatExtraInfo;