import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./ModalWithToggles.css";

const ModalWithToggles = ({ employee, closeModal }) => {
    const [roles, setRoles] = useState([]);

    const sendPermissionToServer = async (role) => {
        const token = Cookies.get("jwt");
        try {
            console.log(`Отправка: role=${role}`);

            const response = await fetch("https://pandatur-api.com/admin/user/roles", {
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

            console.log(`Разрешение "${role}" успешно добавлено.`);
        } catch (error) {
            console.error(`Ошибка при добавлении разрешения "${role}":`, error);
        }
    };

    const deletePermissionToServer = async (role) => {
        const token = Cookies.get("jwt");
        try {
            console.log(`Удаление: role=${role}`);

            const response = await fetch("https://pandatur-api.com/admin/user/roles", {
                method: "DELETE",
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

            console.log(`Разрешение "${role}" успешно удалено.`);
        } catch (error) {
            console.error(`Ошибка при удалении разрешения "${role}":`, error);
        }
    };

    const handleToggleChange = (permission, isActive) => {
        if (isActive) {
            deletePermissionToServer(permission);
        } else {
            sendPermissionToServer(permission);
        }
    };

    const isRoleActive = (role) => roles.includes(role);

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
                                        checked={isRoleActive("DASHBOARD_READ")}
                                        onChange={() => handleToggleChange("DASHBOARD_READ", isRoleActive("DASHBOARD_READ"))}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Dashboard - editare
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={isRoleActive("DASHBOARD_WRITE")}
                                        onChange={() => handleToggleChange("DASHBOARD_WRITE", isRoleActive("DASHBOARD_WRITE"))}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Dashboard - full acces
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={isRoleActive("DASHBOARD_ADMIN")}
                                        onChange={() => handleToggleChange("DASHBOARD_ADMIN", isRoleActive("DASHBOARD_ADMIN"))}
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
                                        checked={isRoleActive("LEAD_READ")}
                                        onChange={() => handleToggleChange("LEAD_READ", isRoleActive("LEAD_READ"))}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Lead - editare
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={isRoleActive("LEAD_WRITE")}
                                        onChange={() => handleToggleChange("LEAD_WRITE", isRoleActive("LEAD_WRITE"))}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Lead - full acces
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={isRoleActive("LEAD_ADMIN")}
                                        onChange={() => handleToggleChange("LEAD_ADMIN", isRoleActive("LEAD_ADMIN"))}
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
                                        checked={isRoleActive("CHAT_READ")}
                                        onChange={() => handleToggleChange("CHAT_READ", isRoleActive("CHAT_READ"))}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Chat - editare
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={isRoleActive("CHAT_WRITE")}
                                        onChange={() => handleToggleChange("CHAT_WRITE", isRoleActive("CHAT_WRITE"))}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                Chat - full acces
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={isRoleActive("CHAT_ADMIN")}
                                        onChange={() => handleToggleChange("CHAT_ADMIN", isRoleActive("CHAT_ADMIN"))}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="close-button-toggle" onClick={closeModal}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalWithToggles;