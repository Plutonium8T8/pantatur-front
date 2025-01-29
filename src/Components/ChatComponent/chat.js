import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import Input from '../InputComponent/InputComponent';
import Workflow from '../WorkFlowComponent/WorkflowComponent';
import "react-datepicker/dist/react-datepicker.css";
import { useAppContext } from '../../AppContext'; // Подключение AppContext
import { useSnackbar } from 'notistack';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import ReactDOM from "react-dom";
import { FaFile, FaPaperPlane, FaSmile } from 'react-icons/fa';
import { translations } from '../utils/translations';

const ChatComponent = ({ }) => {
    const { userId } = useUser();
    const [managerMessage, setManagerMessage] = useState('');
    const { tickets, updateTicket, setTickets, messages, setMessages, markMessagesAsRead, socketRef } = useAppContext();
    const [selectTicketId, setSelectTicketId] = useState(null);
    const [selectClientId, setSelectClientId] = useState(null);
    const [extraInfo, setExtraInfo] = useState({}); // Состояние для дополнительной информации каждого тикета
    const messageContainerRef = useRef(null);
    const { ticketId } = useParams(); // Получаем clientId из URL
    const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate(); // Хук для навигации
    const [menuMessageId, setMenuMessageId] = useState(null);
    const [editMessageId, setEditMessageId] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
    const [selectedMessage, setSelectedMessage] = useState(null); // Выбранный шаблон из Select
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [selectedReaction, setSelectedReaction] = useState({});
    const reactionContainerRef = useRef(null);
    const menuRefs = useRef({}); // Создаем объект для хранения ref всех меню
    const [filteredTickets, setFilteredTickets] = useState(tickets);
    const [activeTab, setActiveTab] = useState('extraForm'); // По умолчанию вкладка Extra Form
    const [showMyTickets, setShowMyTickets] = useState(false);
    const activeChatRef = useRef(null);
    const selectedTicket = tickets.find(ticket => ticket.id === selectTicketId);
    const clientId = selectedTicket ? selectedTicket.client_id : null;

    useEffect(() => {
        enqueueSnackbar("Тестовое уведомление работает!", { variant: "success" });
    }, []);

    useEffect(() => {
        if (ticketId) {
            setSelectTicketId(Number(ticketId));
        }
    }, [ticketId, setSelectTicketId]);

    // Прокручиваем к активному чату, если selectTicketId изменился и тикеты загружены
    useEffect(() => {
        if (!isLoading && activeChatRef.current) {
            activeChatRef.current.scrollIntoView({ behavior: "auto" });
        }
    }, [selectTicketId, isLoading, filteredTickets]);

    useEffect(() => {
        if (selectTicketId) {
            fetchTicketExtraInfo(selectTicketId); // Загружаем дополнительную информацию при изменении тикета
        }
    }, [selectTicketId]);

    // Получение дополнительной информации для тикета
    const fetchTicketExtraInfo = async (selectTicketId) => {
        try {
            const token = Cookies.get('jwt');
            const response = await fetch(`https://pandatur-api.com/ticket-info/${selectTicketId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Origin: 'https://plutonium8t8.github.io',
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
                [selectTicketId]: data, // Сохраняем информацию для текущего тикета
            }));

        } catch (error) {
            enqueueSnackbar('Ошибка при получении дополнительной информации', { variant: 'error' });
            console.error('Ошибка при получении дополнительной информации:', error);
        }
    };

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
        const ticketExtraInfo = extraInfo[selectTicketId]; // Получаем информацию для выбранного тикета

        if (!ticketExtraInfo) {
            console.warn('Нет дополнительной информации для выбранного тикета.', ticketExtraInfo);
            return;
        }
        setIsLoading(true); // Устанавливаем состояние загрузки в true

        try {
            const response = await fetch(`https://pandatur-api.com/ticket-info/${selectTicketId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Origin: 'https://plutonium8t8.github.io',
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

        if (!selectTicketId) {
            console.warn('Тикет не выбран.');
            enqueueSnackbar('Ошибка: Тикет не выбран.', { variant: 'error' });
            return;
        }

        // Находим тикет
        const updatedTicket = Array.isArray(tickets)
            ? tickets.find(ticket => ticket.id === selectTicketId)
            : null;

        if (!updatedTicket) {
            console.error('Ticket not found or tickets is not an array:', tickets);
            enqueueSnackbar('Ошибка: Тикет не найден.', { variant: 'error' });
            return;
        }

        try {
            // Используем функцию updateTicket из AppContext
            await updateTicket({
                id: updatedTicket.id,
                workflow: newWorkflow,
            });

            enqueueSnackbar('Статус тикета обновлен!', { variant: 'success' });

            // Локально обновляем состояние тикетов
            setTickets((prevTickets) =>
                Array.isArray(prevTickets)
                    ? prevTickets.map(ticket =>
                        ticket.id === updatedTicket.id
                            ? { ...ticket, workflow: newWorkflow }
                            : ticket
                    )
                    : prevTickets
            );

            console.log("Workflow обновлен:", newWorkflow);
        } catch (error) {
            enqueueSnackbar('Ошибка: Статус тикета не обновлен.', { variant: 'error' });
            console.error('Ошибка при обновлении workflow:', error.message);
        }
    };

    // Определяем выбранный тикет
    const updatedTicket = Array.isArray(tickets) && selectTicketId
        ? tickets.find(ticket => ticket.id === selectTicketId)
        : null;

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectTicketId]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Предотвращаем переход на новую строку
            if (editMessageId) {
                handleSave(); // Сохраняем изменения, если редактируем сообщение
            } else {
                handleClick(selectTicketId); // Отправляем новое сообщение
            }
        }
    };

    const handleClick = () => {
        sendMessage();
    };

    const handleTicketClick = (ticketId) => {
        setSelectTicketId(ticketId);

        const selectedTicket = tickets.find((ticket) => ticket.id === ticketId);

        if (selectedTicket) {
            setSelectedTechnicianId(selectedTicket.technician_id || null);
            setSelectTicketId(selectedTicket.id); // Сохраняем client_id в состоянии
        } else {
            console.warn('Тикет не найден!');
            setSelectedTechnicianId(null);
        }

        console.log('Selected Client ID:', selectedTicket?.id || "No change");
        navigate(`/chat/${ticketId}`);

        // Отправка события seen через WebSocket
        const readMessageData = {
            type: 'seen',
            data: {
                client_id: clientId,
                sender_id: Number(userId),
            },
        };

        try {
            const socketInstance = socketRef.current; // Используем socketRef.current
            if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
                socketInstance.send(JSON.stringify(readMessageData)); // Отправляем событие в WebSocket
                console.log(
                    `Все сообщения в чате с client_id=${ticketId} помечены как прочитанные.`
                );
            } else {
                console.warn('WebSocket не подключен или закрыт.');
            }

            markMessagesAsRead(clientId);
            // Локальное обновление сообщений как прочитанных
        } catch (error) {
            console.error('Ошибка при отправке события о прочтении:', error);
        }
    };


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

    // const handleDelete = (msgId) => {
    //     setMenuMessageId(null);
    //     if (socket && socket.readyState === WebSocket.OPEN) {
    //         socket.send(
    //             JSON.stringify({
    //                 type: 'delete',
    //                 data: {
    //                     message_id: msgId,
    //                     client_id: userId,
    //                 },
    //             })
    //         );
    //     } else {
    //         alert('Соединение с WebSocket отсутствует');
    //     }
    // };

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

        // if (socket && socket.readyState === WebSocket.OPEN) {
        //     const payload = {
        //         type: 'edit',
        //         data: {
        //             message_id: editMessageId, // Используется правильный идентификатор сообщения
        //             sender_id: userId,
        //             new_text: managerMessage,
        //             edited_at: new Date().toISOString(),
        //         },
        //     };

        //     try {
        //         socket.send(JSON.stringify(payload));
        //         setEditMessageId(null); // Сбрасываем состояние редактирования
        //         setManagerMessage(''); // Очищаем textarea
        //     } catch (error) {
        //         console.error('Ошибка при сохранении:', error);
        //     }
        // } else {
        //     alert('WebSocket не подключен');
        // }
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
        // sendReaction(messageId, userId, reaction);
    };

    // // Пример функции sendReaction с подтверждением от сервера
    // const sendReaction = (messageId, senderId, reaction) => {
    //     const language = localStorage.getItem('language') || 'RO';

    //     return new Promise((resolve, reject) => {
    //         if (socket && socket.readyState === WebSocket.OPEN) {
    //             const payload = {
    //                 type: 'react',
    //                 data: {
    //                     message_id: messageId,
    //                     sender_id: senderId,
    //                     reaction: { senderId, reaction },
    //                 },
    //             };

    //             console.log('Отправка реакции на сервер:', JSON.stringify(payload, null, 2)); // Лог отправляемых данных

    //             socket.send(JSON.stringify(payload));

    //             // Ожидание подтверждения от сервера
    //             socket.onmessage = (event) => {
    //                 console.log('Получен ответ от сервера:', event.data); // Лог ответа сервера

    //                 try {
    //                     const response = JSON.parse(event.data);

    //                     if (
    //                         response.type === 'react' &&
    //                         response.data.message_id === messageId
    //                     ) {
    //                         console.log('Реакция успешно обработана:', response.data); // Лог успешного результата
    //                         resolve(response.data); // Сервер подтвердил реакцию
    //                     } else {
    //                         console.error('Неверный тип ответа или несоответствие ID:', response);
    //                         reject(new Error('Неверный ответ от сервера.'));
    //                     }
    //                 } catch (error) {
    //                     console.error('Ошибка при разборе ответа от сервера:', error); // Лог ошибок парсинга
    //                     reject(new Error('Ошибка обработки ответа сервера.'));
    //                 }
    //             };
    //         } else {
    //             console.error('Ошибка: Соединение с WebSocket отсутствует.'); // Лог при отсутствии соединения
    //             reject(new Error('Соединение с WebSocket отсутствует.'));
    //         }
    //     });
    // };


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
        if (
            !event.target.closest('.emoji-button') && // Проверяем клик по кнопке
            !event.target.closest('.emoji-picker-popup') // Проверяем клик внутри меню эмодзи
        ) {
            setShowEmojiPicker(false); // Закрываем меню только если клик был вне
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

    const getMessageTypeLabel = (type) => {
        const typeLabels = {
            text: "Text Message",
            image: "Image Message",
            video: "Video Message",
            file: "File Message",
        };

        return typeLabels[type] || "Unknown Message";
    };

    const handleTechnicianChange = async (newTechnicianId) => {
        setSelectedTechnicianId(newTechnicianId);

        if (!selectTicketId || !newTechnicianId) {
            console.warn('Не выбран тикет или техник.');
            return;
        }

        try {
            const token = Cookies.get('jwt');
            const response = await fetch(`https://pandatur-api.com/tickets/${selectTicketId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Origin: 'https://plutonium8t8.github.io',
                },
                credentials: "include",
                body: JSON.stringify({ technician_id: newTechnicianId }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при обновлении technician_id. Код: ${response.status}`);
            }

            const updatedTicket = await response.json();
            console.log('Тикет успешно обновлён:', updatedTicket);

            // await fetchTickets();
            console.log('Список тикетов успешно обновлён.');
        } catch (error) {
            console.error('Ошибка при обновлении technician_id:', error.message);
        }
    };


    // Отправка сообщения
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = Cookies.get('jwt'); // Используем JWT токен для авторизации

        console.log('Подготовка к загрузке файла...');
        console.log('FormData:', formData);

        try {
            const response = await fetch('https://pandatur-api.com/messages/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Статус ответа:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Файл успешно загружен:', data);
                return data; // Ожидается объект с полем `url`
            } else {
                const errorMessage = `Ошибка загрузки файла. Статус: ${response.status}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Ошибка загрузки файла:', error);
            throw error;
        }
    };

    const sendMessage = async (selectedFile) => {
        if (!managerMessage.trim() && !selectedFile) {
            console.error('Ошибка: Отправка пустого сообщения невозможна.');
            return;
        }

        // Функция для получения платформы последнего сообщения
        const analyzeLastMessagePlatform = () => {
            const clientMessages = messages.filter((msg) => msg.client_id === selectClientId);
            const lastMessage = clientMessages.length > 0
                ? clientMessages.reduce((latest, current) =>
                    new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
                )
                : null;

            return lastMessage?.platform || 'web';
        };

        const platform = analyzeLastMessagePlatform();
        console.log(`Определённая платформа: ${platform}`);

        try {
            const messageData = {
                sender_id: Number(userId),
                client_id: selectClientId,
                platform: platform,
                message: managerMessage.trim(),
                media_type: null,
                media_url: "",
            };

            // Если файл выбран, загружаем его и добавляем данные в messageData
            if (selectedFile) {
                const uploadResponse = await uploadFile(selectedFile);
                messageData.media_url = uploadResponse.url; // URL загруженного файла
                messageData.media_type = getMediaType(selectedFile.type); // Определяем тип медиафайла
            }

            console.log('Отправляемые данные:', JSON.stringify(messageData, null, 2));

            const response = await fetch('https://pandatur-api.com/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Cookies.get('jwt')}`,
                    Origin: 'https://plutonium8t8.github.io',
                },
                body: JSON.stringify(messageData),
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error('Ошибка с сервера:', responseData.message);
                return;
            }

            console.log('Сообщение успешно отправлено:', messageData);

            setMessages((prevMessages) => [
                ...prevMessages,
                { ...messageData, seenAt: false },
            ]);

            if (!selectedFile) setManagerMessage(''); // Очищаем поле сообщения
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
        }
    };

    const language = localStorage.getItem('language') || 'RO';

    // Определение типа медиафайла
    const getMediaType = (mimeType) => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        return 'file'; // По умолчанию тип "файл"
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        setFilteredTickets(tickets); // Устанавливаем все тикеты по умолчанию
    }, [tickets]);

    const updateTickets = (tickets) => {
        setFilteredTickets(tickets);
    };

    const handleTicketSelect = (ticket) => {
        setSelectTicketId(ticket.id);
        setSelectedTechnicianId(ticket.technician_id || null); // Если technician_id нет, передаем null
    };

    const handlePersonalDataSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            name: extraInfo[selectTicketId]?.name || "",
            surname: extraInfo[selectTicketId]?.surname || "",
            date_of_birth: extraInfo[selectTicketId]?.date_of_birth || "",
            id_card_series: extraInfo[selectTicketId]?.id_card_series || "",
            id_card_number: extraInfo[selectTicketId]?.id_card_number || "",
            id_card_release: extraInfo[selectTicketId]?.id_card_release || "",
            idnp: extraInfo[selectTicketId]?.idnp || "",
            address: extraInfo[selectTicketId]?.address || "",
            phone: extraInfo[selectTicketId]?.phone || "",
        };

        try {
            const token = Cookies.get('jwt');
            const response = await fetch(`https://pandatur-api.com/users-extended/${selectTicketId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Origin: 'https://plutonium8t8.github.io',
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
        const filterValue = e.target.value.toLowerCase();
        document.querySelectorAll(".chat-item").forEach((item) => {
            const ticketId = item.querySelector(".tickets-descriptions div:nth-child(2)").textContent.toLowerCase();
            const ticketContact = item.querySelector(".tickets-descriptions div:nth-child(1)").textContent.toLowerCase();
            const tagsContainer = item.querySelector(".tags-ticket");
            const tags = Array.from(tagsContainer?.querySelectorAll("span") || []).map(tag => tag.textContent.toLowerCase());

            // Проверяем фильтр по ID, контакту и тегам
            if (
                ticketId.includes(filterValue) ||
                ticketContact.includes(filterValue) ||
                tags.some(tag => tag.includes(filterValue))
            ) {
                item.style.display = "block"; // Показываем элемент, если он соответствует фильтру
            } else {
                item.style.display = "none"; // Скрываем элемент, если он не соответствует фильтру
            }
        });
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
        <div className="chat-container">
            <div className="users-container">
                <div className='extra-info-title'>Chat</div>
                <div className="filter-container-chat">
                    <input
                        type="text"
                        placeholder="Id or name or tag"
                        onInput={handleFilterInput}
                        className="ticket-filter-input"
                    />
                    <label>
                        <input
                            type="checkbox"
                            id="myTicketsCheckbox"
                            onChange={handleCheckboxChange}
                            checked={showMyTickets}
                        />
                        My tickets
                    </label>
                </div>
                <div className="chat-item-container">
                    {Array.isArray(filteredTickets) && filteredTickets.length > 0 ? (
                        filteredTickets
                            .sort((a, b) => {
                                const ticketMessagesA = messages.filter(msg => msg.ticket_id === a.id);
                                const ticketMessagesB = messages.filter(msg => msg.ticket_id === b.id);

                                const lastMessageA = ticketMessagesA.length
                                    ? ticketMessagesA.reduce((latest, current) =>
                                        new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
                                    )
                                    : { time_sent: null };

                                const lastMessageB = ticketMessagesB.length
                                    ? ticketMessagesB.reduce((latest, current) =>
                                        new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
                                    )
                                    : { time_sent: null };

                                return new Date(lastMessageB.time_sent) - new Date(lastMessageA.time_sent);
                            })
                            .map(ticket => {
                                const ticketMessages = messages.filter(msg => msg.ticket_id === ticket.id);

                                const unreadCounts = ticketMessages.filter(
                                    msg =>
                                        msg.seen_by != null && msg.seen_by == '{}' && msg.sender_id !== userId
                                ).length;

                                const lastMessage = ticketMessages.length
                                    ? ticketMessages.reduce((latest, current) =>
                                        new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
                                    )
                                    : { message: "", time_sent: null };

                                const formattedTime = lastMessage.time_sent
                                    ? new Date(lastMessage.time_sent).toLocaleTimeString("ru-RU", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : null;

                                const tags = parseTags(ticket.tags);

                                return (
                                    <div
                                        key={ticket.id}
                                        className={`chat-item ${ticket.id === selectTicketId ? "active" : ""}`}
                                        onClick={() => handleTicketClick(ticket.id)}
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
                                                                    backgroundColor: "#007bff",
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
                                                        tags?.length === 0 ? null : <div>no tags</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="container-time-tasks-chat">
                                            <div className="info-message">
                                                <div className="last-message-container">
                                                    <div className="last-message-ticket">
                                                        {lastMessage?.mtype === 'text'
                                                            ? lastMessage.message
                                                            : lastMessage?.mtype
                                                                ? getMessageTypeLabel(lastMessage.mtype)
                                                                : "No messages"}
                                                    </div>

                                                    <div className='chat-time'>{formattedTime || "—"}</div>
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
                    {selectTicketId ? ( // ✅ Если тикет выбран, показываем сообщения
                        messages
                            .filter((msg) => msg.ticket_id === selectTicketId) // ✅ Фильтруем сообщения по ticket_id
                            .sort((a, b) => new Date(a.time_sent) - new Date(b.time_sent))
                            .map((msg) => {
                                const uniqueKey = `${msg.id || msg.ticket_id}-${msg.time_sent}`;

                                // Определяем отображение контента на основе mtype
                                const renderContent = () => {
                                    if (!msg.message) {
                                        return <div className="text-message">Сообщение отсутствует</div>;
                                    }
                                    switch (msg.mtype) {
                                        case "image":
                                            return (
                                                <img
                                                    src={msg.message}
                                                    alt="Отправленное изображение"
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
                                                    Ваш браузер не поддерживает воспроизведение видео.
                                                </video>
                                            );
                                        case "audio":
                                            return (
                                                <audio controls className="audio-preview">
                                                    <source src={msg.message} type="audio/ogg" />
                                                    Ваш браузер не поддерживает воспроизведение аудио.
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
                                                    Открыть файл
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
                                                <div className="text">
                                                    {renderContent()}
                                                    <div className="message-time">
                                                        <div
                                                            className="reaction-toggle-button"
                                                            onClick={() =>
                                                                setSelectedMessageId(selectedMessageId === msg.id ? null : msg.id)
                                                            }
                                                        >
                                                            {lastReaction || "☺"}
                                                        </div>
                                                        {new Date(msg.time_sent).toLocaleTimeString("ro-RO", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </div>
                                                    {selectedMessageId === msg.id && (
                                                        <div className="reaction-container" ref={reactionContainerRef}>
                                                            <div className="reaction-buttons">
                                                                {["☺", "👍", "❤️", "😂", "😮", "😢", "😡"].map((reaction) => (
                                                                    <div
                                                                        key={reaction}
                                                                        onClick={() => handleReactionClick(reaction, msg.id)}
                                                                        className={
                                                                            selectedReaction[msg.id] === reaction ? "active" : ""
                                                                        }
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
                            })
                    ) : ( // ✅ Если тикет не выбран, просто показываем пустой контейнер
                        <div className="empty-chat">
                            <p>Выберите тикет для просмотра сообщений</p>
                        </div>
                    )}
                </div>
                <div className="manager-send-message-container">
                    <textarea
                        className="text-area-message"
                        value={managerMessage}
                        onChange={(e) => setManagerMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={translations['Introduceți mesaj'][language]}
                        disabled={!selectTicketId}
                    >
                    </textarea>
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
                                style={{ display: "none" }}
                                id="file-input"
                            />
                            <button
                                htmlFor="file-input"
                                className="action-button file-button"
                                disabled={!selectTicketId}
                            >
                                <FaFile />
                            </button>
                        </div>
                        <div className="select-row">
                            <Select
                                options={templateOptions}
                                id="message-template"
                                label="Șablon"
                                value={selectedMessage ?? undefined}
                                onChange={handleSelectTChange}
                                placeholder="Introduceți mesaj"
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
                        {translations['Informații suplimentare'][language]}
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'personalData' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personalData')}
                    >
                        {translations['Date personale'][language]}
                    </button>
                </div>
                <div className="tab-content">
                    {activeTab === 'extraForm' && selectTicketId && ( // ✅ Добавлена проверка selectTicketId
                        <div className="extra-info-content">
                            <div className='extra-info-title'>{translations['Informații suplimentare'][language]}</div>
                            {selectTicketId && (
                                <>
                                    <div className="selects-container">
                                        <Workflow
                                            ticket={updatedTicket}
                                            onChange={handleWorkflowChange}
                                        />
                                        {isLoading ? (
                                            <p>Loading...</p>
                                        ) : (
                                            <TechnicianSelect
                                                selectedTechnicianId={selectedTechnicianId}
                                                onTechnicianChange={handleTechnicianChange}
                                            />
                                        )}
                                        <Input
                                            label="Vânzare"
                                            type="number"
                                            value={extraInfo[selectTicketId]?.sale || ""}
                                            onChange={(e) =>
                                                handleSelectChange(selectTicketId, 'sale', e.target.value)
                                            }
                                            className="input-field"
                                            placeholder="Indicați suma în euro"
                                            id="sale-input"
                                        />
                                        <Select
                                            options={sourceOfLeadOptions}
                                            label="Sursă lead"
                                            id="lead-source-select"
                                            className="input-field"
                                            value={extraInfo[selectTicketId]?.lead_source || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectTicketId, 'lead_source', value)
                                            }
                                        />
                                        <Select
                                            options={promoOptions}
                                            label="Promo"
                                            id="promo-select"
                                            className="input-field"
                                            value={extraInfo[selectTicketId]?.promo || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectTicketId, 'promo', value)
                                            }
                                        />
                                        <Select
                                            options={marketingOptions}
                                            label="Marketing"
                                            id="marketing-select"
                                            className="input-field"
                                            value={extraInfo[selectTicketId]?.marketing || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectTicketId, 'marketing', value)
                                            }
                                        />
                                        <Select
                                            options={serviceTypeOptions}
                                            label="Serviciu"
                                            id="service-select"
                                            className="input-field"
                                            value={extraInfo[selectTicketId]?.service || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectTicketId, 'service', value)
                                            }
                                        />
                                        <Select
                                            options={countryOptions}
                                            label="Țară"
                                            id="country-select"
                                            className="input-field"
                                            value={extraInfo[selectTicketId]?.country || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectTicketId, 'country', value)
                                            }
                                        />
                                        <Select
                                            options={transportOptions}
                                            label="Transport"
                                            id="transport-select"
                                            className="input-field"
                                            value={extraInfo[selectTicketId]?.transport || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectTicketId, 'transport', value)
                                            }
                                        />
                                        <Select
                                            options={nameExcursionOptions}
                                            label="Excursie"
                                            id="excursie-select"
                                            className="input-field"
                                            value={extraInfo[selectTicketId]?.excursion || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectTicketId, 'excursion', value)
                                            }
                                        />
                                        <Input
                                            label="Data și ora plecării"
                                            type="datetime-local"
                                            value={extraInfo[selectTicketId]?.leave_date || ""}
                                            onChange={(date) =>
                                                handleSelectChange(selectTicketId, 'leave_date', date)
                                            }
                                            className="input-field"
                                        />
                                        <Input
                                            label="Data și ora întoarcerii"
                                            type="datetime-local"
                                            value={extraInfo[selectTicketId]?.arrive_date || ""}
                                            onChange={(date) =>
                                                handleSelectChange(selectTicketId, 'arrive_date', date)
                                            }
                                            className="input-field"
                                        />
                                        <Select
                                            options={purchaseProcessingOptions}
                                            label="Achiziție"
                                            id="purchase-select"
                                            className="input-field"
                                            value={extraInfo[selectTicketId]?.purchase || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectTicketId, 'purchase', value)
                                            }
                                        />
                                        <Input
                                            label="Nr de contract"
                                            type="text"
                                            value={extraInfo[selectTicketId]?.contract_id || ""}
                                            onChange={(e) =>
                                                handleSelectChange(selectTicketId, 'contract_id', e.target.value)
                                            }
                                            className="input-field"
                                            placeholder="Nr de contract"
                                            id="contract-number-input"
                                        />
                                        <Input
                                            label="Data contractului"
                                            type="date"
                                            value={extraInfo[selectTicketId]?.contract_date || ""}
                                            onChange={(date) =>
                                                handleSelectChange(selectTicketId, 'contract_date', date)
                                            }
                                            className="input-field"
                                        />
                                        <Input
                                            label="Operator turistic"
                                            type="text"
                                            value={extraInfo[selectTicketId]?.tour_operator || ""}
                                            onChange={(e) =>
                                                handleSelectChange(selectTicketId, 'tour_operator', e.target.value)
                                            }
                                            className="input-field"
                                            placeholder="Operator turistic"
                                            id="tour-operator-input"
                                        />
                                        <Input
                                            label="Nr cererii de la operator"
                                            type="text"
                                            value={extraInfo[selectTicketId]?.request_id || ""}
                                            onChange={(e) =>
                                                handleSelectChange(selectTicketId, 'request_id', e.target.value)
                                            }
                                            className="input-field"
                                            placeholder="Nr cererii de la operator"
                                            id="tour-operator-input"
                                        />
                                        <Input
                                            label="Preț netto (euro)"
                                            type="number"
                                            value={extraInfo[selectTicketId]?.price_netto || ""}
                                            onChange={(e) =>
                                                handleSelectChange(selectTicketId, 'price_netto', e.target.value)
                                            }
                                            className="input-field"
                                            placeholder="Preț netto (euro)"
                                            id="price-neto-input"
                                        />
                                        <Input
                                            label="Comision companie"
                                            type="number"
                                            value={extraInfo[selectTicketId]?.commission || ""}
                                            onChange={(e) =>
                                                handleSelectChange(selectTicketId, 'commission', e.target.value)
                                            }
                                            className="input-field"
                                            placeholder="Comision companie"
                                            id="commission-input"
                                        />
                                        <Select
                                            options={paymentStatusOptions}
                                            label="Plată primită"
                                            id="payment-select"
                                            value={extraInfo[selectTicketId]?.payment_method || ""}
                                            onChange={(value) =>
                                                handleSelectChange(selectTicketId, 'payment_method', value)
                                            }
                                        />
                                    </div>
                                    <div className="input-group">
                                        <button onClick={sendExtraInfo} className="submit-button">
                                            {isLoading ? translations['Încărcăm...'][language] : translations['Actualizare'][language]}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {activeTab === 'personalData' && (
                        <div className="personal-data-content">
                            <div className='extra-info-title'>{translations['Date personale'][language]}</div>
                            <form onSubmit={handlePersonalDataSubmit} className='personal-data-container'>
                                <Input
                                    label="Nume"
                                    type="text"
                                    value={extraInfo[selectClientId]?.name || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectClientId, 'name', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Nume"
                                />
                                <Input
                                    label="Prenume"
                                    type="text"
                                    value={extraInfo[selectClientId]?.surname || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectClientId, 'surname', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Prenume"
                                />
                                <Input
                                    label="Data nașterii"
                                    type="date"
                                    value={extraInfo[selectClientId]?.date_of_birth || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectClientId, 'date_of_birth', e.target.value)
                                    }
                                    className="input-field"
                                />
                                <Input
                                    label="Seria buletinului"
                                    type="text"
                                    value={extraInfo[selectClientId]?.id_card_series || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectClientId, 'id_card_series', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Seria buletinului"
                                />
                                <Input
                                    label="Numărul buletinului"
                                    type="text"
                                    value={extraInfo[selectClientId]?.id_card_number || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectClientId, 'id_card_number', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Numărul buletinului"
                                />
                                <Input
                                    label="Data eliberării buletinului"
                                    type="date"
                                    value={extraInfo[selectClientId]?.id_card_release || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectClientId, 'id_card_release', e.target.value)
                                    }
                                    className="input-field"
                                />
                                <Input
                                    label="IDNP"
                                    type="text"
                                    value={extraInfo[selectClientId]?.idnp || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectClientId, 'idnp', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="IDNP"
                                />
                                <Input
                                    label="Adresă"
                                    type="text"
                                    value={extraInfo[selectClientId]?.address || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectClientId, 'address', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Adresă"
                                />
                                <Input
                                    label="Telefon"
                                    type="tel"
                                    value={extraInfo[selectClientId]?.phone || ""}
                                    onChange={(e) =>
                                        handleSelectChange(selectClientId, 'phone', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Telefon"
                                />
                                <button type="submit" className="submit-button">
                                    {translations['Salvați datele personale'][language]}
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