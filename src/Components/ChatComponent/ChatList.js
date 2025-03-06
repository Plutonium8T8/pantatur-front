import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import { translations } from '../utils/translations';
import { useUser } from '../../UserContext';
import { Spin } from '../Spin';

const ChatList = ({ setIsLoading }) => {
    const {
        tickets,
        messages,
        markMessagesAsRead,
        selectTicketId,
        setSelectTicketId,
        getClientMessagesSingle,
        isLoading
    } = useAppContext();

    const { userId } = useUser();
    const [showMyTickets, setShowMyTickets] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTickets, setFilteredTickets] = useState(tickets);
    const [filteredTicketIds, setFilteredTicketIds] = useState(null);

    const navigate = useNavigate();
    const ticketRef = useRef(null);

    const language = localStorage.getItem('language') || 'RO';

    useEffect(() => {
        setFilteredTickets(tickets);
    }, [tickets]);

    useEffect(() => {
        if (showMyTickets) {
            setFilteredTickets(tickets.filter(ticket => ticket.technician_id === userId));
        } else {
            setFilteredTickets(tickets);
        }
    }, [tickets, showMyTickets]);

    useEffect(() => {
        if (!selectTicketId) return;

        setIsLoading(true);

        getClientMessagesSingle(selectTicketId)
            .finally(() => {
                setIsLoading(false);
            });
    }, [selectTicketId]);

    const handleCheckboxChange = (e) => {
        setShowMyTickets(e.target.checked);
    };

    const handleFilterInput = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const handleTicketClick = async (ticketId) => {
        if (selectTicketId === ticketId) return;

        setSelectTicketId(ticketId);
        navigate(`/chat/${ticketId}`);

        await markMessagesAsRead(ticketId);
    };

    const sortedTickets = useMemo(() => {
        let filtered = [...tickets];

        const parseCustomDate = (dateStr) => {
            if (!dateStr) return 0;

            const [datePart, timePart] = dateStr.split(" ");
            if (!datePart || !timePart) return 0;

            const [day, month, year] = datePart.split("-").map(Number);
            const [hours, minutes, seconds] = timePart.split(":").map(Number);

            return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
        };

        const getLastMessageTime = (ticket) => parseCustomDate(ticket.time_sent);

        filtered.sort((a, b) => getLastMessageTime(b) - getLastMessageTime(a));

        if (filteredTicketIds !== null && filteredTicketIds.length > 0) {
            filtered = filtered.filter(ticket => filteredTicketIds.includes(Number(ticket.id)));
        }

        if (showMyTickets) {
            filtered = filtered.filter(ticket => ticket.technician_id === userId);
        }

        if (searchQuery.trim()) {
            const lowerSearchQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(ticket => {
                const ticketId = ticket.id.toString().toLowerCase();
                const ticketContact = ticket.contact ? ticket.contact.toLowerCase() : "";
                const tags = ticket.tags ? ticket.tags.replace(/[{}]/g, "").split(",").map(tag => tag.trim().toLowerCase()) : [];

                return (
                    ticketId.includes(lowerSearchQuery) ||
                    ticketContact.includes(lowerSearchQuery) ||
                    tags.some(tag => tag.includes(lowerSearchQuery))
                );
            });
        }

        return filtered;
    }, [tickets, messages, filteredTicketIds, showMyTickets, searchQuery]);

    const formatDateTime = (dateString) => {
        if (!dateString) return "—";

        const parts = dateString.split(" ");
        if (parts.length !== 2) return "—";

        const [datePart, timePart] = parts;
        const [day, month, year] = datePart.split("-");

        if (!day || !month || !year) return "—";

        const formattedDate = new Date(`${year}-${month}-${day}T${timePart}`);

        return formattedDate.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
        }) || "—";
    };

    const parseTags = (tags) => {
        if (Array.isArray(tags)) return tags;
        if (typeof tags === "string") {
            if (tags.startsWith("{") && tags.endsWith("}")) {
                const content = tags.slice(1, -1).trim();
                return content ? content.split(",").map(tag => tag.trim()) : [];
            }
            try {
                return JSON.parse(tags);
            } catch (error) {
                console.error("Ошибка разбора JSON:", error, tags);
                return [];
            }
        }
        return [];
    };

    return (
        <div className="users-container">
            {isLoading ? (
                <div className="spinner-container">
                    <Spin />
                </div>
            ) : (
                <>
                    <div className="header-list-chat">
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div className="extra-info-title">{translations["Chat"][language]}</div>
                            <label className="label-check">
                                {translations["Leadurile mele"][language]}
                                <input
                                    type="checkbox"
                                    id="myTicketsCheckbox"
                                    onChange={handleCheckboxChange}
                                    checked={showMyTickets}
                                />
                            </label>
                        </div>

                        <div className="filter-container-chat">
                            <input
                                type="text"
                                placeholder={"Cauta dupa Lead, Client sau Tag"}
                                onInput={handleFilterInput}
                                className="ticket-filter-input"
                            />
                        </div>
                    </div>

                    <div className="chat-item-container">
                        {sortedTickets.map(ticket => {
                            const tags = parseTags(ticket.tags);

                            return (
                                <div
                                    key={ticket.id}
                                    className={`chat-item ${ticket.id === selectTicketId ? "active" : ""}`}
                                    onClick={() => handleTicketClick(ticket.id)}
                                    ref={ticket.id === selectTicketId ? ticketRef : null}
                                >
                                    <div className="foto-description">
                                        <img className="foto-user"
                                            src="https://storage.googleapis.com/pandatur_bucket/utils/icon-5359554_640.webp"
                                            alt="example" />
                                        <div className="tickets-descriptions">
                                            <div>{ticket.contact || "no contact"}</div>
                                            <div>{ticket.id ? `Lead: #${ticket.id}` : "no id"}</div>
                                            <div>{ticket.workflow || "no workflow"}</div>
                                            <div className="tags-ticket">
                                                {Array.isArray(tags) && tags.length > 0 ? (
                                                    tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            style={{
                                                                display: "inline-block",
                                                                backgroundColor: "#0f824c",
                                                                color: "#fff",
                                                                padding: "5px 10px",
                                                                borderRadius: "20px",
                                                                marginRight: "5px",
                                                                fontSize: "12px",
                                                            }}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    tags?.length === 0 ? null : <div>{translations["nici un tag"][language]}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="container-time-tasks-chat">
                                        <div className="info-message">
                                            <div className="last-message-container">
                                                <div className="last-message-ticket">
                                                    {ticket.last_message || "No messages"}
                                                </div>
                                                <div className="chat-time">{formatDateTime(ticket.time_sent)}</div>
                                                {ticket.unseen_count > 0 && (
                                                    <div className="unread-count">{ticket.unseen_count}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatList;