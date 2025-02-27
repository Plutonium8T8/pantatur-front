import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./ModalWithToggles.css";
import { FaHandshake } from "react-icons/fa";
import ToggleComponent from "./ToggleComponent";
import UserGroupComponent from "./UserGroupComponent";

const ModalWithToggles = ({ employee, closeModal }) => {
    const [roles, setRoles] = useState([]);
        const [error, setError] = useState(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
            try {
                const token = Cookies.get("jwt");
                const response = await fetch(`https://pandatur-api.com/api/users/${employee.id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Origin: 'https://plutonium8t8.github.io',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setRoles(data.roles);
                } else {
                    console.error(`Ошибка: ${response.status} - ${response.statusText}`);
                }
            } catch (error) {
                console.error("Ошибка загрузки уведомлений:", error.message);
            }
        };

    const sendPermissionToServer = async (role) => {
        const token = Cookies.get("jwt");
        try {
            console.log(`Отправка: role=${role}`);

            const response = await fetch("https://pandatur-api.com/admin/user/roles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Origin: 'https://plutonium8t8.github.io',
                },
                body: JSON.stringify({
                    id: employee.id,
                    role,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            fetchRoles();
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
                    Origin: 'https://plutonium8t8.github.io',
                },
                body: JSON.stringify({
                    id: employee.id,
                    role,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            fetchRoles();
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
        <div className="modal-overlay" onClick={closeModal}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
               <ToggleComponent employee={employee}/>
            </div>
        </div>
    );
};

export default ModalWithToggles;