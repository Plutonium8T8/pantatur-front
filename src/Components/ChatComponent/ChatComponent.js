import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaFile, FaPaperPlane, FaSmile } from 'react-icons/fa';
import { useUser } from '../../UserContext';
import { templateOptions } from '../../FormOptions/MessageTemplate';
import "react-datepicker/dist/react-datepicker.css";
import { useAppContext } from '../../AppContext';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import ReactDOM from "react-dom";
import { translations } from '../utils/translations';
import { FaFacebook, FaInstagram, FaWhatsapp, FaTelegram } from "react-icons/fa";
import { SiViber } from "react-icons/si";
import { useLocation } from 'react-router-dom';
import TaskModal from '../SlideInComponent/TaskComponent';
import { FaTasks } from 'react-icons/fa';
import { api } from "../../api"
import ChatExtraInfo from './ChatExtraInfo';

const ChatComponent = ({ }) => {
    const { userId, hasRole, isLoadingRoles } = useUser();
    const [managerMessage, setManagerMessage] = useState('');
    const { tickets, updateTicket, setTickets, messages, setMessages, markMessagesAsRead, selectTicketId, setSelectTicketId, getClientMessagesSingle } = useAppContext();
    const [personalInfo, setPersonalInfo] = useState({});
    const messageContainerRef = useRef(null);
    const { ticketId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [selectedReaction, setSelectedReaction] = useState({});
    const reactionContainerRef = useRef(null);
    const [filteredTickets, setFilteredTickets] = useState(tickets);
    const [showMyTickets, setShowMyTickets] = useState(false);
    const [selectedClient, setSelectedClient] = useState("");
    const fileInputRef = useRef(null);
    const [appliedFilters, setAppliedFilters] = useState({});
    const ticketRef = useRef(null);
    const [isChatListVisible, setIsChatListVisible] = useState(true);
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [filteredTicketIds, setFilteredTicketIds] = useState(null);

    const platformIcons = {
        "facebook": <FaFacebook />,
        "instagram": <FaInstagram />,
        "whatsapp": <FaWhatsapp />,
        "viber": <SiViber />,
        "telegram": <FaTelegram />
    };
    const updatedTicket = tickets.find(ticket => ticket.id === selectTicketId) || null;

    const applyFilters = (filters) => {
        setAppliedFilters(filters);
    };

    useEffect(() => {
        if (ticketId) {
            setSelectTicketId(Number(ticketId));
        }
    }, [ticketId, setSelectTicketId]);

    useEffect(() => {
        scrollToBottom();
    }, [selectTicketId]);

    useEffect(() => {
        if (!selectTicketId) return;
        getClientMessagesSingle(selectTicketId);
    }, [selectTicketId]);


    const handleTicketClick = async (ticketId) => {
        if (selectTicketId === ticketId) return;

        setSelectTicketId(ticketId);
        navigate(`/chat/${ticketId}`);

        await markMessagesAsRead(ticketId);
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    const handleReactionClick = (reaction, messageId) => {
        setSelectedReaction((prev) => ({
            ...prev,
            [messageId]: reaction,
        }));
    };

    const getLastReaction = (message) => {
        if (!message.reactions) {
            return '☺';
        }

        try {
            const reactionsArray = message.reactions
                .replace(/^{|}$/g, '')
                .split('","')
                .map((reaction) => reaction.replace(/(^"|"$|\")/g, '').trim());

            const parsedReactions = reactionsArray.map((reaction) => {
                try {
                    const normalizedReaction = reaction.replace('\"', '');
                    const parsed = JSON.parse(normalizedReaction);
                    return parsed.reaction;
                } catch {
                    return reaction;
                }
            });

            return parsedReactions.length > 0
                ? parsedReactions[parsedReactions.length - 1]
                : '☺';
        } catch (error) {
            console.error('Ошибка при обработке реакций:', error);
            return '☺';
        }
    };

    const handleClickOutsideReaction = (event) => {
        if (
            reactionContainerRef.current &&
            !reactionContainerRef.current.contains(event.target)
        ) {
            setSelectedMessageId(null); // Закрываем реакции
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutsideReaction);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideReaction);
        };
    }, []);
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleEmojiClick = (emojiObject) => {
        setManagerMessage((prevMessage) => prevMessage + emojiObject.emoji);
        console.log(emojiObject.emoji);
    };

    const handleEmojiClickButton = (event) => {
        const rect = event.target.getBoundingClientRect();
        const emojiPickerHeight = 450;

        setEmojiPickerPosition({
            top: rect.top + window.scrollY - emojiPickerHeight,
            left: rect.left + window.scrollX,
        });

        setShowEmojiPicker((prev) => !prev);
    };

    const handleClickOutside = (event) => {
        if (
            !event.target.closest('.emoji-button') &&
            !event.target.closest('.emoji-picker-popup')
        ) {
            setShowEmojiPicker(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleSelectTemplateChange = (event) => {
        const selectedKey = event.target.value;

        if (selectedKey) {
            setSelectedMessage(selectedKey);
            setManagerMessage(templateOptions[selectedKey]);
        } else {
            setSelectedMessage(null);
            setManagerMessage("");
        }
    };

    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files[0];
        console.log('Selected file:', selectedFile ? selectedFile.name : 'No file selected');

        if (selectedFile) {
            try {
                console.log('Uploading and sending file...');
                await sendMessage(selectedFile);
                console.log('File uploaded and message sent!');
            } catch (error) {
                console.error('Error processing file:', error);
            }
        } else {
            console.log('No file selected.');
        }
    };

    const handleFileButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        console.log('Подготовка к загрузке файла...');
        console.log('FormData:', formData);

        try {
            const data = await api.messages.upload(formData)

            return data
        } catch (error) {
            console.error('Ошибка загрузки файла:', error);
            throw error;
        }
    };
    const getLastActiveClient = () => {
        if (!Array.isArray(messages) || messages.length === 0) return null;

        const ticketMessages = messages.filter((msg) => msg.ticket_id === selectTicketId);

        if (ticketMessages.length === 0) {
            return null;
        }

        const lastMessage = ticketMessages.reduce((latest, current) =>
            new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
        );

        return lastMessage.client_id;
    };

    useEffect(() => {
        const lastClient = getLastActiveClient();
        if (lastClient) {
            setSelectedClient(String(lastClient));
        }
    }, [messages, selectTicketId]);

    const handleClick = () => {
        if (!selectedClient) {
            console.error("⚠️ Ошибка: Клиент не выбран!");
            return;
        }

        const analyzeLastMessagePlatform = () => {
            console.log("🔍 Анализируем платформу последнего сообщения...");
            console.log("📌 selectedClient:", selectedClient);

            if (!Array.isArray(messages)) {
                console.error("❌ Ошибка: messages не является массивом!", messages);
                return "web";
            }

            console.log("📩 Всего сообщений в системе:", messages.length);

            const clientId = Number(selectedClient);

            const clientMessages = messages.filter((msg) => Number(msg.client_id) === clientId);

            if (!clientMessages || clientMessages.length === 0) {
                console.warn("⚠️ Нет сообщений от клиента, выбираем платформу (web)");
                return "web";
            }

            console.log("🔎 Найдено сообщений от клиента:", clientMessages.length);

            const lastMessage = clientMessages.reduce((latest, current) =>
                new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
            );

            console.log("🕵️‍♂️ Последнее сообщение:", lastMessage);
            console.log("📡 Определённая платформа:", lastMessage?.platform || "web");

            return lastMessage?.platform || "web";
        };

        const platform = analyzeLastMessagePlatform();
        console.log(`🚀 Определённая платформа для отправки: ${platform}`);

        sendMessage(null, platform);
    };

    const sendMessage = async (selectedFile, platform) => {
        if (!managerMessage.trim() && !selectedFile) {
            console.error('Ошибка: Отправка пустого сообщения невозможна.');
            return;
        }

        try {
            const messageData = {
                sender_id: Number(userId),
                client_id: selectedClient,
                platform: platform,
                message: managerMessage.trim(),
                media_type: null,
                media_url: "",
            };

            if (selectedFile) {
                console.log('Загрузка файла...');
                const uploadResponse = await uploadFile(selectedFile);

                if (!uploadResponse || !uploadResponse.url) {
                    console.error('Ошибка загрузки файла');
                    return;
                }

                messageData.media_url = uploadResponse.url;
                messageData.media_type = getMediaType(selectedFile.type);
            }

            console.log('Отправляемые данные:', JSON.stringify(messageData, null, 2));

            let apiUrl = api.messages.send.create

            if (platform === "telegram") {
                apiUrl = api.messages.send.telegram
            } else if (platform === "viber") {
                apiUrl = api.messages.send.viber
            }

            console.log(`📡 Отправка сообщения через API: ${apiUrl}`);

            setManagerMessage('');

            await apiUrl(messageData)

            console.log(`✅ Сообщение успешно отправлено через API ${apiUrl}:`, messageData);

            setMessages((prevMessages) => [...prevMessages, { ...messageData, seenAt: false }]);

            if (!selectedFile) setManagerMessage('');
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
        }
    };

    const language = localStorage.getItem('language') || 'RO';

    const getMediaType = (mimeType) => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        return 'file';
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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

    useEffect(() => {
        applyFilters(appliedFilters);
    }, [messages]);

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

    return (
        <div className="chat-container">
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

            <div className="chat-area">
                <div className="chat-messages" ref={messageContainerRef}>
                    {selectTicketId ? (
                        (() => {

                            const parseDate = (dateString) => {
                                if (!dateString) return null;
                                const parts = dateString.split(" ");
                                if (parts.length !== 2) return null;

                                const [date, time] = parts;
                                const [day, month, year] = date.split("-");

                                return new Date(`${year}-${month}-${day}T${time}`);
                            };

                            const sortedMessages = messages
                                .filter(msg => msg.ticket_id === selectTicketId)
                                .sort((a, b) => parseDate(a.time_sent) - parseDate(b.time_sent));


                            const groupedMessages = sortedMessages.reduce((acc, msg) => {
                                const messageDate = parseDate(msg.time_sent)?.toLocaleDateString("ru-RU", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                }) || "—";

                                if (!acc[messageDate]) acc[messageDate] = [];
                                acc[messageDate].push(msg);
                                return acc;
                            }, {});

                            return Object.entries(groupedMessages).map(([date, msgs]) => {
                                let groupedByClient = [];
                                let lastClientId = null;
                                let currentGroup = [];

                                msgs.forEach((msg) => {
                                    if (msg.client_id !== lastClientId) {
                                        if (currentGroup.length) {
                                            groupedByClient.push({ clientId: lastClientId, messages: currentGroup });
                                        }
                                        currentGroup = [];
                                        lastClientId = msg.client_id;
                                    }
                                    currentGroup.push(msg);
                                });

                                if (currentGroup.length) {
                                    groupedByClient.push({ clientId: lastClientId, messages: currentGroup });
                                }

                                return (
                                    <div key={date} className='message-group-container-chat'>
                                        <div className="message-date-separator">📆 {date}</div>
                                        {groupedByClient.map(({ clientId, messages }, index) => (
                                            <div key={`${clientId}-${date}-${index}`} className="client-message-group">
                                                <div className="client-header">👤 {translations["Mesajele clientului"][language]} #{clientId}</div>
                                                {messages.map((msg) => {
                                                    const uniqueKey = `${msg.id || msg.ticket_id}-${msg.time_sent}`;

                                                    const renderContent = () => {
                                                        if (!msg.message) {
                                                            return <div className="text-message">{translations["Mesajul lipseste"][language]}</div>;
                                                        }
                                                        switch (msg.mtype) {
                                                            case "image":
                                                                return (
                                                                    <img
                                                                        src={msg.message}
                                                                        alt="Изображение"
                                                                        className="image-preview-in-chat"
                                                                        onError={(e) => {
                                                                            e.target.src = "https://via.placeholder.com/300?text=Ошибка+загрузки";
                                                                        }}
                                                                        onClick={() => {
                                                                            window.open(msg.message, "_blank");
                                                                        }}
                                                                    />
                                                                );
                                                            case "video":
                                                                return (
                                                                    <video controls className="video-preview">
                                                                        <source src={msg.message} type="video/mp4" />
                                                                        {translations["Acest browser nu suporta video"][language]}
                                                                    </video>
                                                                );
                                                            case "audio":
                                                                return (
                                                                    <audio controls className="audio-preview">
                                                                        <source src={msg.message} type="audio/ogg" />
                                                                        {translations["Acest browser nu suporta audio"][language]}
                                                                    </audio>
                                                                );
                                                            case "file":
                                                                return (
                                                                    <a
                                                                        href={msg.message}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="file-link"
                                                                    >
                                                                        {translations["Deschide file"][language]}
                                                                    </a>
                                                                );
                                                            default:
                                                                return <div className="text-message">{msg.message}</div>;
                                                        }
                                                    };

                                                    const lastReaction = getLastReaction(msg);

                                                    return (
                                                        <div
                                                            key={uniqueKey}
                                                            className={`message ${msg.sender_id === userId || msg.sender_id === 1 ? "sent" : "received"}`}
                                                        >
                                                            <div className="message-content">
                                                                <div className="message-row">
                                                                    <div style={{ fontSize: "30px", marginRight: "8px" }}>
                                                                        {platformIcons[msg.platform] || null}
                                                                    </div>

                                                                    <div className="text">
                                                                        {renderContent()}
                                                                        <div className="message-time">
                                                                            {msg.sender_id !== 1 && msg.sender_id !== userId && (
                                                                                <span className="client-name">
                                                                                    {personalInfo[msg.client_id]?.name || ""} {personalInfo[msg.client_id]?.surname || ""}
                                                                                </span>
                                                                            )}
                                                                            <div
                                                                                className="reaction-toggle-button"
                                                                                onClick={() =>
                                                                                    setSelectedMessageId(selectedMessageId === msg.id ? null : msg.id)
                                                                                }
                                                                            >
                                                                                {lastReaction || "☺"}
                                                                            </div>
                                                                            <div className='time-messages'>
                                                                                {parseDate(msg.time_sent)?.toLocaleTimeString("ru-RU", {
                                                                                    hour: "2-digit",
                                                                                    minute: "2-digit",
                                                                                }) || "—"}
                                                                            </div>
                                                                        </div>
                                                                        {selectedMessageId === msg.id && (
                                                                            <div className="reaction-container" ref={reactionContainerRef}>
                                                                                <div className="reaction-buttons">
                                                                                    {["☺", "👍", "❤️", "😂", "😮", "😢", "😡"].map((reaction) => (
                                                                                        <div
                                                                                            key={reaction}
                                                                                            onClick={() => handleReactionClick(reaction, msg.id)}
                                                                                            className={selectedReaction[msg.id] === reaction ? "active" : ""}
                                                                                        >
                                                                                            {reaction}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                );
                            });
                        })()
                    ) : (
                        <div className="empty-chat">
                            <p>{translations["Alege lead"][language]}</p>
                        </div>
                    )}
                </div>
                <div className="manager-send-message-container">
                    <textarea
                        className="text-area-message"
                        value={managerMessage ?? ""}
                        onChange={(e) => setManagerMessage(e.target.value)}
                        placeholder={translations['Introduceți mesaj'][language]}
                        disabled={!selectTicketId}
                    />
                    <div className="message-options">
                        <div className="button-row">
                            <button
                                className="action-button send-button"
                                onClick={handleClick}
                                disabled={!selectTicketId}>
                                <FaPaperPlane />
                            </button>
                            <button
                                className="action-button emoji-button"
                                onClick={handleEmojiClickButton}
                                disabled={!selectTicketId}>
                                <FaSmile />
                            </button>
                            {showEmojiPicker &&
                                ReactDOM.createPortal(
                                    <div
                                        className="emoji-picker-popup"
                                        style={{
                                            position: "absolute",
                                            top: emojiPickerPosition.top,
                                            left: emojiPickerPosition.left,
                                            zIndex: 1000,
                                        }}
                                        onMouseEnter={() => setShowEmojiPicker(true)}
                                        onMouseLeave={() => setShowEmojiPicker(false)}
                                    >
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>,
                                    document.body
                                )}
                            <input
                                type="file"
                                accept="image/*,audio/mp3,video/mp4,application/pdf,audio/ogg"
                                onChange={handleFileSelect}
                                ref={fileInputRef}
                                style={{ display: "none" }}
                            />
                            <button
                                className="action-button file-button"
                                disabled={!selectTicketId}
                                onClick={handleFileButtonClick}
                            >
                                <FaFile />
                            </button>
                            <button
                                className="action-button task-button"
                                onClick={() => setIsTaskModalOpen(true)}
                                disabled={!selectTicketId}
                            >
                                <FaTasks />
                            </button>
                        </div>
                        <div className="select-row">
                            <div className="input-group">
                                <label htmlFor="message-template"></label>
                                <select
                                    id="message-template"
                                    className="task-select"
                                    value={selectedMessage ?? ""}
                                    onChange={handleSelectTemplateChange}
                                >
                                    <option value="">{translations["Introduceți mesaj"]?.[language] ?? translations[""]?.[language]}</option>

                                    {Object.entries(templateOptions).map(([key, value]) => (
                                        <option key={key} value={key}>
                                            {translations[key]?.[language] ?? key}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        {tickets && tickets.find(ticket => ticket.id === selectTicketId)?.client_id && (
                            <div className="client-select-container">
                                <select
                                    className="task-select"
                                    value={selectedClient}
                                    onChange={(e) => setSelectedClient(e.target.value)}
                                >
                                    <option value="" disabled>{translations["Alege client"][language]}</option>
                                    {tickets.find(ticket => ticket.id === selectTicketId).client_id
                                        .replace(/[{}]/g, "")
                                        .split(",")
                                        .map(id => {
                                            const clientId = id.trim();
                                            const clientInfo = personalInfo[clientId] || {};
                                            const fullName = clientInfo.name ? `${clientInfo.name} ${clientInfo.surname || ""}`.trim() : `ID: ${clientId}`;

                                            const lastMessage = messages
                                                .filter(msg => msg.client_id === Number(clientId))
                                                .sort((a, b) => new Date(b.time_sent) - new Date(a.time_sent))[0];

                                            const platform = lastMessage ? lastMessage.platform : "unknown";
                                            const platformName = lastMessage ? platform.charAt(0).toUpperCase() + platform.slice(1) : ["Неизвестная платформа"][language];

                                            return (
                                                <option key={clientId} value={clientId}>
                                                    {`${fullName} (${platformName})`}
                                                </option>
                                            );
                                        })}
                                </select>
                            </div>
                        )}
                    </div>

                    <TaskModal
                        isOpen={isTaskModalOpen}
                        onClose={() => setIsTaskModalOpen(false)}
                        selectedTicketId={selectTicketId}
                    />
                </div>

            </div>
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