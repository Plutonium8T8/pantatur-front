import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./ModalWithToggles.css";

const ModalWithToggles = ({ employee, closeModal }) => {
    const [dashboardRead, setDashboardRead] = useState(false);
    const [dashboardEdit, setDashboardEdit] = useState(false);
    const [dashboardAdmin, setDashboardAdmin] = useState(false);

    const [leadRead, setLeadRead] = useState(false);
    const [leadEdit, setLeadEdit] = useState(false);
    const [leadAdmin, setLeadAdmin] = useState(false);

    const [chatRead, setChatRead] = useState(false);
    const [chatEdit, setChatEdit] = useState(false);
    const [chatAdmin, setChatAdmin] = useState(false);

    const getSession = async () => {
        const token = Cookies.get("jwt");
        try {
            const response = await fetch('https://pandatur-api.com/session', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            const sessionData = await response.json();
            console.log("Сессия успешно получена:", sessionData);

            // Проверяем, совпадает ли ID из сессии с ID сотрудника
            if (sessionData.user_id === employee.id) {
                const roles = sessionData.roles || [];
                setDashboardRead(roles.includes("DASHBOARD_READ"));
                setDashboardEdit(roles.includes("DASHBOARD_WRITE"));
                setDashboardAdmin(roles.includes("DASHBOARD_ADMIN"));

                setLeadRead(roles.includes("LEAD_READ"));
                setLeadEdit(roles.includes("LEAD_WRITE"));
                setLeadAdmin(roles.includes("LEAD_ADMIN"));

                setChatRead(roles.includes("CHAT_READ"));
                setChatEdit(roles.includes("CHAT_WRITE"));
                setChatAdmin(roles.includes("CHAT_ADMIN"));
            } else {
                console.log(`ID из сессии (${sessionData.user_id}) не совпадает с ID сотрудника (${employee.id}).`);
            }
        } catch (error) {
            console.error("Ошибка при получении сессии:", error);
        }
    };

    useEffect(() => {
        getSession();
    }, []);

    const sendPermissionToServer = async (role) => {
        try {
            const token = Cookies.get("jwt");
            console.log(`Отправка: role=${role}`);

            const response = await fetch("https://pandatur-api.com/admin/users/roles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: employee.id,
                    role,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            console.log(`Разрешение "${role}" успешно обновлено.`);
        } catch (error) {
            console.error(`Ошибка при обновлении разрешения "${role}":`, error);
        }
    };

    const handleToggleChange = (setter, permission) => {
        const newValue = !setter(false);
        setter(newValue);
        sendPermissionToServer(permission);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content-toggle">
                <div className="modal-header">
                    <h3>Permesiuni angajat</h3>
                    <button className="close-button" onClick={closeModal}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <p>
                        {employee.name} ({employee.id})
                    </p>
                    <div className="toggles-group-container">
                        {/* Dashboard */}
                        <div className="toggles-group">
                            <div className="toggle-item">
                                Dashboard - citire
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={dashboardRead}
                                        onChange={() => handleToggleChange(setDashboardRead, "DASHBOARD_READ")}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Dashboard - editare
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={dashboardEdit}
                                        onChange={() => handleToggleChange(setDashboardEdit, "DASHBOARD_WRITE")}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Dashboard - full acces
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={dashboardAdmin}
                                        onChange={() => handleToggleChange(setDashboardAdmin, "DASHBOARD_ADMIN")}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        {/* Lead */}
                        <div className="toggles-group">
                            <div className="toggle-item">
                                Lead - citire
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={leadRead}
                                        onChange={() => handleToggleChange(setLeadRead, "LEAD_READ")}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Lead - editare
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={leadEdit}
                                        onChange={() => handleToggleChange(setLeadEdit, "LEAD_WRITE")}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Lead - full acces
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={leadAdmin}
                                        onChange={() => handleToggleChange(setLeadAdmin, "LEAD_ADMIN")}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        {/* Chat */}
                        <div className="toggles-group">
                            <div className="toggle-item">
                                Chat - citire
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={chatRead}
                                        onChange={() => handleToggleChange(setChatRead, "CHAT_READ")}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Chat - editare
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={chatEdit}
                                        onChange={() => handleToggleChange(setChatEdit, "CHAT_WRITE")}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Chat - full acces
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={chatAdmin}
                                        onChange={() => handleToggleChange(setChatAdmin, "CHAT_ADMIN")}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="close-button-toggle" onClick={closeModal}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalWithToggles;