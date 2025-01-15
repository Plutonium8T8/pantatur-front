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
import Icon from '../../Components/Icon/index';

const ChatComponent = ({ }) => {
    const { userId } = useUser();
    const [managerMessage, setManagerMessage] = useState('');
    const [messages1, setMessages1] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [selectClientId, setSelectClientId] = useState(null);
    const [extraInfo, setExtraInfo] = useState({}); // Состояние для дополнительной информации каждого тикета
    const [personalData, setPersonalData] = useState({}); // Состояние для дополнительной информации каждого тикета
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
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [selectedReaction, setSelectedReaction] = useState({});
    const reactionContainerRef = useRef(null);
    const menuRefs = useRef({}); // Создаем объект для хранения ref всех меню
    const [filteredTickets, setFilteredTickets] = useState(tickets1);
    const [activeTab, setActiveTab] = useState('extraForm'); // По умолчанию вкладка Extra Form

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
                // window.location.reload(); // Перезагрузка страницы
                return;
            }

            if (!response.ok) {
                throw new Error('Ошибка при получении данных');
            }

            const data = await response.json();
            console.log("tickets+++++", data);
            setTickets1(data); // Устанавливаем данные тикетов
        } catch (error) {
            console.error('Ошибка:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    const fetchTicketsDetail = async () => {
        if (!selectedTicketId) {
            console.warn('Не выбран Ticket ID для запроса.');
            return;
        }

        setIsLoading(true); // Показываем индикатор загрузки
        try {
            const token = Cookies.get('jwt');
            const response = await fetch(`https://pandatur-api.com/api/tickets/${selectedTicketId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                console.warn('Ошибка 401: Неавторизован. Перенаправляем на логин.');
                return;
            }

            if (!response.ok) {
                throw new Error('Ошибка при получении данных');
            }

            const data = await response.json();
            console.log("Ticket Details:", data);
            console.log("setSelectedTechnicianId", data.technician_id);
            // Предположим, что сервер возвращает technician_id, связанный с этим тикетом
            if (data.technician_id) {
                setSelectedTechnicianId(data.technician_id); // Обновляем ID техника в состоянии
            }
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedTicketId) {
            fetchTicketsDetail();
        }
    }, [selectedTicketId]);

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

        } catch (error) {
            enqueueSnackbar('Ошибка при получении дополнительной информации', { variant: 'error' });
            console.error('Ошибка при получении дополнительной информации:', error);
        }
    };


    // Загружаем тикеты при монтировании компонента
    useEffect(() => {
        fetchTickets();
    }, []);

    const getClientMessages = async () => {
        try {
            // Получаем токен из cookies
            const token = Cookies.get('jwt');
            if (!token) {
                console.warn('Нет токена. Пропускаем загрузку сообщений.');
                return;
            }

            // Отправляем запрос на сервер
            const response = await fetch('https://pandatur-api.com/messages', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Проверяем, успешен ли запрос
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
            }

            // Парсим данные
            const data = await response.json();

            // Логируем полученные данные (опционально)
            console.log('Сообщения клиента:', data);

            // Обновляем состояние с сообщениями
            setMessages1(data);
        } catch (error) {
            // Обработка ошибок
            enqueueSnackbar('Не удалось получить сообщения!', { variant: 'error' });
            console.error('Ошибка при получении сообщений:', error.message);
        }
    };

    // Вызываем функцию (например, через useEffect)
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

    // отправка данных формы в бэк
    const sendExtraInfo = async () => {
        const token = Cookies.get('jwt'); // Получение токена из cookie
        const ticketExtraInfo = extraInfo[selectedTicketId]; // Получаем информацию для выбранного тикета

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
                }),
            });

            // Логируем отправляемые данные
            console.log('Отправляемые данные:', {
                ...ticketExtraInfo,
            });

            if (!response.ok) {
                throw new Error(`Ошибка при отправке данных. Статус: ${response.status}`);
            }

            const result = await response.json();

            enqueueSnackbar('Данные успешно обновлены', { variant: 'success' });
            console.log('Данные успешно отправлены:', result);
        } catch (error) {
            enqueueSnackbar('Ошибка при обновлении дополнительной информации', { variant: 'error' });
            console.error('Ошибка при отправке дополнительной информации:', error);
        } finally {
            setIsLoading(false); // Отключаем индикатор загрузки
        }
    };

    // изминения значения workflow из экстра формы
    const handleWorkflowChange = async (event) => {
        const newWorkflow = event.target.value;

        if (!selectedTicketId) {
            console.warn('Тикет не выбран.');
            enqueueSnackbar('Ошибка: Тикет не выбран.', { variant: 'error' });
            return;
        }

        // Проверяем, что tickets1 — это массив, и ищем тикет
        const updatedTicket = Array.isArray(tickets1)
            ? tickets1.find(ticket => ticket.id === selectedTicketId)
            : null;

        if (!updatedTicket) {
            console.error('Ticket not found or tickets1 is not an array:', tickets1);
            enqueueSnackbar('Ошибка: Тикет не найден.', { variant: 'error' });
            return;
        }

        try {
            const token = Cookies.get("jwt");
            if (!token) {
                console.warn('Нет токена для авторизации.');
                enqueueSnackbar('Ошибка: Нет токена.', { variant: 'error' });
                return;
            }

            // Отправляем PATCH запрос
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
                throw new Error(`Ошибка при обновлении workflow: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            enqueueSnackbar('Статус тикета обновлен!', { variant: 'success' });

            // Обновляем локальное состояние
            setTickets1((prevTickets) =>
                Array.isArray(prevTickets)
                    ? prevTickets.map(ticket =>
                        ticket.id === updatedTicket.id ? { ...ticket, workflow: newWorkflow } : ticket
                    )
                    : prevTickets
            );

            console.log("Workflow обновлен:", data);
        } catch (error) {
            enqueueSnackbar('Ошибка: Статус тикета не обновлен.', { variant: 'error' });
            console.error('Ошибка при обновлении workflow:', error.message);
        }
    };

    const updatedTicket = Array.isArray(tickets1) && tickets1.length > 0
        ? tickets1.find(ticket => ticket.id === selectedTicketId)
        : null;

    // if (!updatedTicket) {
    //     console.error('Ошибка: Тикет не найден или tickets1 не является массивом.', {
    //         tickets1,
    //         selectedTicketId,
    //     });
    //     // enqueueSnackbar('Ошибка: Тикет не найден.', { variant: 'error' });
    // }

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
            if (editMessageId) {
                handleSave(); // Сохраняем изменения, если редактируем сообщение
            } else {
                handleClick(selectedTicketId); // Отправляем новое сообщение
            }
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
        setSelectedTicketId(ticketId);

        const selectedTicket = tickets1.find((ticket) => ticket.id === ticketId);

        if (selectedTicket) {
            setSelectedTechnicianId(selectedTicket.technician_id || null);
            setSelectClientId(selectedTicket.client_id); // Сохраняем client_id в состоянии
        } else {
            console.warn('Тикет не найден!');
            setSelectedTechnicianId(null);
            setSelectClientId(null); // Сбрасываем client_id
        }

        console.log('Selected Client ID:', selectedTicket?.client_id);
        navigate(`/chat/${ticketId}`);
        getClientMessages();
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

                        case 'seen':
                            console.log("Сообщение отмечено как прочитанное");
                            break;

                        case 'react':
                            console.log("Реакция на сообщение");
                            break;

                        case 'edit':
                            console.log('Сообщения обновлены после редактирования.');
                            break;

                        case 'delete':
                            console.log("Сообщение удалено");
                            break;

                        default:
                            console.warn('Неизвестный тип сообщения:', message);
                    }
                } catch (error) {
                    console.error('Ошибка при разборе WebSocket сообщения:', error);
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
    }, [socket, selectedTicketId, getClientMessages, enqueueSnackbar]);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Закрытие меню при клике вне его области
    const handleOutsideClick = (event) => {
        // Проверяем, есть ли клик вне любого открытого меню
        const isOutside = Object.keys(menuRefs.current).every(
            (key) =>
                menuRefs.current[key] && !menuRefs.current[key].contains(event.target)
        );

        if (isOutside) {
            setMenuMessageId(null); // Закрываем меню
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    const handleMenuToggle = (msgId) => {
        setMenuMessageId(menuMessageId === msgId ? null : msgId);
    };

    const handleDelete = (msgId) => {
        setMenuMessageId(null);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    type: 'delete',
                    data: {
                        message_id: msgId,
                        client_id: userId,
                    },
                })
            );
        } else {
            alert('Соединение с WebSocket отсутствует');
        }
    };

    const handleEdit = (msg) => {
        setMenuMessageId(null);
        setEditMessageId(msg.id);
        setManagerMessage(msg.message); // Устанавливаем текст сообщения в textarea
    };

    const handleSave = () => {
        if (managerMessage.trim() === '') {
            alert('Сообщение не может быть пустым');
            return;
        }

        if (socket && socket.readyState === WebSocket.OPEN) {
            const payload = {
                type: 'edit',
                data: {
                    message_id: editMessageId, // Используется правильный идентификатор сообщения
                    sender_id: userId,
                    new_text: managerMessage,
                    edited_at: new Date().toISOString(),
                },
            };

            try {
                socket.send(JSON.stringify(payload));
                setEditMessageId(null); // Сбрасываем состояние редактирования
                setManagerMessage(''); // Очищаем textarea
            } catch (error) {
                console.error('Ошибка при сохранении:', error);
            }
        } else {
            alert('WebSocket не подключен');
        }
    };

    const handleCancel = () => {
        setEditMessageId(null);
        setManagerMessage('');
    };

    // Обработчик клика по реакции
    const handleReactionClick = (reaction, messageId) => {
        // Всегда обновляем реакцию
        setSelectedReaction((prev) => ({
            ...prev,
            [messageId]: reaction, // Устанавливаем новую реакцию (заменяем старую)
        }));

        // Отправляем реакцию на сервер
        sendReaction(messageId, userId, reaction);
    };

    // Пример функции sendReaction с подтверждением от сервера
    const sendReaction = (messageId, senderId, reaction) => {
        return new Promise((resolve, reject) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const payload = {
                    type: 'react',
                    data: {
                        message_id: messageId,
                        sender_id: senderId,
                        reaction: { senderId, reaction },
                    },
                };

                console.log('Отправка реакции на сервер:', JSON.stringify(payload, null, 2)); // Лог отправляемых данных

                socket.send(JSON.stringify(payload));

                // Ожидание подтверждения от сервера
                socket.onmessage = (event) => {
                    console.log('Получен ответ от сервера:', event.data); // Лог ответа сервера

                    try {
                        const response = JSON.parse(event.data);

                        if (
                            response.type === 'react' &&
                            response.data.message_id === messageId
                        ) {
                            console.log('Реакция успешно обработана:', response.data); // Лог успешного результата
                            resolve(response.data); // Сервер подтвердил реакцию
                        } else {
                            console.error('Неверный тип ответа или несоответствие ID:', response);
                            reject(new Error('Неверный ответ от сервера.'));
                        }
                    } catch (error) {
                        console.error('Ошибка при разборе ответа от сервера:', error); // Лог ошибок парсинга
                        reject(new Error('Ошибка обработки ответа сервера.'));
                    }
                };
            } else {
                console.error('Ошибка: Соединение с WebSocket отсутствует.'); // Лог при отсутствии соединения
                reject(new Error('Соединение с WebSocket отсутствует.'));
            }
        });
    };

    const getLastReaction = (message) => {
        if (!message.reactions) {
            return '☺'; // Возвращаем '☺', если реакции отсутствуют
        }

        try {
            // Убираем внешние фигурные скобки и разделяем строку на массив реакций
            const reactionsArray = message.reactions
                .replace(/^{|}$/g, '') // Удаляем внешние фигурные скобки
                .split('","') // Разделяем строки реакций
                .map((reaction) => reaction.replace(/(^"|"$)/g, '').trim()); // Убираем кавычки

            // Парсим JSON-объекты и извлекаем поле `reaction`
            const parsedReactions = reactionsArray.map((reaction) => {
                try {
                    // Удаляем экранированные кавычки и парсим строку
                    const normalizedReaction = reaction.replace(/\\\"/g, '"');
                    const parsed = JSON.parse(normalizedReaction); // Пытаемся распарсить как JSON
                    return parsed.reaction; // Возвращаем только поле `reaction`
                } catch {
                    return reaction; // Если парсинг не удался, возвращаем оригинальную строку (эмодзи)
                }
            });

            // Возвращаем только последнюю реакцию
            return parsedReactions.length > 0
                ? parsedReactions[parsedReactions.length - 1]
                : '☺';
        } catch (error) {
            console.error('Ошибка при обработке реакций:', error);
            return '☺'; // Значение по умолчанию при ошибке
        }
    };

    // Обработчик клика вне контейнера
    const handleClickOutsideReaction = (event) => {
        if (
            reactionContainerRef.current &&
            !reactionContainerRef.current.contains(event.target)
        ) {
            setSelectedMessageId(null); // Закрываем реакции
        }
    };

    // Привязка обработчика события к документу
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutsideReaction);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideReaction);
        };
    }, []);
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleEmojiClick = (emojiObject) => {
        // Вставка эмодзи в сообщение
        setManagerMessage((prevMessage) => prevMessage + emojiObject.emoji);
        console.log(emojiObject.emoji); // Логируем выбранный эмодзи
    };

    const handleEmojiClickButton = (event) => {
        const rect = event.target.getBoundingClientRect();
        const emojiPickerHeight = 450; // Предполагаемая высота эмодзи-пикера

        // Устанавливаем позицию эмодзи-пикера
        setEmojiPickerPosition({
            top: rect.top + window.scrollY - emojiPickerHeight, // Смещаем вверх
            left: rect.left + window.scrollX,
        });

        // Открываем или закрываем пикер при клике на иконку
        setShowEmojiPicker((prev) => !prev);
    };

    // Обработчик клика вне области эмодзи-пикера, чтобы закрыть пикер
    const handleClickOutside = (event) => {
        // Закрытие пикера только если клик был вне области контейнера пикера
        if (!event.target.closest('.emoji-picker-container') && !event.target.closest('.emoji-picker-popup')) {
            setShowEmojiPicker(false);
        }
    };

    // Добавляем обработчик события для клика вне пикера
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);


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

    // Функция для загрузки файла
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = Cookies.get('jwt'); // Используем JWT токен для авторизации

        console.log('Preparing to upload file...');
        console.log('FormData:', formData);

        try {
            const response = await fetch('https://pandatur-api.com/messages/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('File uploaded successfully:', data);
                return data; // Сервер должен вернуть объект с полем `url`
            } else {
                const errorMessage = `Failed to upload file. Status: ${response.status}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    // Обработчик выбора файла
    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files[0];
        console.log('Selected file:', selectedFile ? selectedFile.name : 'No file selected');

        if (selectedFile) {
            try {
                console.log('Uploading and sending file...');
                await sendMessage(selectedFile); // Передаем файл напрямую
                console.log('File uploaded and message sent!');
            } catch (error) {
                console.error('Error processing file:', error);
            }
        } else {
            console.log('No file selected.');
        }
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleTechnicianChange = async (newTechnicianId) => {
        setSelectedTechnicianId(newTechnicianId);

        if (!selectedTicketId || !newTechnicianId) {
            console.warn('Не выбран тикет или техник.');
            return;
        }

        try {
            const token = Cookies.get('jwt');
            const response = await fetch(`https://pandatur-api.com/api/tickets/${selectedTicketId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ technician_id: newTechnicianId }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при обновлении technician_id. Код: ${response.status}`);
            }

            const updatedTicket = await response.json();
            console.log('Тикет успешно обновлён:', updatedTicket);

            // Вызов fetchTickets для обновления списка тикетов
            await fetchTickets();
            console.log('Список тикетов успешно обновлён.');
        } catch (error) {
            console.error('Ошибка при обновлении technician_id:', error.message);
        }
    };


    // Отправка сообщения
    const sendMessage = async (selectedFile) => {
        if (!managerMessage.trim() && !selectedFile) {
            return; // Если нет сообщения или файла — ничего не отправляем
        }
    
        // Функция для получения платформы последнего сообщения
        const analyzeLastMessagePlatform = () => {
            const clientMessages = messages1.filter((msg) => msg.client_id === selectClientId);
            const lastMessage = clientMessages.length > 0
                ? clientMessages.reduce((latest, current) =>
                    new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
                )
                : null;
    
            return lastMessage?.platform || 'web'; // Возвращаем платформу или 'web' по умолчанию
        };
    
        const platform = analyzeLastMessagePlatform();
    
        if (platform !== 'web') {
            console.log('Платформа не web. Отправляем через fetch.');
            try {
                const currentTime = new Date().toISOString();
                const messageData = {
                    sender_id: Number(userId),
                    client_id: selectClientId, // Передаем идентификатор напрямую
                    platform: platform,
                    message: selectedFile ? 'File URL' : managerMessage, // Заменяем message на text
                    time_sent: currentTime, // Убедитесь, что это поле ожидается сервером
                };
    
                if (selectedFile) {
                    const uploadResponse = await uploadFile(selectedFile);
                    messageData.text = uploadResponse.url;
                }
    
                await fetch('https://pandatur-api.com/messages/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${Cookies.get('jwt')}`,
                    },
                    body: JSON.stringify(messageData),
                });
    
                console.log('Сообщение успешно отправлено через fetch:', messageData);
                setMessages1((prevMessages) => [
                    ...prevMessages,
                    { ...messageData, seen_at: false },
                ]);
    
                if (!selectedFile) setManagerMessage(''); // Очищаем текстовое поле
            } catch (error) {
                console.error('Ошибка отправки через fetch:', error);
            }
        } else if (socket) {
            console.log('Платформа web. Отправляем через WebSocket.');
    
            if (socket.readyState === WebSocket.OPEN) {
                const currentTime = new Date().toISOString();
                try {
                    let fileUrl = null;
    
                    if (selectedFile) {
                        const uploadResponse = await uploadFile(selectedFile);
                        fileUrl = uploadResponse.url;
                        const fileMessageData = {
                            type: 'message',
                            data: {
                                sender_id: Number(userId),
                                client_id: [selectedTicketId],
                                platform: 'web',
                                text: fileUrl,
                                time_sent: currentTime,
                            },
                        };
                        socket.send(JSON.stringify(fileMessageData));
                        console.log('Файл отправлен через WebSocket:', fileMessageData);
                        setMessages1((prevMessages) => [
                            ...prevMessages,
                            { ...fileMessageData.data, seen_at: false },
                        ]);
                        await getClientMessages();
                    }
    
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
                        console.log('Текстовое сообщение отправлено через WebSocket:', textMessageData);
    
                        setMessages1((prevMessages) => [
                            ...prevMessages,
                            { ...textMessageData.data, seen_at: false },
                        ]);
    
                        setManagerMessage(''); // Очищаем текстовое поле
                        await getClientMessages();
                    }
                } catch (error) {
                    console.error('Ошибка отправки через WebSocket:', error);
                }
            } else {
                console.error('WebSocket не подключен. Пожалуйста, перезагрузите страницу.');
            }
        } else {
            console.error('Соединение WebSocket отсутствует.');
        }
    };    

    useEffect(() => {
        setFilteredTickets(tickets1); // Устанавливаем все тикеты по умолчанию
    }, [tickets1]);

    const updateTickets = (tickets) => {
        setFilteredTickets(tickets);
    };

    const handleTicketSelect = (ticket) => {
        setSelectedTicketId(ticket.id);
        setSelectedTechnicianId(ticket.technician_id || null); // Если technician_id нет, передаем null
    };

    const handlePersonalDataSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            name: extraInfo[selectedTicketId]?.name || "",
            surname: extraInfo[selectedTicketId]?.surname || "",
            date_of_birth: extraInfo[selectedTicketId]?.date_of_birth || "",
            id_card_series: extraInfo[selectedTicketId]?.id_card_series || "",
            id_card_number: extraInfo[selectedTicketId]?.id_card_number || "",
            id_card_release: extraInfo[selectedTicketId]?.id_card_release || "",
            idnp: extraInfo[selectedTicketId]?.idnp || "",
            address: extraInfo[selectedTicketId]?.address || "",
            phone: extraInfo[selectedTicketId]?.phone || "",
        };

        try {
            const token = Cookies.get('jwt');
            const response = await fetch(`https://pandatur-api.com/users-extended/${selectClientId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to submit data: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Data submitted successfully:", result);
            alert("Personal data saved successfully!");
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("Failed to save personal data.");
        }
    };

    return (
        <div className="chat-container">
            <div className="users-container">
                <h3>Chat List</h3>
                <div className='filter-container-chat'>
                    <input
                        type="text"
                        placeholder="Id or name"
                        onInput={(e) => {
                            const filterValue = e.target.value.toLowerCase();
                            document.querySelectorAll(".chat-item").forEach((item) => {
                                const ticketId = item.querySelector(".tickets-descriptions div:nth-child(2)").textContent.toLowerCase();
                                const ticketContact = item.querySelector(".tickets-descriptions div:nth-child(1)").textContent.toLowerCase();
                                if (ticketId.includes(filterValue) || ticketContact.includes(filterValue)) {
                                    item.style.display = "flex";
                                } else {
                                    item.style.display = "none";
                                }
                            });
                        }}
                        className="ticket-filter-input"
                    />
                    <label>
                        <input
                            type="checkbox"
                            id="myTicketsCheckbox"
                            onChange={(e) => {
                                const showMyTickets = e.target.checked;
                                const filtered = showMyTickets
                                    ? tickets1.filter(ticket => ticket.technician_id === userId)
                                    : tickets1;
                                updateTickets(filtered);
                            }}
                        />
                        My tickets
                    </label>
                </div>
                <div className="chat-item-container">
                    {Array.isArray(filteredTickets) && filteredTickets.length > 0 ? (
                        filteredTickets
                            .sort((a, b) => {
                                const clientMessagesA = messages1.filter((msg) => msg.client_id === a.client_id);
                                const clientMessagesB = messages1.filter((msg) => msg.client_id === b.client_id);

                                const lastMessageA = clientMessagesA.length
                                    ? clientMessagesA.reduce((latest, current) =>
                                        new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
                                    )
                                    : { time_sent: null };

                                const lastMessageB = clientMessagesB.length
                                    ? clientMessagesB.reduce((latest, current) =>
                                        new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
                                    )
                                    : { time_sent: null };

                                return new Date(lastMessageB.time_sent) - new Date(lastMessageA.time_sent);
                            })
                            .map((ticket) => {
                                const clientMessages = messages1.filter((msg) => msg.client_id === ticket.client_id);

                                const unreadCounts = clientMessages.filter(
                                    (msg) =>
                                        (!msg.seen_by || !msg.seen_by.includes(String(userId))) &&
                                        msg.sender_id !== Number(userId)
                                ).length;

                                const lastMessage = clientMessages.length
                                    ? clientMessages.reduce((latest, current) =>
                                        new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
                                    )
                                    : { message: '', time_sent: null };

                                const formattedTime = lastMessage.time_sent
                                    ? new Date(lastMessage.time_sent).toLocaleTimeString('ru-RU', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : null;

                                const parseTags = (tags) => {
                                    if (Array.isArray(tags)) {
                                        return tags;
                                    }
                                    if (typeof tags === 'string') {
                                        // Проверяем, начинается ли строка с '{' и заканчивается на '}'
                                        if (tags.startsWith('{') && tags.endsWith('}')) {
                                            const content = tags.slice(1, -1).trim(); // Убираем фигурные скобки и пробелы
                                            if (content === '') {
                                                return []; // Если содержимое пустое, возвращаем пустой массив
                                            }
                                            return content.split(',').map(tag => tag.trim()); // Разделяем по запятым и удаляем лишние пробелы
                                        }

                                        try {
                                            return JSON.parse(tags); // Пробуем парсить строку как JSON
                                        } catch (error) {
                                            console.error('Ошибка разбора JSON:', error, tags);
                                            return [];
                                        }
                                    }
                                    return [];
                                };

                                const tags = parseTags(ticket.tags);

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
                                                <div className="tags-ticket">
                                                    {Array.isArray(tags) && tags.length > 0 ? (
                                                        tags.map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                style={{
                                                                    display: 'inline-block',
                                                                    backgroundColor: '#007bff',
                                                                    color: '#fff',
                                                                    padding: '5px 10px',
                                                                    borderRadius: '20px',
                                                                    marginRight: '5px',
                                                                    fontSize: '12px',
                                                                }}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        tags?.length === 0 ? null : <div>no tags</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="container-time-tasks-chat">
                                            <div className="info-message">
                                                <div className="last-message-container">
                                                    <div className="last-message-ticket">{lastMessage.message || 'No messages'}</div>
                                                    <div>{formattedTime || '—'}</div>
                                                    {unreadCounts > 0 && (
                                                        <div className="unread-count">{unreadCounts}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    ) : (
                        <div>No tickets available</div>
                    )}
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
                        .filter((msg) => {
                            // Находим client_id текущего тикета
                            const clientId = tickets1.find((ticket) => ticket.id === selectedTicketId)?.client_id;
                            return msg.client_id === clientId;
                        })
                        .sort((a, b) => new Date(a.time_sent) - new Date(b.time_sent))
                        .map((msg) => {
                            const uniqueKey = msg.id || `${msg.client_id}-${msg.time_sent}`;

                            // Проверка типа контента
                            const isImageUrl = /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(msg.message);
                            const isFileUrl = /\.(pdf|docx|xlsx|pptx)$/i.test(msg.message);
                            const isAudioUrl = /\.(mp3)$/i.test(msg.message);

                            // Функция открытия изображения
                            const openImageInNewWindow = (url) => {
                                const newWindow = window.open('', '_blank');
                                newWindow.document.write(`
                        <html>
                            <head>
                                <title>Просмотр изображения</title>
                                <style>
                                    body {
                                        display: flex;
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
                                </style>
                            </head>
                            <body>
                                <img src="${url}" alt="Просмотр изображения" />
                            </body>
                        </html>
                    `);
                                newWindow.document.close();
                            };

                            const lastReaction = getLastReaction(msg);

                            return (
                                <InView
                                    key={uniqueKey}
                                    onChange={(inView) => handleInView(inView, msg)}
                                    threshold={0.1}
                                >
                                    {({ ref }) => (
                                        <div
                                            ref={ref}
                                            className={`message ${msg.sender_id === userId ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-content">
                                                <div className="message-row">
                                                    <div className="text">
                                                        {isImageUrl ? (
                                                            <img
                                                                src={msg.message}
                                                                alt="Отправленное изображение"
                                                                className="image-preview"
                                                                onClick={() => openImageInNewWindow(msg.message)}
                                                            />
                                                        ) : isFileUrl ? (
                                                            <a
                                                                href={msg.message}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="file-link"
                                                            >
                                                                Открыть файл: {msg.message.split('/').pop()}
                                                            </a>
                                                        ) : isAudioUrl ? (
                                                            <audio controls>
                                                                <source src={msg.message} type="audio/mpeg" />
                                                                Ваш браузер не поддерживает воспроизведение аудио.
                                                            </audio>
                                                        ) : (
                                                            msg.message
                                                        )}
                                                        <div className="message-time">
                                                            <div
                                                                className="reaction-toggle-button"
                                                                onClick={() =>
                                                                    setSelectedMessageId(selectedMessageId === msg.id ? null : msg.id)
                                                                }
                                                            >
                                                                {lastReaction || '☺'}
                                                            </div>
                                                            {new Date(msg.time_sent).toLocaleTimeString('ru-RU', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>
                                                        {selectedMessageId === msg.id && (
                                                            <div className="reaction-container" ref={reactionContainerRef}>
                                                                <div className="reaction-buttons">
                                                                    {['☺', '👍', '❤️', '😂', '😮', '😢', '😡'].map((reaction) => (
                                                                        <div
                                                                            key={reaction}
                                                                            onClick={() => handleReactionClick(reaction, msg.id)}
                                                                            className={
                                                                                selectedReaction[msg.id] === reaction ? 'active' : ''
                                                                            }
                                                                        >
                                                                            {reaction}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {msg.sender_id === userId && (
                                                        <div
                                                            className="menu-container"
                                                            ref={(el) => (menuRefs.current[msg.id] = el)} // Устанавливаем отдельный ref для каждого меню
                                                        >
                                                            <button
                                                                className="menu-button"
                                                                onClick={() => handleMenuToggle(msg.id)}
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
                        placeholder="Введите сообщение..."
                        onKeyDown={handleKeyDown}
                    />
                    <div className="btn-send-message">
                        <Icon
                            name={"button-send"}
                            className="send-button"
                            onClick={editMessageId ? handleSave : handleClick}
                            disabled={!selectedTicketId}
                        />
                        <input
                            type="file"
                            accept="image/*,audio/mp3,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            id="file-input"
                        />
                        <label htmlFor="file-input" className="file-button">
                            📎
                        </label>
                    </div>
                    <div className="container-template">
                        <div className="emoji-picker-container">
                            <button
                                className="emoji-button"
                                onClick={handleEmojiClickButton}
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
                                            zIndex: 1000,
                                        }}
                                        onMouseEnter={() => setShowEmojiPicker(true)}
                                        onMouseLeave={() => setShowEmojiPicker(false)}
                                    >
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>,
                                    document.body
                                )}
                        </div>
                        <div className="select-shablon">
                            <Select
                                options={templateOptions}
                                id="message-template"
                                value={selectedMessage ?? undefined}
                                onChange={handleSelectTChange}
                                placeholder="Выберите сообщение"
                                customClassName="custom-select-1"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="extra-info">
                <div className="tabs">
                    <button
                        className={`tab-button ${activeTab === 'extraForm' ? 'active' : ''}`}
                        onClick={() => setActiveTab('extraForm')}
                    >
                        Extra Form
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'personalData' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personalData')}
                    >
                        Personal Data
                    </button>
                </div>
                <div className="tab-content">
                    {activeTab === 'extraForm' && (
                        <div className="extra-info-content">
                            <h3>Additional Information</h3>
                            {selectedTicketId && (
                                <>
                                    <div className="selects-container">
                                        <Workflow
                                            ticket={updatedTicket}
                                            onChange={handleWorkflowChange}
                                        />
                                        {isLoading ? (
                                            <p>Загрузка...</p>
                                        ) : (
                                            <TechnicianSelect
                                                selectedTechnicianId={selectedTechnicianId}
                                                onTechnicianChange={handleTechnicianChange}
                                            />
                                        )}
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
                                            onChange={(value) =>
                                                handleSelectChange(selectedTicketId, 'lead_source', value)
                                            }
                                        />
                                        <Select
                                            options={promoOptions}
                                            label="Promo"
                                            id="promo-select"
                                            value={extraInfo[selectedTicketId]?.promo || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectedTicketId, 'promo', value)
                                            }
                                        />
                                        <Select
                                            options={marketingOptions}
                                            label="Marketing"
                                            id="marketing-select"
                                            value={extraInfo[selectedTicketId]?.marketing || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectedTicketId, 'marketing', value)
                                            }
                                        />
                                        <Select
                                            options={serviceTypeOptions}
                                            label="Service"
                                            id="service-select"
                                            value={extraInfo[selectedTicketId]?.service || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectedTicketId, 'service', value)
                                            }
                                        />
                                        <Select
                                            options={countryOptions}
                                            label="Country"
                                            id="country-select"
                                            value={extraInfo[selectedTicketId]?.country || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectedTicketId, 'country', value)
                                            }
                                        />
                                        <Select
                                            options={transportOptions}
                                            label="Transport"
                                            id="transport-select"
                                            value={extraInfo[selectedTicketId]?.transport || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectedTicketId, 'transport', value)
                                            }
                                        />
                                        <Select
                                            options={nameExcursionOptions}
                                            label="Excursie"
                                            id="excursie-select"
                                            value={extraInfo[selectedTicketId]?.excursion || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectedTicketId, 'excursion', value)
                                            }
                                        />
                                        <div className="date-go-back">
                                            <div className="label-data-go">
                                                <div>Data plecarii</div>
                                                <DatePicker
                                                    showIcon
                                                    selected={extraInfo[selectedTicketId]?.leave_date || null}
                                                    onChange={(date) =>
                                                        handleSelectChange(selectedTicketId, 'leave_date', date)
                                                    }
                                                    isClearable
                                                    placeholderText="Alegeti data și ora plecării"
                                                    dateFormat="dd.MM.yyyy"
                                                    customInput={<input className="example-custom-input" />}
                                                />
                                            </div>
                                            <div className="label-data-back">
                                                <div>Data intoarcerii</div>
                                                <DatePicker
                                                    showIcon
                                                    selected={extraInfo[selectedTicketId]?.arrive_date || null}
                                                    onChange={(date) =>
                                                        handleSelectChange(selectedTicketId, 'arrive_date', date)
                                                    }
                                                    isClearable
                                                    placeholderText="Alegeti data si ora intoarcerii"
                                                    dateFormat="dd.MM.yyyy"
                                                    customInput={<input className="example-custom-input" />}
                                                />
                                            </div>
                                        </div>
                                        <Select
                                            options={purchaseProcessingOptions}
                                            label="Purchase"
                                            id="purchase-select"
                                            value={extraInfo[selectedTicketId]?.purchase || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectedTicketId, 'purchase', value)
                                            }
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
                                        <div className="date-contract-container">
                                            <div>Data contractului</div>
                                            <DatePicker
                                                showIcon
                                                selected={extraInfo[selectedTicketId]?.contract_date || null}
                                                onChange={(date) =>
                                                    handleSelectChange(selectedTicketId, 'contract_date', date)
                                                }
                                                isClearable
                                                placeholderText="Data contractului"
                                                dateFormat="dd.MM.yyyy"
                                                customInput={<input className="example-custom-input" />}
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
                                            onChange={(value) =>
                                                handleSelectChange(selectedTicketId, 'payment_method', value)
                                            }
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
                    )}
                    {activeTab === 'personalData' && (
                        <div className="personal-data-content">
                            <h3>Personal Data</h3>
                            <form onSubmit={handlePersonalDataSubmit}>
                                <Input
                                    label="Name"
                                    type="text"
                                    value={extraInfo[selectedTicketId]?.name || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedTicketId, 'name', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Enter name"
                                />
                                <Input
                                    label="Surname"
                                    type="text"
                                    value={extraInfo[selectedTicketId]?.surname || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedTicketId, 'surname', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Enter surname"
                                />
                                <Input
                                    label="Date of Birth"
                                    type="date"
                                    value={extraInfo[selectedTicketId]?.date_of_birth || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedTicketId, 'date_of_birth', e.target.value)
                                    }
                                    className="input-field"
                                />
                                <Input
                                    label="ID Card Series"
                                    type="text"
                                    value={extraInfo[selectedTicketId]?.id_card_series || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedTicketId, 'id_card_series', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Enter ID card series"
                                />
                                <Input
                                    label="ID Card Number"
                                    type="text"
                                    value={extraInfo[selectedTicketId]?.id_card_number || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedTicketId, 'id_card_number', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Enter ID card number"
                                />
                                <Input
                                    label="ID Card Release Date"
                                    type="date"
                                    value={extraInfo[selectedTicketId]?.id_card_release || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedTicketId, 'id_card_release', e.target.value)
                                    }
                                    className="input-field"
                                />
                                <Input
                                    label="IDNP"
                                    type="text"
                                    value={extraInfo[selectedTicketId]?.idnp || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedTicketId, 'idnp', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Enter IDNP"
                                />
                                <Input
                                    label="Address"
                                    type="text"
                                    value={extraInfo[selectedTicketId]?.address || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedTicketId, 'address', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Enter address"
                                />
                                <Input
                                    label="Phone"
                                    type="tel"
                                    value={extraInfo[selectedTicketId]?.phone || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectedTicketId, 'phone', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Enter phone number"
                                />
                                <button type="submit" className="save-button">
                                    Save Personal Data
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;