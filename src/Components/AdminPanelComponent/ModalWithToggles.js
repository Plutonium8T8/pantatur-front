import React, { useState } from "react";
import Cookies from 'js-cookie';
import "./ModalWithToggles.css";

const ModalWithToggles = ({ employee, closeModal }) => {
    // Состояния для Dashboard
    const [dashboardRead, setDashboardRead] = useState(false);
    const [dashboardEdit, setDashboardEdit] = useState(false);
    const [dashboardAdmin, setDashboardAdmin] = useState(false);

    // Состояния для Lead
    const [leadRead, setLeadRead] = useState(false);
    const [leadEdit, setLeadEdit] = useState(false);
    const [leadAdmin, setLeadAdmin] = useState(false);

    // Состояния для Chat
    const [chatRead, setChatRead] = useState(false);
    const [chatEdit, setChatEdit] = useState(false);
    const [chatAdmin, setChatAdmin] = useState(false);

    // Функция для отправки данных на сервер
    const sendPermissionToServer = async (permission, value) => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/admin/users/roles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    technician_id: employee.id, // ID выбранного пользователя
                    permission, // Название разрешения
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            console.log(`Разрешение "${permission}" обновлено: ${value}`);
        } catch (error) {
            console.error("Ошибка при отправке разрешения на сервер:", error);
        }
    };

    // Функция для сохранения всех разрешений сразу
    const saveAllPermissions = async () => {
        const permissions = {
            dashboard_read: dashboardRead,
            dashboard_edit: dashboardEdit,
            dashboard_admin: dashboardAdmin,
            lead_read: leadRead,
            lead_edit: leadEdit,
            lead_admin: leadAdmin,
            chat_read: chatRead,
            chat_edit: chatEdit,
            chat_admin: chatAdmin,
        };

        try {
            const response = await fetch("https://pandatur-api.com/admin/users/roles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    technician_id: employee.id, // ID выбранного пользователя
                    permissions, // Все разрешения
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            console.log("Все разрешения успешно сохранены:", permissions);
        } catch (error) {
            console.error("Ошибка при сохранении всех разрешений на сервер:", error);
        }
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
                                        onChange={() => {
                                            const newValue = !dashboardRead;
                                            setDashboardRead(newValue);
                                            sendPermissionToServer("dashboard_read", newValue);
                                        }}
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
                                        onChange={() => {
                                            const newValue = !dashboardEdit;
                                            setDashboardEdit(newValue);
                                            sendPermissionToServer("dashboard_edit", newValue);
                                        }}
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
                                        onChange={() => {
                                            const newValue = !dashboardAdmin;
                                            setDashboardAdmin(newValue);
                                            sendPermissionToServer("dashboard_admin", newValue);
                                        }}
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
                                        onChange={() => {
                                            const newValue = !leadRead;
                                            setLeadRead(newValue);
                                            sendPermissionToServer("lead_read", newValue);
                                        }}
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
                                        onChange={() => {
                                            const newValue = !leadEdit;
                                            setLeadEdit(newValue);
                                            sendPermissionToServer("lead_edit", newValue);
                                        }}
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
                                        onChange={() => {
                                            const newValue = !leadAdmin;
                                            setLeadAdmin(newValue);
                                            sendPermissionToServer("lead_admin", newValue);
                                        }}
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
                                        onChange={() => {
                                            const newValue = !chatRead;
                                            setChatRead(newValue);
                                            sendPermissionToServer("chat_read", newValue);
                                        }}
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
                                        onChange={() => {
                                            const newValue = !chatEdit;
                                            setChatEdit(newValue);
                                            sendPermissionToServer("chat_edit", newValue);
                                        }}
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
                                        onChange={() => {
                                            const newValue = !chatAdmin;
                                            setChatAdmin(newValue);
                                            sendPermissionToServer("chat_admin", newValue);
                                        }}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="close-button" onClick={closeModal}>
                        Close
                    </button>

                    <button
                        className="save-button"
                        onClick={() => {
                            saveAllPermissions(); // Сохранение всех изменений
                            closeModal(); // Закрытие модального окна
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalWithToggles;