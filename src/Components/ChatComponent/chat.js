import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import Select from '../SelectComponent/SelectComponent';
import { useUser } from '../../UserContext';
import Cookies from 'js-cookie';
import { transportOptions } from '../../FormOptions/TransportOptions';
import { countryOptions } from '../../FormOptions/CountryOptions';
import { marketingOptions } from '../../FormOptions/MarketingOptions';
import { nameExcursionOptions } from '../../FormOptions/NameExcursionOptions';
import { paymentStatusOptions } from '../../FormOptions/PaymentStatusOptions';
import { purchaseProcessingOptions } from '../../FormOptions/PurchaseProcessingOptions';
import { serviceTypeOptions } from '../../FormOptions/ServiceTypeOptions';
import { sourceOfLeadOptions } from '../../FormOptions/SourceOfLeadOptions';
import { promoOptions } from '../../FormOptions/PromoOptions';
import { templateOptions } from '../../FormOptions/MessageTemplate';
import TechnicianSelect from '../../FormOptions/ResponsabilLead';
import DatePicker from 'react-datepicker';
import Input from '../InputComponent/InputComponent';
import Workflow from '../WorkFlowComponent/WorkflowComponent';
import "react-datepicker/dist/react-datepicker.css";
import { useSocket } from '../../SocketContext';
import { InView } from 'react-intersection-observer';
import { useSnackbar } from 'notistack';
import './chat.css';
import { useUnreadMessages } from '../../Unread';
import EmojiPicker from 'emoji-picker-react';
import ReactDOM from "react-dom";

const ChatComponent = ({ }) => {
    const { userId } = useUser();
    const [managerMessage, setManagerMessage] = useState('');
    const [messages1, setMessages1] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [extraInfo, setExtraInfo] = useState({}); // Состояние для дополнительной информации каждого тикета
    const [tickets1, setTickets1] = useState([]);
    const messageContainerRef = useRef(null);
    const { ticketId } = useParams(); // Получаем ticketId из URL
    const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const socket = useSocket(); // Получаем WebSocket из контекста
    const [unreadMessages, setUnreadMessages] = useState({});
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate(); // Хук для навигации
    const { markMessagesAsRead } = useUnreadMessages();
    const [menuMessageId, setMenuMessageId] = useState(null);
    const [editMessageId, setEditMessageId] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [messages, setMessages] = useState(messages1); // предполагается, что `messages1` - это изначальный массив сообщений
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
    const [selectedMessage, setSelectedMessage] = useState(null); // Выбранный шаблон из Select
    const [file, setFile] = useState(null);

    useEffect(() => {
        // Если ticketId передан через URL, устанавливаем его как selectedTicketId
        if (ticketId) {
            setSelectedTicketId(Number(ticketId));
        }
    }, [ticketId]);

    useEffect(() => {
        if (selectedTicketId) {
            fetchTicketExtraInfo(selectedTicketId); // Загружаем дополнительную информацию при изменении тикета
        }
    }, [selectedTicketId]);


    // Получение тикетов через fetch
    const fetchTickets = async () => {
        setIsLoading(true); // Показываем индикатор загрузки
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const token = Cookies.get('jwt');
            const response = await fetch('https://pandatur-api.com/api/tickets', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                console.warn('Ошибка 401: Неавторизован. Перенаправляем на логин.');
                window.location.reload(); // Перезагрузка страницы
                return;
            }

            if (!response.ok) {
                throw new Error('Ошибка при получении данных');
            }

            const data = await response.json();
            setTickets1(...data); // Устанавливаем данные тикетов
            // console.log("+++ Загруженные тикеты:", data);
        } catch (error) {
            console.error('Ошибка:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    // Получение дополнительной информации для тикета
    const fetchTicketExtraInfo = async (selectedTicketId) => {
        try {
            const token = Cookies.get('jwt');
            const response = await fetch(`https://pandatur-api.com/ticket-info/${selectedTicketId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении дополнительной информации');
            }

            const data = await response.json();
            // enqueueSnackbar('Загружено доп инфо по тикетам!', { variant: 'success' });
            // Обновляем состояние с дополнительной информацией о тикете
            setExtraInfo((prevState) => ({
                ...prevState,
                [selectedTicketId]: data, // Сохраняем информацию для текущего тикета
            }));

            // Обновляем состояние с выбранным technician_id
            setSelectedTechnicianId(data.technician_id); // Устанавливаем technician_id в состояние

        } catch (error) {
            enqueueSnackbar('Ошибка при получении дополнительной информации', { variant: 'error' });
            console.error('Ошибка при получении дополнительной информации:', error);
        }
    };


    // Загружаем тикеты при монтировании компонента
    useEffect(() => {
        fetchTickets();
    }, []);

    const showNotification = (data) => {
        console.log('Notification:', data);
    };
    const handleTask = (data) => {
        console.log('Task:', data);
    };
    const handleSeen = (data) => {
        console.log('seen:', data);
    };

    const getClientMessages = async () => {
        try {
            const token = Cookies.get('jwt');
            const response = await fetch(`https://pandatur-api.com/messages`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            // console.log('Сообщения клиента полученые с сервера:', data);
            // enqueueSnackbar('Сообшения получены!', { variant: 'success' });
            // Обновляем состояние с сообщениями
            setMessages1(data);
        } catch (error) {
            enqueueSnackbar('Не удалось получить сообшения!', { variant: 'error' });
            console.error('Ошибка при получении сообщений:', error.message);
        }
    };

    useEffect(() => {
        getClientMessages();
    }, []);

    // Обработчик изменения значения в селекте для выбранного тикета
    const handleSelectChange = (ticketId, field, value) => {
        setExtraInfo((prevState) => {
            const newState = {
                ...prevState,
                [ticketId]: {
                    ...prevState[ticketId],
                    [field]: value,
                },
            };
            console.log("Обновленное состояние extraInfo:", newState);
            return newState;
        });
    };

    const handleTechnicianChange = (technicianId) => {
        console.log('Выбранный техник ID:', technicianId);
        setSelectedTechnicianId(technicianId);
    };

    // отправка данных формы в бэк
    const sendExtraInfo = async () => {
        const token = Cookies.get('jwt'); // Получение токена из cookie
        const ticketExtraInfo = extraInfo[selectedTicketId]; // Получаем информацию для выбранного тикета
        const technician_id = selectedTechnicianId; // Новое значение для technician_id

        console.log('User ID перед отправкой:', userId);

        if (!ticketExtraInfo) {
            console.warn('Нет дополнительной информации для выбранного тикета.', ticketExtraInfo);
            return;
        }
        setIsLoading(true); // Устанавливаем состояние загрузки в true

        try {
            const response = await fetch(`https://pandatur-api.com/ticket-info/${selectedTicketId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...ticketExtraInfo, // Сначала добавляем все свойства из ticketExtraInfo
                    technician_id, // Затем перезаписываем technician_id
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при отправке данных');
            }

            console.log('Отправляемые данные:', {
                ...ticketExtraInfo,
                technician_id,
            });

            const result = await response.json();
            enqueueSnackbar('Данные успешно обновлены', { variant: 'success' });
            console.log('Данные успешно отправлены:', result);
        } catch (error) {
            enqueueSnackbar('Ошибка при обновлении дополнительной информации:', { variant: 'error' });
            console.error('Ошибка при отправке дополнительной информации:', error);
        }
        finally {
            setIsLoading(false); // Отключаем индикатор загрузки
        }
    };

    // изминения значения workflow из экстра формы
    const handleWorkflowChange = async (event) => {
        const newWorkflow = event.target.value;

        if (!selectedTicketId) return; // Проверяем, что тикет выбран

        const updatedTicket = tickets1.find(ticket => ticket.id === selectedTicketId); // Найдем тикет

        if (!updatedTicket) {
            console.error("Тикет не найден");
            return; // Если тикет не найден, прекращаем выполнение
        }

        try {
            // Отправляем PATCH запрос на сервер
            const token = Cookies.get("jwt");
            const response = await fetch(`https://pandatur-api.com/api/tickets/${updatedTicket.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ workflow: newWorkflow }),
            });

            if (!response.ok) {
                throw new Error("Ошибка при обновлении workflow");
            }

            // Получаем обновленные данные
            const data = await response.json();
            enqueueSnackbar('Статус тикета обновлен!', { variant: 'success' });
            // Обновляем локальное состояние
            setTickets1((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket.id === updatedTicket.id ? { ...ticket, workflow: newWorkflow } : ticket
                )
            );

            console.log("Workflow обновлен:", data);
        } catch (error) {
            enqueueSnackbar('Ошибка, Статус тикета не обновлен!', { variant: 'error' });
            console.error("Ошибка при обновлении workflow:", error);
        }
    };

    const updatedTicket = tickets1.find(ticket => ticket.id === selectedTicketId);

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages1, selectedTicketId]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Предотвращаем переход на новую строку
            handleClick(); // Вызываем функцию, которая обрабатывает отправку
        }
    };

    const handleClick = (clientId) => {
        sendMessage();
        getClientMessages();
        markMessagesAsRead(clientId); // Помечаем сообщения клиента как прочитанные
        // fetchTicketsID();
        fetchTickets();
    };

    const handleTicketClick = (ticketId) => {
        setSelectedTicketId(ticketId); // Устанавливаем выбранный тикет
        navigate(`/chat/${ticketId}`);
        // fetchTicketsID();
        getClientMessages();
        fetchTickets();
    };

    const handleInView = (isVisible, msg) => {
        if (isVisible && !msg.seen_at) {
            const readMessageData = {
                type: 'seen',
                data: {
                    client_id: msg.client_id,
                    sender_id: Number(userId),
                },
            };

            try {
                socket.send(JSON.stringify(readMessageData));
                markMessagesAsRead(msg.client_id); // Локальное обновление
            } catch (error) {
                console.error('Error sending mark as read:', error);
            }
        }
    };

    useEffect(() => {
        if (socket) {
            const handleSocketMessage = (event) => {
                // console.log('Raw WebSocket message received:', event.data);
                getClientMessages();

                try {
                    const message = JSON.parse(event.data);
                    console.log('Parsed WebSocket message:', message);

                    switch (message.type) {
                        case 'message': {
                            setMessages1((prevMessages) => [...prevMessages, message.data]);

                            if (message.data.client_id !== selectedTicketId && !message.data.seen_at) {
                                setUnreadMessages((prevUnreadMessages) => {
                                    const updatedUnreadMessages = { ...prevUnreadMessages };
                                    const clientId = message.data.client_id;

                                    // Увеличиваем счётчик для непрочитанных сообщений
                                    updatedUnreadMessages[clientId] =
                                        (updatedUnreadMessages[clientId] || 0) + 1;
                                    console.log('Updated unread messages:', updatedUnreadMessages);
                                    return updatedUnreadMessages;
                                });
                            }
                            break;
                        }

                        case 'notification':
                            enqueueSnackbar(message.data.text || 'Уведомление получено!', {
                                variant: 'success',
                            });
                            break;

                        case 'task':
                            enqueueSnackbar(`Новая задача: ${message.data.title}`, {
                                variant: 'warning',
                            });
                            handleTask(message.data);
                            break;

                        case 'seen':
                            handleSeen(message.data);
                            break;

                        default:
                            console.warn('Unknown message type:', message);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            // Назначаем обработчик
            socket.onmessage = handleSocketMessage;

            return () => {
                if (socket) {
                    socket.onmessage = null;
                    socket.onerror = null;
                    socket.onclose = null;
                }
            };
        }
    }, [socket, selectedTicketId, getClientMessages, enqueueSnackbar, handleTask, handleSeen]);


    const handleDelete = async (id) => {
        const success = await deleteMessage(id);
        if (success) {
            setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
            getClientMessages();
        } else {
            alert('Не удалось удалить сообщение');
        }
    };


    const handleEdit = (msg) => {
        setEditMessageId(msg.id);
        setEditedText(msg.message); // Предзаполнение текущего текста
    };

    const handleSave = async () => {
        if (editedText.trim() === '') {
            alert('Сообщение не может быть пустым');
            return;
        }

        const updatedMessage = await updateMessage(editMessageId, editedText);
        if (updatedMessage) {
            getClientMessages();
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === editMessageId ? { ...msg, message: updatedMessage.message } : msg
                )
            );
            setEditMessageId(null);
            setEditedText('');
        } else {
            alert('Не удалось обновить сообщение');
        }
    };


    const handleCancel = () => {
        setEditMessageId(null);
        setEditedText('');
    };

    // Пример API-запроса для удаления сообщения
    const deleteMessage = async (id) => {
        try {
            const response = await fetch(`https://pandatur-api.com/messages/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Ошибка при удалении сообщения');
            }
            return true; // Успешное удаление
        } catch (error) {
            console.error(error);
            return false; // Ошибка
        }
    };

    // Пример API-запроса для обновления сообщения
    const updateMessage = async (id, newMessage) => {
        try {
            const response = await fetch(`https://pandatur-api.com/messages/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: newMessage }),
            });
            if (!response.ok) {
                throw new Error('Ошибка при обновлении сообщения');
            }
            const updatedMessage = await response.json();
            return updatedMessage;
        } catch (error) {
            console.error(error);
            return null; // Ошибка
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setManagerMessage((prevMessage) => prevMessage + emojiObject.emoji);
    };

    const handleEmojiHover = (event) => {
        const rect = event.target.getBoundingClientRect();
        const emojiPickerHeight = 450; // Предполагаемая высота эмодзи-пикера
        setEmojiPickerPosition({
            top: rect.top + window.scrollY - emojiPickerHeight, // Смещаем вверх
            left: rect.left + window.scrollX,
        });
        setShowEmojiPicker(true);
    };

    const handleMouseLeave = () => {
        setShowEmojiPicker(false);
    };

    // Обработчик для изменения выбранного шаблона
    const handleSelectTChange = (selectedOption) => {
        if (selectedOption && selectedOption) {
            setSelectedMessage(selectedOption);
            setManagerMessage(selectedOption);
        } else {
            setSelectedMessage(null);
            setManagerMessage("");
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = Cookies.get('jwt'); // Убедитесь, что библиотека Cookies импортирована

        console.log('Preparing to upload image...');
        console.log('FormData:', formData);
        // console.log('Token:', token);

        try {
            const response = await fetch('https://pandatur-api.com/messages/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`, // Добавляем токен авторизации в заголовки
                },
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Image uploaded successfully:', data);
                return data; // Предполагается, что сервер возвращает объект с полем `url`
            } else {
                const errorMessage = `Failed to upload image. Status: ${response.status}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files[0];
        console.log('Выбран файл:', selectedFile ? selectedFile.name : 'Файл не выбран');

        if (selectedFile) {
            try {
                console.log('Начало загрузки и отправки');
                await sendMessage(selectedFile); // Передаем файл напрямую
                console.log('Файл загружен и сообщение отправлено!');
            } catch (error) {
                console.error('Ошибка при обработке файла:', error);
            }
        } else {
            console.log('Файл не выбран.');
        }
    };

    const sendMessage = async (selectedFile) => {
        if (!managerMessage.trim() && !selectedFile) {
            return;
        }

        if (socket) {
            console.log('WebSocket state before sending message:', socket.readyState);

            if (socket.readyState === WebSocket.OPEN) {
                const currentTime = new Date().toISOString();

                try {
                    let imageUrl = null;

                    // Если передан файл, загружаем его и получаем URL
                    if (selectedFile) {
                        const uploadResponse = await uploadImage(selectedFile);
                        imageUrl = uploadResponse.url;
                        console.log('Image URL received:', imageUrl);

                        if (imageUrl) {
                            const urlMessageData = {
                                type: 'message',
                                data: {
                                    sender_id: Number(userId),
                                    client_id: [selectedTicketId],
                                    platform: 'web',
                                    text: imageUrl,
                                    time_sent: currentTime,
                                },
                            };

                            // Отправляем через WebSocket
                            socket.send(JSON.stringify(urlMessageData));
                            console.log('URL message sent:', urlMessageData);

                            // Обновляем сообщения
                            setMessages1((prevMessages) => [
                                ...prevMessages,
                                { ...urlMessageData.data, seen_at: false },
                            ]);
                        }
                    }

                    // Если есть текстовое сообщение, отправляем его отдельно
                    if (managerMessage.trim()) {
                        const textMessageData = {
                            type: 'message',
                            data: {
                                sender_id: Number(userId),
                                client_id: [selectedTicketId],
                                platform: 'web',
                                text: managerMessage,
                                time_sent: currentTime,
                            },
                        };

                        socket.send(JSON.stringify(textMessageData));
                        console.log('Text message sent:', textMessageData);

                        setMessages1((prevMessages) => [
                            ...prevMessages,
                            { ...textMessageData.data, seen_at: false },
                        ]);

                        setManagerMessage('');
                    }
                } catch (error) {
                    console.error('Ошибка при отправке сообщения:', error);
                }
            } else {
                console.error('WebSocket не открыт. Перезагрузите страницу.');
                alert('WebSocket не открыт. Перезагрузите страницу.');
            }
        } else {
            console.error('Socket is null.');
        }
    };

    return (
        <div className="chat-container">
            <div className="users-container">
                <h3>Chat List</h3>
                <div className="chat-item-container">
                    {tickets1.map((ticket) => {
                        const chatMessages = messages1.filter((msg) => msg.client_id === ticket.id);

                        const unreadCounts = chatMessages.filter(
                            (msg) =>
                                (!msg.seen_by || !msg.seen_by.includes(String(userId))) && // Сообщение не прочитано текущим пользователем
                                msg.sender_id !== Number(userId) // Сообщение отправлено не текущим пользователем
                        ).length;

                        const lastMessage = chatMessages.length > 0
                            ? chatMessages.reduce((latest, current) =>
                                new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
                            )
                            : { message: '', time_sent: null };

                        const formattedTime = lastMessage.time_sent
                            ? new Date(lastMessage.time_sent).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                            : null;

                        return (
                            <div
                                key={ticket.id}
                                className={`chat-item ${ticket.id === selectedTicketId ? 'active' : ''}`}
                                onClick={() => handleTicketClick(ticket.id)}
                            >
                                <div className="foto-description">
                                    <img className="foto-user" src="/user fon.png" alt="example" />
                                    <div className="tickets-descriptions">
                                        <div>{ticket.contact || "no contact"}</div>
                                        <div>{ticket.id ? `Lead: #${ticket.id}` : "no id"}</div>
                                        <div>{ticket.workflow || "no workflow"}</div>
                                    </div>
                                </div>
                                <div className="container-time-tasks-chat">
                                    <div className="info-message">
                                        <div className="last-message-container">
                                            <div className="last-message-ticket">{lastMessage.message}</div>
                                            <div>{formattedTime}</div>
                                            {unreadCounts > 0 && (
                                                <div className="unread-count">{unreadCounts}</div>
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
            </div>
            <div className="chat-area">
                <div className="chat-messages" ref={messageContainerRef}>
                    {messages1
                        .filter((msg) => msg.client_id === selectedTicketId)
                        .sort((a, b) => new Date(a.time_sent) - new Date(b.time_sent))
                        .map((msg) => {
                            const uniqueKey = msg.id || `${msg.client_id}-${msg.time_sent}`;

                            // Функция для проверки, является ли текст URL изображения
                            const isImageUrl = (text) => /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(text);

                            // Функция для открытия изображения в новом окне
                            const openImageInNewWindow = (url) => {
                                const newWindow = window.open('', '_blank');
                                newWindow.document.write(`
                                    <html>
                                        <head>
                                            <title>Просмотр изображения</title>
                                            <style>
                                                body {
                                                    display: flex;
                                                    flex-direction: column;
                                                    justify-content: center;
                                                    align-items: center;
                                                    height: 100vh;
                                                    margin: 0;
                                                    background-color: #f0f0f0;
                                                }
                                                img {
                                                    max-width: 80%;
                                                    max-height: 80%;
                                                    border-radius: 8px;
                                                }
                                                .download-button {
                                                    margin-top: 20px;
                                                    padding: 10px 20px;
                                                    background-color: #007bff;
                                                    color: white;
                                                    text-decoration: none;
                                                    border-radius: 5px;
                                                    font-size: 16px;
                                                }
                                                .download-button:hover {
                                                    background-color: #0056b3;
                                                }
                                            </style>
                                        </head>
                                        <body>
                                            <img src="${url}" alt="Просмотр изображения" />
                                            <button class="download-button" onclick="downloadImage('${url}')">Скачать</button>
                                            
                                            <script>
                                                function downloadImage(imageUrl) {
                                                    const link = document.createElement('a');
                                                    link.href = imageUrl;
                                                    link.download = imageUrl.split('/').pop(); // Имя файла на основе URL
                                                    link.click();
                                                }
                                            </script>
                                        </body>
                                    </html>
                                `);
                                newWindow.document.close();
                            };
                            
                            return (
                                <InView
                                    key={uniqueKey}
                                    onChange={(inView) => handleInView(inView, msg)}
                                    threshold={0.5}
                                >
                                    {({ ref }) => (
                                        <div
                                            ref={ref}
                                            className={`message ${msg.sender_id === userId ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-content">
                                                <div className="message-row">
                                                    <div className="text">
                                                        {isImageUrl(msg.message) ? (
                                                            <img
                                                                src={msg.message}
                                                                alt="Отправленное изображение"
                                                                style={{
                                                                    maxWidth: '200px',
                                                                    maxHeight: '200px',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    backgroundColor:'white',
                                                                }}
                                                                onClick={() => openImageInNewWindow(msg.message)}
                                                            />
                                                        ) : (
                                                            msg.message
                                                        )}
                                                        {editMessageId === msg.id ? (
                                                            <div className="edit-mode">
                                                                <input
                                                                    type="text"
                                                                    value={editedText}
                                                                    onChange={(e) =>
                                                                        setEditedText(e.target.value)
                                                                    }
                                                                    className="edit-input"
                                                                />
                                                                <div className="edit-buttons">
                                                                    <button
                                                                        onClick={handleSave}
                                                                        className="save-button"
                                                                    >
                                                                        ✅
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancel}
                                                                        className="cancel-button"
                                                                    >
                                                                        ❌
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="message-time">
                                                                {new Date(msg.time_sent).toLocaleTimeString('ru-RU', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Показываем меню только для своих сообщений */}
                                                    {msg.sender_id === userId && (
                                                        <div className="menu-container">
                                                            <button
                                                                className="menu-button"
                                                                onClick={() =>
                                                                    setMenuMessageId(
                                                                        menuMessageId === msg.id ? null : msg.id
                                                                    )
                                                                }
                                                            >
                                                                ⋮
                                                            </button>
                                                            {menuMessageId === msg.id && (
                                                                <div className="menu-dropdown">
                                                                    <button onClick={() => handleEdit(msg)}>✏️</button>
                                                                    <button onClick={() => handleDelete(msg.id)}>🗑️</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </InView>
                            );
                        })}
                </div>

                <div className="manager-send-message-container">
                    <textarea
                        className="text-area-message"
                        value={managerMessage}
                        onChange={(e) => setManagerMessage(e.target.value)}
                        placeholder={selectedTicketId ? "Type your message..." : "Select a chat to start typing"}
                        onKeyDown={handleKeyDown}
                        disabled={!selectedTicketId} // Если нет selectedTicketId, textarea отключена
                    />
                    <div className="btn-send-message">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            id="file-input"
                        />
                        <label htmlFor="file-input" className="file-button">
                            📎
                        </label>
                        <button
                            className="send-button"
                            onClick={handleClick}
                            disabled={!selectedTicketId} // Кнопка также отключена, если нет selectedTicketId
                        >
                            Send
                        </button>
                    </div>
                    <div className="container-template">

                        <div className="emoji-picker-container">
                            <button
                                className="emoji-button"
                                onMouseEnter={handleEmojiHover}
                                disabled={!selectedTicketId}
                            >
                                😊
                            </button>
                            {showEmojiPicker &&
                                ReactDOM.createPortal(
                                    <div
                                        className="emoji-picker-popup"
                                        style={{
                                            position: "absolute",
                                            top: emojiPickerPosition.top,
                                            left: emojiPickerPosition.left,
                                            zIndex: 1000, // Обеспечивает отображение поверх других элементов
                                        }}
                                        onMouseEnter={() => setShowEmojiPicker(true)} // Оставляем открытым при наведении
                                        onMouseLeave={handleMouseLeave} // Закрываем, если курсор уходит
                                    >
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>,
                                    document.body
                                )}
                        </div>
                        <div className="container-template">
                            <Select
                                options={templateOptions} // Передаем преобразованные опции
                                id="message-template"
                                value={selectedMessage} // Текущее значение Select
                                onChange={handleSelectTChange} // Обработчик выбора
                                placeholder="Выберите сообщение"
                                className={"red"}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="extra-info">
                <h3>Additional Information</h3>
                {selectedTicketId && (
                    <>
                        <div className='selects-container'>
                            <Workflow
                                ticket={updatedTicket} // передаем объект тикета, а не только ID
                                onChange={handleWorkflowChange}
                            />
                            <TechnicianSelect
                                selectedTechnicianId={selectedTechnicianId}  // Передаем technician_id в select
                                onTechnicianChange={handleTechnicianChange}   // Обработчик изменения
                            />
                            <Input
                                label="Sale"
                                type="number"
                                value={extraInfo[selectedTicketId]?.sale || ""}
                                onChange={(e) =>
                                    handleSelectChange(selectedTicketId, 'sale', e.target.value)
                                }
                                className="input-field"
                                placeholder="Indicati suma in euro"
                                id="sale-input"
                            />
                            <Select
                                options={sourceOfLeadOptions}
                                label="Lead Source"
                                id="lead-source-select"
                                value={extraInfo[selectedTicketId]?.lead_source || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'lead_source', value)}
                            />
                            <Select
                                options={promoOptions}
                                label="Promo"
                                id="promo-select"
                                value={extraInfo[selectedTicketId]?.promo || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'promo', value)}
                            />
                            <Select
                                options={marketingOptions}
                                label="Marketing"
                                id="marketing-select"
                                value={extraInfo[selectedTicketId]?.marketing || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'marketing', value)}
                            />
                            <Select
                                options={serviceTypeOptions}
                                label="Service"
                                id="service-select"
                                value={extraInfo[selectedTicketId]?.service || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'service', value)}
                            />
                            <Select
                                options={countryOptions}
                                label="Country"
                                id="country-select"
                                value={extraInfo[selectedTicketId]?.country || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'country', value)}
                            />
                            <Select
                                options={transportOptions}
                                label="Transport"
                                id="transport-select"
                                value={extraInfo[selectedTicketId]?.transport || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'transport', value)}
                            />
                            <Select
                                options={nameExcursionOptions}
                                label="Excursie"
                                id="excursie-select"
                                value={extraInfo[selectedTicketId]?.excursion || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'excursion', value)}
                            />
                            <div className='date-go-back'>
                                <div className='label-data-go'>
                                    <div>Data plecarii</div>
                                    <DatePicker
                                        showIcon
                                        selected={extraInfo[selectedTicketId]?.leave_date || null}
                                        onChange={(date) => handleSelectChange(selectedTicketId, 'leave_date', date)}
                                        isClearable
                                        placeholderText="Alegeti data și ora plecării"
                                        dateFormat="dd.MM.yyyy"
                                        // dateFormat="dd.MM.yyyy HH:mm"
                                        // showTimeSelect
                                        // timeFormat="HH:mm"
                                        // timeIntervals={15} // Интервалы времени, например, каждые 15 минут
                                        // timeCaption="Ora"  // Заголовок для секции времени
                                        customInput={<input className="example-custom-input" />}  // Правильный синтаксис для customInput
                                    />
                                </div>
                                <div className='label-data-back'>
                                    <div>Data intoarcerii</div>
                                    <DatePicker
                                        showIcon
                                        selected={extraInfo[selectedTicketId]?.arrive_date || null}
                                        onChange={(date) => handleSelectChange(selectedTicketId, 'arrive_date', date)}
                                        isClearable
                                        placeholderText="Alegeti data si ora intoarcerii"
                                        dateFormat="dd.MM.yyyy"
                                        // dateFormat="dd.MM.yyyy HH:mm"
                                        // showTimeSelect
                                        // timeFormat="HH:mm"
                                        // timeIntervals={15} // Интервалы времени, например, каждые 15 минут
                                        // timeCaption="Ora"
                                        customInput={<input className="example-custom-input" />}  // Правильный синтаксис для customInput
                                    />
                                </div>
                            </div>
                            <Select
                                options={purchaseProcessingOptions}
                                label="Purchase"
                                id="purchase-select"
                                value={extraInfo[selectedTicketId]?.purchase || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'purchase', value)}
                            />
                            <Input
                                label="Nr de contract"
                                type="text"
                                value={extraInfo[selectedTicketId]?.contract_id || ""}
                                onChange={(e) =>
                                    handleSelectChange(selectedTicketId, 'contract_id', e.target.value)
                                }
                                className="input-field"
                                placeholder="Nr contract"
                                id="contract-number-input"
                            />
                            <div className='date-contract-container'>
                                <div>Data contractului</div>
                                <DatePicker
                                    showIcon
                                    selected={extraInfo[selectedTicketId]?.contract_date || null}
                                    onChange={(date) => handleSelectChange(selectedTicketId, 'contract_date', date)}
                                    isClearable
                                    placeholderText="Data contractului"
                                    dateFormat="dd.MM.yyyy"
                                    // dateFormat="dd.MM.yyyy HH:mm"
                                    // showTimeSelect
                                    // timeFormat="HH:mm"
                                    // timeIntervals={15} // Интервалы времени, например, каждые 15 минут
                                    // timeCaption="Ora"
                                    customInput={<input className="example-custom-input" />}  // Правильный синтаксис для customInput
                                />
                            </div>
                            <Input
                                label="Tour operator"
                                type="text"
                                value={extraInfo[selectedTicketId]?.tour_operator || ""}
                                onChange={(e) =>
                                    handleSelectChange(selectedTicketId, 'tour_operator', e.target.value)
                                }
                                className="input-field"
                                placeholder="Tour operator"
                                id="tour-operator-input"
                            />
                            <Input
                                label="Nr cererii de la operator"
                                type="text"
                                value={extraInfo[selectedTicketId]?.request_id || ""}
                                onChange={(e) =>
                                    handleSelectChange(selectedTicketId, 'request_id', e.target.value)
                                }
                                className="input-field"
                                placeholder="Nr cererii de la operator"
                                id="tour-operator-input"
                            />
                            <Input
                                label="Pret neto (euro)"
                                type="number"
                                value={extraInfo[selectedTicketId]?.price_netto || ""}
                                onChange={(e) =>
                                    handleSelectChange(selectedTicketId, 'price_netto', e.target.value)
                                }
                                className="input-field"
                                placeholder="Pret neto"
                                id="price-neto-input"
                            />
                            <Input
                                label="Comision companie"
                                type="number"
                                value={extraInfo[selectedTicketId]?.commission || ""}
                                onChange={(e) =>
                                    handleSelectChange(selectedTicketId, 'commission', e.target.value)
                                }
                                className="input-field"
                                placeholder="Comision"
                                id="commission-input"
                            />
                            <Select
                                options={paymentStatusOptions}
                                label="Payment"
                                id="payment-select"
                                value={extraInfo[selectedTicketId]?.payment_method || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'payment_method', value)}
                            />
                        </div>
                        <div className="extra-info-actions">
                            <button onClick={sendExtraInfo} className="send-extra-info-button">
                                {isLoading ? 'Waiting...' : 'Actualizare'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatComponent;