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

        console.log("Подготовка данных для отправки...");
        console.log("Technician ID:", employee.id);
        console.log("Permissions:", permissions);

        try {
            const token = Cookies.get("jwt");
            console.log("JWT Token:", token);

            const response = await fetch("https://pandatur-api.com/admin/users/roles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
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
                                        onChange={() => setDashboardRead(!dashboardRead)}
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
                                        onChange={() => setDashboardEdit(!dashboardEdit)}
                                        disabled
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
                                        onChange={() => setDashboardAdmin(!dashboardAdmin)}
                                        disabled
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
                                        onChange={() => setLeadRead(!leadRead)}
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
                                        onChange={() => setLeadEdit(!leadEdit)}
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
                                        onChange={() => setLeadAdmin(!leadAdmin)}
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
                                        onChange={() => setChatRead(!chatRead)}
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
                                        onChange={() => setChatEdit(!chatEdit)}
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
                                        onChange={() => setChatAdmin(!chatAdmin)}
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

                    <button
                        className="save-button"
                        onClick={async () => {
                            await saveAllPermissions(); // Сохранение всех изменений
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