<div className={`users-container ${isChatListVisible ? "" : "hidden"}`}>
                {isChatListVisible && (
                    <>
                        <div className='header-list-chat'>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                <div className='extra-info-title'>{translations["Chat"][language]}</div>
                                <label style={{ marginLeft: "auto" }}>
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
                                    placeholder={translations["Cauta dupa Lead, Client sau Tag"][language]}
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
                                            <img className="foto-user" src="https://storage.googleapis.com/pandatur_bucket/utils/icon-5359554_640.webp" alt="example" />
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
                                                    <div className='chat-time'>{formatDateTime(ticket.time_sent)}</div>
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

                        {isLoading && (
                            <div className="spinner-overlay">
                                <div className="spinner"></div>
                            </div>
                        )}

                    </>
                )}
            </div>

            <button
                className="toggle-chat-list"
                onClick={() => setIsChatListVisible(prev => !prev)}
            >
                {isChatListVisible ? <FaArrowLeft /> : <FaArrowRight />}
            </button>

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

useEffect(() => {
    if (!selectTicketId || !messages.length) return;

    const unreadMessages = messages.filter(
        msg => msg.ticket_id === selectTicketId && msg.seen_by === '{}' && msg.sender_id !== userId
    );

    if (unreadMessages.length > 0) {
        console.log(`🔵 ${unreadMessages.length} непрочитанных сообщений в тикете #${selectTicketId}, помечаем как прочитанные`);
        markMessagesAsRead(selectTicketId);
    }
}, [messages, selectTicketId, markMessagesAsRead, userId]);

useEffect(() => {
    applyFilters(appliedFilters);
}, [messages]);

useEffect(() => {
    if (location.state?.hideChatList) {
        setIsChatListVisible(false);
        return;
    }

    const params = new URLSearchParams(location.search);
    const stateParam = params.get('state');

    if (stateParam) {
        try {
            const parsedState = JSON.parse(decodeURIComponent(stateParam));
            if (parsedState.hideChatList) {
                setIsChatListVisible(false);
            }
        } catch (error) {
            console.error("Ошибка парсинга state:", error);
        }
    }
}, [location]);

const sortedTickets = useMemo(() => {
    let filtered = [...tickets];


    const getLastMessageTime = (ticket) => {
        const ticketMessages = messages.filter(msg => msg.ticket_id === ticket.id);

        if (ticketMessages.length > 0) {
            return Math.max(...ticketMessages.map(msg => parseCustomDate(msg.time_sent)));
        }

        if (ticket.time_sent) return parseCustomDate(ticket.time_sent);
        if (ticket.last_interaction_date) return parseCustomDate(ticket.last_interaction_date);

        return 0;
    };

    const parseCustomDate = (dateStr) => {
        if (!dateStr) return 0;

        const [datePart, timePart] = dateStr.split(" ");
        const [day, month, year] = datePart.split("-").map(Number);
        const [hours, minutes, seconds] = timePart.split(":").map(Number);

        return new Date(year, month - 1, day, hours, minutes, seconds).getTime(); // timestamp
    };

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
            const tags = Array.isArray(ticket.tags)
                ? ticket.tags.map(tag => tag.toLowerCase())
                : ticket.tags.replace(/[{}]/g, "").split(",").map(tag => tag.trim().toLowerCase());

            return (
                ticketId.includes(lowerSearchQuery) ||
                ticketContact.includes(lowerSearchQuery) ||
                tags.some(tag => tag.includes(lowerSearchQuery))
            );
        });
    }

    if (Object.values(appliedFilters).some(value => value)) {
        if (appliedFilters.creation_date) {
            filtered = filtered.filter(ticket => ticket.creation_date.startsWith(appliedFilters.creation_date));
        }
        if (appliedFilters.last_interaction_date) {
            filtered = filtered.filter(ticket => ticket.last_interaction_date.startsWith(appliedFilters.last_interaction_date));
        }
        if (appliedFilters.technician_id) {
            filtered = filtered.filter(ticket => String(ticket.technician_id) === appliedFilters.technician_id);
        }
        if (appliedFilters.workflow) {
            filtered = filtered.filter(ticket => ticket.workflow === appliedFilters.workflow);
        }
        if (appliedFilters.priority) {
            filtered = filtered.filter(ticket => ticket.priority === appliedFilters.priority);
        }
        if (appliedFilters.tags) {
            filtered = filtered.filter(ticket => {
                if (!ticket.tags) return false;
                const ticketTags = ticket.tags.replace(/[{}]/g, "").split(",").map(tag => tag.trim());
                return ticketTags.includes(appliedFilters.tags);
            });
        }
    }

    return filtered;
}, [tickets, messages, filteredTicketIds, appliedFilters, showMyTickets, searchQuery, userId]);

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

useEffect(() => {
    setFilteredTickets(tickets);
}, [tickets]);

useEffect(() => {
    if (showMyTickets) {
        setFilteredTickets(tickets.filter(ticket => ticket.technician_id === userId));
    } else {
        setFilteredTickets(tickets);
    }
}, [tickets, showMyTickets, userId]);

const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setShowMyTickets(checked);

    if (checked) {
        setFilteredTickets(tickets.filter(ticket => ticket.technician_id === userId));
    } else {
        setFilteredTickets(tickets);
    }
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
useEffect(() => {
    if (!selectTicketId) return;
    getClientMessagesSingle(selectTicketId);
}, [selectTicketId]);

useEffect(() => {
    scrollToBottom();
}, [selectTicketId]);

useEffect(() => {
    if (ticketId) {
        setSelectTicketId(Number(ticketId));
    }
}, [ticketId, setSelectTicketId]);

const applyFilters = (filters) => {
    setAppliedFilters(filters);
};

const [filteredTicketIds, setFilteredTicketIds] = useState(null);

const [searchQuery, setSearchQuery] = useState("");

const [appliedFilters, setAppliedFilters] = useState({});
const ticketRef = useRef(null);
const [isChatListVisible, setIsChatListVisible] = useState(true);
const location = useLocation();

const [filteredTickets, setFilteredTickets] = useState(tickets);
const [showMyTickets, setShowMyTickets] = useState(false);

const navigate = useNavigate();

import { useLocation } from 'react-router-dom';

import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const { tickets, messages, markMessagesAsRead, selectTicketId, setSelectTicketId, getClientMessagesSingle } = useAppContext();