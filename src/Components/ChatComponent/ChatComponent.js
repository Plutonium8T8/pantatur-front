import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import './chat.css';
import ChatExtraInfo from './ChatExtraInfo';
import ChatList from './ChatList';
import ChatMessages from './ChatMessages';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const ChatComponent = () => {
    const { tickets, updateTicket, setTickets, messages, selectTicketId } = useAppContext();
    const [personalInfo, setPersonalInfo] = useState({});
    const { ticketId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedClient, setSelectedClient] = useState("");
    const [isChatListVisible, setIsChatListVisible] = useState(true);

    const updatedTicket = tickets.find(ticket => ticket.id === selectTicketId) || null;

    return (
        <div className="chat-container">
            <button
                className="toggle-chat-list-button"
                onClick={() => setIsChatListVisible(prev => !prev)}
            >
                {isChatListVisible ? <FaArrowLeft /> : <FaArrowRight />}
            </button>

            {isChatListVisible && <ChatList setIsLoading={setIsLoading} />}

            <ChatMessages
                selectTicketId={selectTicketId}
                setSelectedClient={setSelectedClient}
                isLoading={isLoading}
                personalInfo={personalInfo}
                setPersonalInfo={setPersonalInfo}
            />

            <ChatExtraInfo
                selectedClient={selectedClient}
                ticketId={ticketId}
                selectTicketId={selectTicketId}
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