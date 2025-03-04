import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaFile, FaPaperPlane, FaSmile } from 'react-icons/fa';
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
import TaskModal from '../SlideInComponent/TaskComponent';
import { FaTasks } from 'react-icons/fa';
import { api } from "../../api"
import ChatExtraInfo from './ChatExtraInfo';
import ChatList from './ChatList';

const ChatComponent = ({ }) => {
    const { userId } = useUser();
    const [managerMessage, setManagerMessage] = useState('');
    const { tickets, updateTicket, setTickets, messages, setMessages, markMessagesAsRead, selectTicketId, setSelectTicketId, getClientMessagesSingle } = useAppContext();
    const [personalInfo, setPersonalInfo] = useState({});
    const messageContainerRef = useRef(null);
    const { ticketId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [selectedReaction, setSelectedReaction] = useState({});
    const reactionContainerRef = useRef(null);
    const [selectedClient, setSelectedClient] = useState("");
    const fileInputRef = useRef(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isChatListVisible, setIsChatListVisible] = useState(true);

    const platformIcons = {
        "facebook": <FaFacebook />,
        "instagram": <FaInstagram />,
        "whatsapp": <FaWhatsapp />,
        "viber": <SiViber />,
        "telegram": <FaTelegram />
    };
    const updatedTicket = tickets.find(ticket => ticket.id === selectTicketId) || null;

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
            console.log("📌 selectedClient:", selectedClient);

            if (!Array.isArray(messages)) {
                return "web";
            }

            const clientId = Number(selectedClient);

            const clientMessages = messages.filter((msg) => Number(msg.client_id) === clientId);

            if (!clientMessages || clientMessages.length === 0) {
                return "web";
            }

            console.log("🔎 Найдено сообщений от клиента:", clientMessages.length);

            const lastMessage = clientMessages.reduce((latest, current) =>
                new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
            );

            return lastMessage?.platform || "web";
        };

        const platform = analyzeLastMessagePlatform();

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

    return (
        <div className="chat-container">
            <ChatList
                isChatListVisible={isChatListVisible}
                setIsChatListVisible={setIsChatListVisible}
            />
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