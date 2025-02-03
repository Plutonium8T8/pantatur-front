import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./ModalWithToggles.css";
import { FaTrash } from "react-icons/fa";
import { translations } from "../utils/translations";

const UserGroupComponent = ({ onChange, userId, roles }) => {
    const language = localStorage.getItem("language") || "RO";
    const [userGroups, setUserGroups] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);


    console.log('User id', userId);
    /**
     * Fetch user groups from the API on mount
     */
    useEffect(() => {
        const fetchUserGroups = async () => {
            try {
                const token = Cookies.get("jwt");
                const response = await fetch("https://pandatur-api.com/user-groups", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch user groups: ${response.status}`);
                }

                const data = await response.json();
                setUserGroups(data); // Set user groups from API response
                setSuggestions(data.map(group => group.name)); // Store names for suggestions
            } catch (error) {
                console.error("Error fetching user groups:", error);
            }
        };

        fetchUserGroups();
    }, []);

    /**
     * Create and add a new user group with roles.
     */
    const addUserGroup = async (name) => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/user-groups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ name, roles }), // Default empty roles
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to create user group: ${response.status}. ${error.message}`);
            }

            const newUserGroup = await response.json();
            setUserGroups((prev) => [...prev, newUserGroup]); // Add new group to state
            setSuggestions([...suggestions, newUserGroup.name]);
            onChange(); // Notify parent component
        } catch (error) {
            console.error("Error adding user group:", error);
        }
    };

    /**
     * Apply the roles from the selected user group to the given user ID.
     */
    const applyUserGroupRoles = async (groupId, userId) => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch(`https://pandatur-api.com/user-groups/${groupId}/assign/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to apply roles: ${response.status}. ${error.message}`);
            }

            console.log(`Roles applied to user ${userId} from group ${groupId}`);
        } catch (error) {
            console.error("Error applying user group roles:", error);
        }
    };

    /**
     * Remove a user group from the API and UI.
     */
    const removeUserGroup = async (groupId) => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch(`https://pandatur-api.com/user-groups/${groupId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to remove user group: ${response.status}. ${error.message}`);
            }

            setUserGroups(userGroups.filter((group) => group.id !== groupId)); // Remove from UI
            onChange(userGroups.filter((group) => group.id !== groupId));
        } catch (error) {
            console.error("Error removing user group:", error);
        }
    };

    /**
     * Handle input field changes for user group search.
     */
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        const filtered = suggestions.filter((suggestion) =>
            suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(true);
    };

    const handleFocus = () => {
        setFilteredSuggestions(suggestions);
        setShowSuggestions(true);
    };

    const handleBlur = () => {
        setTimeout(() => setShowSuggestions(false), 200);
    };

    return (
        <div className="userGroup-input-container">
            <div className="userGroups-display">
                {userGroups.length === 0 && <div>{"Se incarca..."}</div>}
                {userGroups.map((userGroup) => (

                    <div key={userGroup.id} className="userGroup-item">
                        <button className="apply-userGroup-button" onClick={() => applyUserGroupRoles(userGroup.id, userId)}>
                            <div className="userGroup-text">{userGroup.name}</div>
                        </button>
                        <button className="remove-userGroup-button" onClick={() => removeUserGroup(userGroup.id)}>
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>
            <div className="input-group">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={"Introduce userGroup"}
                    className="userGroup-input"
                />
            </div>
            <div className="button-container">
                <button
                    onClick={() => {
                        if (inputValue.trim()) addUserGroup(inputValue);
                    }}
                    className="submit-button"
                >
                    {"Salvează userGroup"}
                </button>
            </div>
        </div>
    );
};

export default UserGroupComponent;
