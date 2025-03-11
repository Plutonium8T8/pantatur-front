import React, { useState, useEffect } from "react";
import { useAppContext } from "../../AppContext";
import "./chat.css";
import ChatExtraInfo from "./ChatExtraInfo";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";
import { useUser } from "../../UserContext";

const SingleChat = ({ ticketId, onClose }) => {
    const { tickets, updateTicket, setTickets, messages, markMessagesAsRead, getClientMessagesSingle } = useAppContext();
    const { userId } = useUser();
    const [selectTicketId, setSelectTicketId] = useState(ticketId ? Number(ticketId) : null);
    const [personalInfo, setPersonalInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedClient, setSelectedClient] = useState("");
    const [isChatListVisible, setIsChatListVisible] = useState(false);

    useEffect(() => {
        if (ticketId && Number(ticketId) !== selectTicketId) {
            setSelectTicketId(Number(ticketId));
        }
    }, [ticketId]);

    useEffect(() => {
        if (selectTicketId) {
            console.log(`📡 Загружаем сообщения для тикета ${selectTicketId}`);
            setIsLoading(true);
            getClientMessagesSingle(selectTicketId).finally(() => setIsLoading(false));
        }
    }, [selectTicketId]);

    useEffect(() => {
        if (!selectTicketId || !messages.length) return;

        const unreadMessages = messages.filter(
            (msg) =>
                msg.ticket_id === selectTicketId &&
                msg.seen_by === "{}" &&
                msg.sender_id !== userId
        );

        if (unreadMessages.length > 0) {
            markMessagesAsRead(selectTicketId);
        }
    }, [selectTicketId, messages, userId]);

    const handleSelectTicket = (ticketId) => {
        if (selectTicketId !== ticketId) {
            setSelectTicketId(ticketId);
            console.log(`📡 Запрос сообщений для тикета ${ticketId}`);
            setIsLoading(true);
            getClientMessagesSingle(ticketId).finally(() => setIsLoading(false));
        }
    };

    const updatedTicket = tickets.find((ticket) => ticket.id === selectTicketId) || null;

    return (
        <div className={`chat-container ${isChatListVisible ? "" : "chat-hidden"}`}>
            <button className="chat-close-button" onClick={onClose}>
                <FaTimes />
            </button>

            {isChatListVisible && (
                <ChatList setIsLoading={setIsLoading} selectTicketId={selectTicketId} setSelectTicketId={handleSelectTicket} />
            )}

            <ChatMessages
                selectTicketId={selectTicketId}
                setSelectedClient={setSelectedClient}
                selectedClient={selectedClient}
                isLoading={isLoading}
                personalInfo={personalInfo}
                setPersonalInfo={setPersonalInfo}
            />

            <ChatExtraInfo
                selectedClient={selectedClient}
                ticketId={ticketId}
                selectTicketId={selectTicketId}
                setSelectTicketId={handleSelectTicket}
                tickets={tickets}
                updatedTicket={updatedTicket}
                updateTicket={updateTicket}
                setTickets={setTickets}
                personalInfo={personalInfo}
                setPersonalInfo={setPersonalInfo}
                messages={messages}
                isLoading={isLoading}
            />
        </div>
    );
};

export default SingleChat;