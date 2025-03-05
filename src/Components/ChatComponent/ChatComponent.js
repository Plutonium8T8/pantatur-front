import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import './chat.css';
import ChatExtraInfo from './ChatExtraInfo';
import ChatList from './ChatList';
import ChatMessages from './ChatMessages';

const ChatComponent = ({ language }) => {
    const { tickets, updateTicket, setTickets, messages, selectTicketId } = useAppContext();
    const [personalInfo, setPersonalInfo] = useState({});
    const { ticketId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedClient, setSelectedClient] = useState("");

    const updatedTicket = tickets.find(ticket => ticket.id === selectTicketId) || null;

    return (
        <div className="chat-container">
            <ChatList />
            <ChatMessages
                selectTicketId={selectTicketId}
                setSelectedClient={setSelectedClient}
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
                language={language}
            />
        </div>
    );
};

export default ChatComponent;