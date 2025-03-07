import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import './chat.css';
import ChatExtraInfo from './ChatExtraInfo';
import ChatList from './ChatList';
import ChatMessages from './ChatMessages';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useUser } from '../../UserContext';

const ChatComponent = () => {
    const { tickets, updateTicket, setTickets, messages, markMessagesAsRead, getClientMessagesSingle } = useAppContext();
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const { userId } = useUser();
    const [selectTicketId, setSelectTicketId] = useState(ticketId ? Number(ticketId) : null);
    const [personalInfo, setPersonalInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedClient, setSelectedClient] = useState("");
    const [isChatListVisible, setIsChatListVisible] = useState(true);

    useEffect(() => {
        if (ticketId && Number(ticketId) !== selectTicketId) {
            setSelectTicketId(Number(ticketId));
        }
    }, [ticketId]);

    useEffect(() => {
        if (!selectTicketId) return;

        console.log("📩 Загрузка сообщений для тикета:", selectTicketId);
        getClientMessagesSingle(selectTicketId);
        markMessagesAsRead(selectTicketId);
    }, [selectTicketId]);

    const handleSelectTicket = (ticketId) => {
        console.log("🎯 Клик по тикету:", ticketId);
        if (selectTicketId !== ticketId) {
            setSelectTicketId(ticketId);
            navigate(`/chat/${ticketId}`);
        }
    };

    const updatedTicket = tickets.find(ticket => ticket.id === selectTicketId) || null;

    return (
        <div className={`chat-container ${isChatListVisible ? "" : "chat-hidden"}`}>
            <button
                className="toggle-chat-list-button"
                onClick={() => setIsChatListVisible(prev => !prev)}
            >
                {isChatListVisible ? <FaArrowLeft /> : <FaArrowRight />}
            </button>

            {isChatListVisible && (
                <ChatList
                    setIsLoading={setIsLoading}
                    selectTicketId={selectTicketId}
                    setSelectTicketId={handleSelectTicket}
                />
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

export default ChatComponent;