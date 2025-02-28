import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaFile, FaPaperPlane, FaSmile } from 'react-icons/fa';
import Select from '../SelectComponent/SelectComponent';
import { useUser } from '../../UserContext';
import Cookies from 'js-cookie';
import { transportOptions } from '../../FormOptions/TransportOptions';
import { motivulRefuzuluiOptions } from '../../FormOptions/MotivulRefuzuluiOptions';
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
import { translations } from '../utils/translations';
import TicketFilterModal from '../LeadsComponent/TicketFilterModal';
import { FaFacebook, FaInstagram, FaWhatsapp, FaTelegram } from "react-icons/fa";
import { SiViber } from "react-icons/si";
import { useLocation } from 'react-router-dom';
import TaskModal from '../SlideInComponent/TaskComponent';
import { FaTasks } from 'react-icons/fa';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import { evaluareOdihnaOptions } from '../../FormOptions/EvaluareVacantaOptions';
import { valutaOptions } from '../../FormOptions/ValutaOptions';
import { ibanOptions } from '../../FormOptions/IbanOptions';
import { api } from "../../api"
import { showServerError } from "../../Components/utils/showServerError"

const ChatComponent = ({ }) => {
    const { userId, hasRole, isLoadingRoles } = useUser();
    const [managerMessage, setManagerMessage] = useState('');
    const { tickets, updateTicket, setTickets, messages, setMessages, markMessagesAsRead, socketRef, selectTicketId, setSelectTicketId, getClientMessagesSingle } = useAppContext();
    const [extraInfo, setExtraInfo] = useState({}); // Состояние для дополнительной информации каждого тикета
    const [personalInfo, setPersonalInfo] = useState({});
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
    const [showMyTickets, setShowMyTickets] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const fileInputRef = useRef(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({});
    const ticketRef = useRef(null);
    const [isChatListVisible, setIsChatListVisible] = useState(true);
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("extraForm"); // По умолчанию вкладка Extra Form
    const [filteredTicketIds, setFilteredTicketIds] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const platformIcons = {
        "facebook": <FaFacebook />,
        "instagram": <FaInstagram />,
        "whatsapp": <FaWhatsapp />,
        "viber": <SiViber />,
        "telegram": <FaTelegram />
    };

    useEffect(() => {
        if (!isLoadingRoles) {
            setIsAdmin(hasRole("ROLE_ADMIN"));
        }
    }, [isLoadingRoles, hasRole]);

    const AdminRoles = isLoadingRoles ? true : !isAdmin;

    const applyFilters = (filters) => {
        setAppliedFilters(filters);
    };

    const handleClientClick = (id) => {
        setSelectedClient(id);
        console.log("Выбран клиент:", id);
        // Здесь можно добавить дополнительную логику, например, фильтрацию сообщений
    };

    useEffect(() => {
        if (ticketId) {
            setSelectTicketId(Number(ticketId));
        }
    }, [ticketId, setSelectTicketId]);

    // Прокручиваем к активному чату, если selectTicketId изменился и тикеты загружены
    // useEffect(() => {
    //     if (!isLoading && activeChatRef.current) {
    //         activeChatRef.current.scrollIntoView({ behavior: "auto" });
    //     }
    // }, [selectTicketId, isLoading, filteredTickets]);

    // Получение дополнительной информации для тикета
    const fetchTicketExtraInfo = async (selectTicketId) => {
        try {
            const data = await api.tickets.ticket.getInfo(selectTicketId)
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
    const handleSelectChangeExtra = (ticketId, field, value) => {
        setExtraInfo((prevState) => {
            const newState = {
                ...prevState,
                [ticketId]: {
                    ...prevState[ticketId],
                    [field]: value,
                },
            };
            // console.log("Обновленное состояние extraInfo:", newState);
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
            const result = await api.tickets.ticket.create(selectTicketId, ticketExtraInfo)

            enqueueSnackbar('Данные успешно обновлены', { variant: 'success' });
            console.log('Данные успешно отправлены:', result);
        } catch (error) {
            enqueueSnackbar('Ошибка при обновлении дополнительной информации', { variant: 'error' });
            console.error('Ошибка при отправке дополнительной информации:', error);
        } finally {
            setIsLoading(false); // Отключаем индикатор загрузки
        }
    };

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectTicketId]);

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

    useEffect(() => {
        if (!selectTicketId) return; // Если тикет не выбран — ничего не делаем
        getClientMessagesSingle(selectTicketId);
        fetchClientDataPersonal(selectTicketId, setPersonalInfo);
        fetchTicketExtraInfo(selectTicketId);
    }, [selectTicketId]);


    const handleTicketClick = async (ticketId) => {
        if (selectTicketId === ticketId) return; // Если уже открыт этот тикет, ничего не делаем

        setSelectTicketId(ticketId);
        navigate(`/chat/${ticketId}`);

        const selectedTicket = tickets.find(ticket => ticket.id === ticketId);
        setSelectedTechnicianId(selectedTicket ? selectedTicket.technician_id || null : null);

        // Не сбрасываем unseen_count вручную, ждем WebSocket-сообщение
        await markMessagesAsRead(ticketId);
    };

    const workflowOptions = [
        "Interesat",
        "Apel de intrare",
        "De prelucrat",
        "Luat în lucru",
        "Ofertă trimisă",
        "Aprobat cu client",
        "Contract semnat",
        "Plată primită",
        "Contract încheiat",
        "Realizat cu succes",
        "Închis și nerealizat"
    ];

    // Индексы этапов
    const workflowIndices = workflowOptions.reduce((acc, workflow, index) => {
        acc[workflow] = index;
        return acc;
    }, {});

    // Состояния ошибок
    const [fieldErrors, setFieldErrors] = useState({});

    // Получение текущего тикета
    const updatedTicket = tickets.find(ticket => ticket.id === selectTicketId) || null;
    const currentWorkflowIndex = updatedTicket ? workflowIndices[updatedTicket.workflow] : -1;

    // Обязательные поля для каждого этапа
    const requiredFields = {
        "Luat în lucru": ["sursa_lead", "promo", "marketing"],
        "Ofertă trimisă": ["tipul_serviciului", "tara", "tip_de_transport", "denumirea_excursiei_turului"],
        "Aprobat cu client": ["procesarea_achizitionarii"],
        "Contract semnat": ["numar_de_contract", "data_contractului", "contract_trimis", "contract_semnat"],
        "Plată primită": ["achitare_efectuata"],
        "Contract încheiat": [
            "buget", "data_plecarii", "data_intoarcerii", "tour_operator",
            "numarul_cererii_de_la_operator", "rezervare_confirmata",
            "contract_arhivat", "statutul_platii", "pret_netto", "comission_companie"
        ],
        "Realizat cu succes": ["control_admin"] // Новое обязательное поле
    };

    // Функция валидации перед изменением workflow
    const validateFields = (workflow) => {
        if (workflow === "Închis și nerealizat") {
            if (!extraInfo[selectTicketId]?.motivul_refuzului) {
                setFieldErrors(prev => ({ ...prev, motivul_refuzului: true }));
                enqueueSnackbar(`Completați "Motivul refuzului" înainte de a face modificări!`, { variant: 'error' });
                return false;
            }
            return true;
        }

        let missingFields = [];
        const workflowIndex = workflowIndices[workflow];

        for (const [step, fields] of Object.entries(requiredFields)) {
            if (workflowIndices[step] <= workflowIndex) {
                missingFields.push(...fields.filter(field => !extraInfo[selectTicketId]?.[field]));
            }
        }

        if (missingFields.length) {
            setFieldErrors(prev => ({
                ...prev,
                ...Object.fromEntries(missingFields.map(field => [field, true]))
            }));

            enqueueSnackbar(`Completați toate câmpurile obligatorii pentru "${workflow}" și etapele anterioare înainte de a face modificări!`, { variant: 'error' });
            return false;
        }

        return true;
    };

    // Функция изменения workflow с проверкой
    const handleWorkflowChange = async (event) => {
        const newWorkflow = event.target.value;

        if (!updatedTicket) {
            enqueueSnackbar('Eroare: Ticketul nu a fost găsit.', { variant: 'error' });
            return;
        }

        const workflowIndex = workflowIndices[newWorkflow];
        let newFieldErrors = {};

        for (const [step, fields] of Object.entries(requiredFields)) {
            if (workflowIndices[step] <= workflowIndex) {
                fields.forEach(field => {
                    if (!extraInfo[selectTicketId]?.[field]) {
                        newFieldErrors[field] = true;
                    }
                });
            }
        }

        // Если выбран "Închis și nerealizat", оставляем только ошибку "motivul_refuzului"
        if (newWorkflow === "Închis și nerealizat") {
            newFieldErrors = {};
            if (!extraInfo[selectTicketId]?.motivul_refuzului) {
                newFieldErrors.motivul_refuzului = true;
            }
        }

        setFieldErrors(newFieldErrors);

        if (Object.keys(newFieldErrors).length > 0) {
            enqueueSnackbar(`Completați toate câmpurile obligatorii pentru "${newWorkflow}" și etapele anterioare înainte de a face modificări!`, { variant: 'error' });
            return;
        }

        try {
            await updateTicket({ id: updatedTicket.id, workflow: newWorkflow });

            enqueueSnackbar('Statutul tichetului a fost actualizat!', { variant: 'success' });

            setTickets(prevTickets =>
                prevTickets.map(ticket =>
                    ticket.id === updatedTicket.id ? { ...ticket, workflow: newWorkflow } : ticket
                )
            );

            console.log("Workflow actualizat:", newWorkflow);
        } catch (error) {
            enqueueSnackbar('Eroare: Statutul tichetului nu a fost actualizat.', { variant: 'error' });
            console.error('Eroare la actualizarea workflow:', error.message);
        }
    };

    // Функция сброса ошибки при вводе данных
    const handleFieldChange = (field, value) => {
        handleSelectChangeExtra(selectTicketId, field, value);
        if (value) {
            setFieldErrors(prev => ({ ...prev, [field]: false }));
        }
    };

    // Сброс ошибок при смене тикета
    useEffect(() => {
        setFieldErrors({});
    }, [selectTicketId]);

    // Подсветка ошибок в табах
    const getTabErrorIndicator = (tab) => {
        const tabFields = {
            extraForm: ["buget", "data_plecarii", "data_intoarcerii", "sursa_lead", "promo", "marketing"],
            Contract: ["numar_de_contract", "data_contractului", "contract_trimis", "contract_semnat", "tour_operator", "numarul_cererii_de_la_operator"],
            Invoice: ["statutul_platii", "pret_netto", "comission_companie"],
            Media: [],
            "Control calitate": ["motivul_refuzului"]
        };

        return tabFields[tab]?.some(field => fieldErrors[field]) ? "🔴" : "";
    };

    useEffect(() => {
        const pretNetto = extraInfo[selectTicketId]?.pret_netto;
        const buget = extraInfo[selectTicketId]?.buget;

        if (pretNetto !== "" && buget !== "" && pretNetto !== undefined && buget !== undefined) {
            const newComision = parseFloat(buget) - parseFloat(pretNetto);
            handleFieldChange("comission_companie", newComision.toFixed(2)); // Автообновление
        }
    }, [extraInfo[selectTicketId]?.pret_netto, extraInfo[selectTicketId]?.buget, selectTicketId]);
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
                .map((reaction) => reaction.replace(/(^"|"$|\")/g, '').trim()); // Убираем кавычки

            // Парсим JSON-объекты и извлекаем поле `reaction`
            const parsedReactions = reactionsArray.map((reaction) => {
                try {
                    // Удаляем экранированные кавычки и парсим строку
                    const normalizedReaction = reaction.replace('\"', '');
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

    const handleSelectTemplateChange = (event) => {
        const selectedKey = event.target.value;

        if (selectedKey) {
            setSelectedMessage(selectedKey);
            setManagerMessage(templateOptions[selectedKey]); // Set actual message text
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

    const handleFileButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const getMessageTypeLabel = (type) => {
        const typeLabels = {
            text: translations["Mesaj text"][language],
            image: translations["Mesaj imagine"][language],
            video: translations["Mesaj video"][language],
            file: translations["Mesaj file"][language],
            audio: translations["Mesaj audio"][language],
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
            await api.tickets.updateById(selectTicketId, { technician_id: newTechnicianId })
            console.log('Тикет успешно обновлён:', updatedTicket);

            console.log('Список тикетов успешно обновлён.');
        } catch (error) {
            enqueueSnackbar(error.message, { variant: "error" })
            console.error('Ошибка при обновлении technician_id:', error.message);
        }
    };


    // Отправка сообщения
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

        // Фильтруем сообщения только по выбранному тикету
        const ticketMessages = messages.filter((msg) => msg.ticket_id === selectTicketId);

        if (ticketMessages.length === 0) {
            return null;
        }

        // Находим последнее сообщение по времени
        const lastMessage = ticketMessages.reduce((latest, current) =>
            new Date(current.time_sent) > new Date(latest.time_sent) ? current : latest
        );

        // console.log("🕵️‍♂️ Последнее сообщение отправил клиент:", lastMessage.client_id);
        return lastMessage.client_id;
    };

    // Автоустановка клиента при изменении тикета
    useEffect(() => {
        const lastClient = getLastActiveClient();
        if (lastClient) {
            setSelectedClient(String(lastClient)); // Устанавливаем клиента в селект
        }
    }, [messages, selectTicketId]); // Следим за изменением сообщений и выбранного тикета

    const handleClick = () => {
        if (!selectedClient) {
            console.error("⚠️ Ошибка: Клиент не выбран!");
            return;
        }

        const analyzeLastMessagePlatform = () => {
            console.log("🔍 Анализируем платформу последнего сообщения...");
            console.log("📌 selectedClient:", selectedClient);

            // Проверяем, загружены ли сообщения
            if (!Array.isArray(messages)) {
                console.error("❌ Ошибка: messages не является массивом!", messages);
                return "web";
            }

            console.log("📩 Всего сообщений в системе:", messages.length);

            // 🔹 Преобразуем `selectedClient` в число, если нужно
            const clientId = Number(selectedClient);

            // 🔹 Фильтруем сообщения от текущего клиента
            const clientMessages = messages.filter((msg) => Number(msg.client_id) === clientId);

            if (!clientMessages || clientMessages.length === 0) {
                console.warn("⚠️ Нет сообщений от клиента, выбираем платформу (web)");
                return "web";
            }

            console.log("🔎 Найдено сообщений от клиента:", clientMessages.length);

            // Находим последнее сообщение по времени
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
                platform: platform, // Динамическая платформа
                message: managerMessage.trim(),
                media_type: null,
                media_url: "",
            };

            // 🔹 Если файл выбран, загружаем его
            if (selectedFile) {
                console.log('Загрузка файла...');
                const uploadResponse = await uploadFile(selectedFile);

                if (!uploadResponse || !uploadResponse.url) {
                    console.error('Ошибка загрузки файла');
                    return;
                }

                messageData.media_url = uploadResponse.url; // URL загруженного файла
                messageData.media_type = getMediaType(selectedFile.type); // Определяем тип медиафайла
            }

            console.log('Отправляемые данные:', JSON.stringify(messageData, null, 2));

            // 🔹 Определяем API в зависимости от платформы
            let apiUrl = api.messages.send.create

            if (platform === "telegram") {
                apiUrl = api.messages.send.telegram
            } else if (platform === "viber") {
                apiUrl = api.messages.send.viber
            }

            console.log(`📡 Отправка сообщения через API: ${apiUrl}`);

            setManagerMessage('');

            // 🔹 Отправка сообщения
            await apiUrl(messageData)

            console.log(`✅ Сообщение успешно отправлено через API ${apiUrl}:`, messageData);

            // 🔹 Добавляем сообщение в локальный state
            setMessages((prevMessages) => [...prevMessages, { ...messageData, seenAt: false }]);

            // 🔹 Очищаем поле ввода, если файл не отправляется
            if (!selectedFile) setManagerMessage('');
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

    const handleSelectChange = (clientId, field, value) => {
        setPersonalInfo(prev => ({
            ...prev,
            [clientId]: {
                ...prev[clientId],
                [field]: value
            }
        }));
    };

    const handlePersonalDataSubmit = async (event) => {
        event.preventDefault();

        if (!selectedClient) {
            alert("Выберите клиента!");
            return;
        }

        const payload = {
            name: personalInfo[selectedClient]?.name?.trim() || "",
            surname: personalInfo[selectedClient]?.surname?.trim() || "",
            date_of_birth: personalInfo[selectedClient]?.date_of_birth || "",
            id_card_series: personalInfo[selectedClient]?.id_card_series?.trim() || "",
            id_card_number: personalInfo[selectedClient]?.id_card_number?.trim() || "",
            id_card_release: personalInfo[selectedClient]?.id_card_release || "",
            idnp: personalInfo[selectedClient]?.idnp?.trim() || "",
            address: personalInfo[selectedClient]?.address?.trim() || "",
            phone: personalInfo[selectedClient]?.phone?.trim() || "",
        };

        try {
            const result = await api.users.updateExtended(selectedClient, payload)

            console.log("Данные успешно обновлены:", result);
            alert("Личные данные успешно сохранены!");

            // Опционально обновляем состояние personalInfo после успешного сохранения
            setPersonalInfo(prev => ({
                ...prev,
                [selectedClient]: result
            }));

        } catch (error) {
            console.error("Ошибка при сохранении данных:", error);
            alert("Не удалось сохранить личные данные.");
        }
    };

    const fetchClientDataPersonal = async (selectedClient, setPersonalInfo) => {
        try {
            const data = await api.users.getExtendedById(selectedClient)

            // Устанавливаем полученные данные в `personalInfo`
            setPersonalInfo(prev => ({
                ...prev,
                [selectedClient]: { ...data } // Обновляем данные для выбранного клиента
            }));

        } catch (error) {
            console.error('Ошибка при получении данных клиента:', error);
        }
    };

    useEffect(() => {
        if (selectedClient) {
            fetchClientDataPersonal(selectedClient, setPersonalInfo);
        }
    }, [selectedClient]);

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


    const handleMergeTickets = async () => {
        const ticketOld = ticketId;
        const ticketNew = extraInfo[selectTicketId]?.ticket_id_new;

        if (!ticketOld || !ticketNew) {
            alert("Introduceți ambele ID-uri!");
            return;
        }

        try {
            await api.tickets.merge({
                ticket_old: ticketOld,
                ticket_new: ticketNew
            })
            enqueueSnackbar("Biletele au fost combinate cu succes!", { variant: 'success' })

        } catch (error) {
            enqueueSnackbar(showServerError(error), { variant: 'error' });
            console.error("Eroare:", error);
        }
    };

    const handleMergeClients = async () => {
        const oldUserId = selectedClient; // old_user_id фиксирован
        const newUserId = extraInfo[selectedClient]?.new_user_id;

        if (!newUserId) {
            alert("Introduceți ID-ul nou al utilizatorului!");
            return;
        }

        try {
            await api.users.clientMerge({
                old_user_id: oldUserId,
                new_user_id: newUserId
            })

            enqueueSnackbar("Utilizatorii au fost combinați cu succes!", { variant: 'success' });

        } catch (error) {
            enqueueSnackbar("Eroare la combinarea utilizatorilor", { variant: 'error' });
        }
    };

    // useEffect(() => {
    //     if (selectTicketId && ticketRef.current) {
    //         ticketRef.current.scrollIntoView({ behavior: "auto", block: "center" });
    //     }
    // }, [selectTicketId]);

    const sortedTickets = useMemo(() => {
        let filtered = [...tickets]; // Делаем копию массива тикетов

        // console.log("📌 Исходные тикеты:", tickets);

        // 1️⃣ Функция получения времени последнего сообщения тикета
        const getLastMessageTime = (ticket) => {
            // Получаем все сообщения по тикету
            const ticketMessages = messages.filter(msg => msg.ticket_id === ticket.id);

            if (ticketMessages.length > 0) {
                // Берем самое последнее сообщение
                return Math.max(...ticketMessages.map(msg => parseCustomDate(msg.time_sent)));
            }

            // Если сообщений нет, fallback на `time_sent` или `last_interaction_date`
            if (ticket.time_sent) return parseCustomDate(ticket.time_sent);
            if (ticket.last_interaction_date) return parseCustomDate(ticket.last_interaction_date);

            return 0; // Если ничего нет, ставим минимальное значение
        };

        // 2️⃣ Функция парсинга нестандартного формата даты (dd-MM-yyyy HH:mm:ss)
        const parseCustomDate = (dateStr) => {
            if (!dateStr) return 0;

            const [datePart, timePart] = dateStr.split(" ");
            const [day, month, year] = datePart.split("-").map(Number);
            const [hours, minutes, seconds] = timePart.split(":").map(Number);

            return new Date(year, month - 1, day, hours, minutes, seconds).getTime(); // timestamp
        };

        // 3️⃣ Основная сортировка: по убыванию времени последнего сообщения
        filtered.sort((a, b) => getLastMessageTime(b) - getLastMessageTime(a));

        // console.log("✅ После сортировки по времени:", filtered);

        // 4️⃣ Фильтр по ID тикетов из `TicketFilterModal`
        if (filteredTicketIds !== null && filteredTicketIds.length > 0) {
            filtered = filtered.filter(ticket => filteredTicketIds.includes(Number(ticket.id)));
        }

        // 5️⃣ Фильтрация "Мои тикеты"
        if (showMyTickets) {
            filtered = filtered.filter(ticket => ticket.technician_id === userId);
        }

        // 6️⃣ Фильтрация по поисковому запросу (ID, контакт, теги)
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

        // 7️⃣ Фильтрация по `appliedFilters`
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

        // console.log("✅ Итоговый список тикетов после фильтрации:", filtered);
        return filtered;
    }, [tickets, messages, filteredTicketIds, appliedFilters, showMyTickets, searchQuery, userId]);


    // useEffect(() => {
    //     if (location.state?.hideChatList) {
    //         setIsChatListVisible(false);
    //     }
    // }, [location.state]);

    useEffect(() => {
        // 1. Проверяем, есть ли `state` в `location`
        if (location.state?.hideChatList) {
            setIsChatListVisible(false);
            return;
        }

        // 2. Если нет `location.state`, пробуем взять `state` из URL
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
        // Пересчитываем фильтрованные тикеты, когда приходят новые сообщения
        applyFilters(appliedFilters);
    }, [messages]); // Запускаем при обновлении сообщений

    useEffect(() => {
        if (!selectTicketId || !messages.length) return;

        // Получаем сообщения текущего открытого тикета
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
            {/* Контейнер списка чатов */}
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
                                <button onClick={() => setIsFilterOpen(true)} className="button-filter">
                                    {translations["Filtru"][language]} {Object.values(appliedFilters).some(value => value) && <span className="filter-indicator"></span>}
                                </button>
                            </div>
                        </div>

                        <div className="chat-item-container">
                            {sortedTickets.map(ticket => {
                                // Форматирование времени
                                const formattedTime = ticket.time_sent
                                    ? new Date(ticket.time_sent).toLocaleTimeString("ru-RU", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }) || "—"
                                    : "—";

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

                        <TicketFilterModal
                            isOpen={isFilterOpen}
                            onClose={() => setIsFilterOpen(false)}
                            onApplyFilter={(updatedFilters, ticketIds) => {
                                console.log("🚀 Фильтр применен в чате:", updatedFilters);
                                console.log("📥 Полученные ticketIds с API:", ticketIds);

                                if (!ticketIds || ticketIds.length === 0) {
                                    console.log("♻️ Сброс фильтра: показываем все тикеты.");
                                    setAppliedFilters({});
                                    setFilteredTicketIds(null);
                                    return;
                                }

                                // ✅ Разворачиваем `ticketIds`, если он вложенный массив
                                const flatTicketIds = ticketIds.flat(Infinity)
                                    .map(ticket => ticket?.id || ticket)
                                    .filter(id => typeof id === "number" || !isNaN(Number(id)))
                                    .map(id => Number(id));

                                console.log("📤 Развернутые ticketIds:", flatTicketIds);

                                setAppliedFilters(updatedFilters);
                                setFilteredTicketIds(flatTicketIds.length > 0 ? flatTicketIds : null);
                            }}
                        />
                    </>
                )}
            </div>

            {/* Кнопка скрытия/показа списка чатов */}
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
                            const selectedTicket = tickets.find(ticket => ticket.id === selectTicketId);
                            const clientIds = selectedTicket
                                ? selectedTicket.client_id.toString().replace(/[{}]/g, "").split(',').map(id => Number(id))
                                : [];

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
                                                                            {/* Отображаем имя только если сообщение от клиента */}
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
                        value={managerMessage}
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
                            {/* Кнопка для открытия TaskModal с выбранным тикетом */}
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

                                            // Найти последнее сообщение этого клиента
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

                    {/* TaskModal с передачей ID тикета */}
                    <TaskModal
                        isOpen={isTaskModalOpen}
                        onClose={() => setIsTaskModalOpen(false)}
                        selectedTicketId={selectTicketId}
                    />
                </div>

            </div>
            <div className="extra-info">
                {selectTicketId && (
                    <div className="sticky-container">
                        <div className="tabs-container">
                            <button
                                className={`tab-button ${activeTab === 'extraForm' ? 'active' : ''}`}
                                onClick={() => setActiveTab('extraForm')}
                            >
                                {translations["Informații suplimentare"]?.[language]} {getTabErrorIndicator('extraForm')}
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'Contract' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Contract')}
                            >
                                {translations["Contract"]?.[language]} {getTabErrorIndicator('Contract')}
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'Invoice' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Invoice')}
                            >
                                {translations["Invoice"]?.[language]}
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'Media' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Media')}
                            >
                                {translations["Media"]?.[language]}
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'Control calitate' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Control calitate')}
                            >
                                {translations["Control calitate"]?.[language]} {getTabErrorIndicator('Control calitate')}
                            </button>
                        </div>


                        <div className="tab-content-chat">
                            {activeTab && selectTicketId && isLoading ? (
                                <p>Loading...</p>
                            ) : (
                                <>
                                    <Workflow
                                        ticket={updatedTicket}
                                        onChange={handleWorkflowChange}
                                    />
                                    <div className="input-group">
                                        <button onClick={sendExtraInfo} className="submit-button">
                                            {isLoading ? translations['Încărcăm...'][language] : translations['Actualizare'][language]}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
                <div className="tab-content">
                    {activeTab === 'extraForm' && selectTicketId && (
                        <div className="extra-info-content">
                            <div className="selects-container">
                                {isLoading ? (
                                    <p>Loading...</p>
                                ) : (
                                    <TechnicianSelect
                                        selectedTechnicianId={updatedTicket?.technician_id}
                                        onTechnicianChange={handleTechnicianChange}
                                    />
                                )}
                                <Input
                                    label="Vânzare €"
                                    type="number"
                                    value={extraInfo[selectTicketId]?.buget || ""}
                                    onChange={(e) => handleFieldChange("buget", e.target.value)}
                                    className={`input-field ${fieldErrors.buget ? "invalid-field" : ""}`}
                                    placeholder="Indicați suma în euro"
                                    id="buget-input"
                                />
                                <Input
                                    label="Data venit in oficiu"
                                    type="datetime-local"
                                    value={extraInfo[selectTicketId]?.data_venit_in_oficiu || ""}
                                    onChange={(e) =>
                                        handleSelectChangeExtra(selectTicketId, 'data_venit_in_oficiu', e.target.value)
                                    }
                                    className="input-field"
                                />
                                <Select
                                    options={sourceOfLeadOptions}
                                    label="Status sunet telefonic"
                                    id="status_sunet_telefonic"
                                    className="input-field"
                                    value={extraInfo[selectTicketId]?.status_sunet_telefonic || ""}
                                    onChange={(value) =>
                                        handleSelectChangeExtra(selectTicketId, 'status_sunet_telefonic', value)
                                    }
                                    disabled={true}
                                />
                                <Input
                                    label="Data și ora plecării"
                                    type="datetime-local"
                                    value={extraInfo[selectTicketId]?.data_plecarii || ""}
                                    onChange={(e) => handleFieldChange("data_plecarii", e.target.value)}
                                    className={`input-field ${fieldErrors.data_plecarii ? "invalid-field" : ""}`}
                                />

                                <Input
                                    label="Data și ora întoarcerii"
                                    type="datetime-local"
                                    value={extraInfo[selectTicketId]?.data_intoarcerii || ""}
                                    onChange={(e) => handleFieldChange("data_intoarcerii", e.target.value)}
                                    className={`input-field ${fieldErrors.data_intoarcerii ? "invalid-field" : ""}`}
                                />

                                <Select
                                    options={sourceOfLeadOptions}
                                    label="Sursă lead"
                                    id="lead-source-select"
                                    value={extraInfo[selectTicketId]?.sursa_lead || ""}
                                    onChange={(value) => handleFieldChange("sursa_lead", value)}
                                    hasError={fieldErrors.sursa_lead}
                                />

                                <Select
                                    options={promoOptions}
                                    label="Promo"
                                    id="promo-select"
                                    value={extraInfo[selectTicketId]?.promo || ""}
                                    onChange={(value) => handleFieldChange("promo", value)}
                                    hasError={fieldErrors.promo}
                                />

                                <Select
                                    options={marketingOptions}
                                    label="Marketing"
                                    id="marketing-select"
                                    value={extraInfo[selectTicketId]?.marketing || ""}
                                    onChange={(value) => handleFieldChange("marketing", value)}
                                    hasError={fieldErrors.marketing}
                                />

                                <Select
                                    options={serviceTypeOptions}
                                    label="Serviciu"
                                    id="service-select"
                                    value={extraInfo[selectTicketId]?.tipul_serviciului || ""}
                                    onChange={(value) => handleFieldChange("tipul_serviciului", value)}
                                    hasError={fieldErrors.tipul_serviciului}
                                />

                                <Select
                                    options={countryOptions}
                                    label="Țară"
                                    id="country-select"
                                    value={extraInfo[selectTicketId]?.tara || ""}
                                    onChange={(value) => handleFieldChange("tara", value)}
                                    hasError={fieldErrors.tara}
                                />

                                <Select
                                    options={transportOptions}
                                    label="Transport"
                                    id="transport-select"
                                    value={extraInfo[selectTicketId]?.tip_de_transport || ""}
                                    onChange={(value) => handleFieldChange("tip_de_transport", value)}
                                    hasError={fieldErrors.tip_de_transport}
                                />

                                <Select
                                    options={nameExcursionOptions}
                                    label="Excursie"
                                    id="excursie-select"
                                    value={extraInfo[selectTicketId]?.denumirea_excursiei_turului || ""}
                                    onChange={(value) => handleFieldChange("denumirea_excursiei_turului", value)}
                                    hasError={fieldErrors.denumirea_excursiei_turului}
                                />

                                <Select
                                    options={purchaseProcessingOptions}
                                    label="Achiziție"
                                    id="purchase-select"
                                    value={extraInfo[selectTicketId]?.procesarea_achizitionarii || ""}
                                    onChange={(value) => handleFieldChange("procesarea_achizitionarii", value)}
                                    hasError={fieldErrors.procesarea_achizitionarii}
                                />
                                <Input
                                    label="Data cererii de retur"
                                    type="datetime-local"
                                    value={extraInfo[selectTicketId]?.data_cererii_de_retur || ""}
                                    onChange={(e) =>
                                        handleSelectChangeExtra(selectTicketId, 'data_cererii_de_retur', e.target.value)
                                    }
                                    className="input-field"
                                />
                            </div>
                            <div className="merge-tickets">
                                <input
                                    type="number"
                                    value={ticketId} // ticket_old всегда равен ticketId
                                    onChange={(e) =>
                                        handleSelectChangeExtra(selectTicketId, 'ticket_id_old', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder="Introduceți ID vechi"
                                    disabled // Поле отключено, так как old_user_id фиксирован
                                />
                                <input
                                    type="number"
                                    value={extraInfo[selectTicketId]?.ticket_id_new || ""}
                                    onChange={(e) =>
                                        handleSelectChangeExtra(selectTicketId, 'ticket_id_new', e.target.value)
                                    }
                                    className="input-field"
                                    placeholder={translations["Introduceți ID lead"][language]}
                                />
                                <button onClick={handleMergeTickets} className="submit-button">
                                    {translations["Combina"][language]}
                                </button>
                            </div>

                            <div className="divider-line"></div>
                            <div className="personal-data-content">
                                <div className='extra-info-title'>{translations['Date personale'][language]}</div>
                                <form onSubmit={handlePersonalDataSubmit} className='personal-data-container'>
                                    <Input
                                        label="Nume"
                                        type="text"
                                        value={personalInfo[selectedClient]?.name ?? ""}
                                        onChange={(e) =>
                                            handleSelectChange(selectedClient, 'name', e.target.value)
                                        }
                                        className="input-field"
                                        placeholder="Nume"
                                    />
                                    <Input
                                        label="Prenume"
                                        type="text"
                                        value={personalInfo[selectedClient]?.surname ?? ""}
                                        onChange={(e) =>
                                            handleSelectChange(selectedClient, 'surname', e.target.value)
                                        }
                                        className="input-field"
                                        placeholder="Prenume"
                                    />
                                    <Input
                                        label="Adresă"
                                        type="text"
                                        value={personalInfo[selectedClient]?.address ?? ""}
                                        onChange={(e) =>
                                            handleSelectChange(selectedClient, 'address', e.target.value)
                                        }
                                        className="input-field"
                                        placeholder="Adresă"
                                    />
                                    <Input
                                        label="Telefon"
                                        type="tel"
                                        value={personalInfo[selectedClient]?.phone ?? ""}
                                        onChange={(e) =>
                                            handleSelectChange(selectedClient, 'phone', e.target.value)
                                        }
                                        className="input-field"
                                        placeholder="Telefon"
                                    />
                                    <button type="submit" className="submit-button">
                                        {translations['Salvați datele personale'][language]}
                                    </button>
                                </form>
                                <div className="merge-client">
                                    <input
                                        type="number"
                                        value={selectedClient} // old_user_id фиксирован
                                        className="input-field"
                                        placeholder="Introduceți ID vechi"
                                        disabled // Поле отключено, так как old_user_id фиксирован
                                    />
                                    <input
                                        type="number"
                                        value={extraInfo[selectedClient]?.new_user_id || ""}
                                        onChange={(e) =>
                                            handleSelectChangeExtra(selectedClient, 'new_user_id', e.target.value)
                                        }
                                        className="input-field"
                                        placeholder={translations["Introduceți ID client"][language]}
                                    />
                                    <button onClick={handleMergeClients} className="submit-button">
                                        {translations["Combina"][language]}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'Contract' && selectTicketId && (
                        <div className="extra-info-content">
                            <Input
                                label="Nr de contract"
                                type="text"
                                value={extraInfo[selectTicketId]?.numar_de_contract || ""}
                                onChange={(e) => handleFieldChange("numar_de_contract", e.target.value)}
                                className={`input-field ${fieldErrors.numar_de_contract ? "invalid-field" : ""}`}
                                placeholder="Nr de contract"
                                id="contract-number-input"
                            />

                            <Input
                                label="Data contractului"
                                type="date"
                                value={extraInfo[selectTicketId]?.data_contractului || ""}
                                onChange={(e) => handleFieldChange("data_contractului", e.target.value)}
                                className={`input-field ${fieldErrors.data_contractului ? "invalid-field" : ""}`}
                            />

                            <div className="toggle-container">
                                <label className="toggle-label">{translations['Contract trimis']?.[language]}</label>
                                <label className={`switch ${fieldErrors.contract_trimis ? "invalid-toggle" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={extraInfo[selectTicketId]?.contract_trimis || false}
                                        onChange={(e) => handleFieldChange("contract_trimis", e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div className="toggle-container">
                                <label className="toggle-label">{translations['Contract semnat']?.[language]}</label>
                                <label className={`switch ${fieldErrors.contract_semnat ? "invalid-toggle" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={extraInfo[selectTicketId]?.contract_semnat || false}
                                        onChange={(e) => handleFieldChange("contract_semnat", e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <Input
                                label="Operator turistic"
                                type="text"
                                value={extraInfo[selectTicketId]?.tour_operator || ""}
                                onChange={(e) => handleFieldChange("tour_operator", e.target.value)}
                                className={`input-field ${fieldErrors.tour_operator ? "invalid-field" : ""}`}
                                placeholder="Operator turistic"
                                id="tour-operator-input"
                            />

                            <Input
                                label="Nr cererii de la operator"
                                type="text"
                                value={extraInfo[selectTicketId]?.numarul_cererii_de_la_operator || ""}
                                onChange={(e) => handleFieldChange("numarul_cererii_de_la_operator", e.target.value)}
                                className={`input-field ${fieldErrors.numarul_cererii_de_la_operator ? "invalid-field" : ""}`}
                                placeholder="Nr cererii de la operator"
                                id="tour-operator-input"
                            />

                            <div className="toggle-container">
                                <label className="toggle-label">{translations['Achitare efectuată']?.[language]}</label>
                                <label className={`switch ${fieldErrors.achitare_efectuata ? "invalid-toggle" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={extraInfo[selectTicketId]?.achitare_efectuata || false}
                                        onChange={(e) => handleFieldChange("achitare_efectuata", e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div className="toggle-container">
                                <label className="toggle-label">{translations['Rezervare confirmată']?.[language]}</label>
                                <label className={`switch ${fieldErrors.rezervare_confirmata ? "invalid-toggle" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={extraInfo[selectTicketId]?.rezervare_confirmata || false}
                                        onChange={(e) => handleFieldChange("rezervare_confirmata", e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div className="toggle-container">
                                <label className="toggle-label">{translations['Contract arhivat']?.[language]}</label>
                                <label className={`switch ${fieldErrors.contract_arhivat ? "invalid-toggle" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={extraInfo[selectTicketId]?.contract_arhivat || false}
                                        onChange={(e) => handleFieldChange("contract_arhivat", e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <Select
                                options={paymentStatusOptions}
                                label="Plată primită"
                                id="payment-select"
                                value={extraInfo[selectTicketId]?.statutul_platii || ""}
                                onChange={(value) => handleFieldChange("statutul_platii", value)}
                                hasError={fieldErrors.statutul_platii}
                            />
                            <Input
                                label="Avans euro €"
                                value={extraInfo[selectTicketId]?.avans_euro || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'avans_euro', e.target.value)
                                }
                                className="input-field"
                                placeholder="Avans euro"
                                id="price-neto-input"
                            />
                            <Input
                                label="Data avansului"
                                type="date"
                                value={extraInfo[selectTicketId]?.data_avansului || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'data_avansului', e.target.value)
                                }
                                className="input-field"
                            />
                            <Input
                                label="Data de plată integrală"
                                type="date"
                                value={extraInfo[selectTicketId]?.data_de_plata_integrala || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'data_de_plata_integrala', e.target.value)
                                }
                                className="input-field"
                            />
                            <Input
                                label="Preț NETTO €"
                                value={extraInfo[selectTicketId]?.pret_netto || ""}
                                onChange={(e) => handleFieldChange("pret_netto", e.target.value)}
                                className={`input-field ${fieldErrors.pret_netto ? "invalid-field" : ""}`}
                                placeholder="Preț netto (euro)"
                                id="price-neto-input"
                            />
                            <Input
                                label="Achitat client"
                                value={extraInfo[selectTicketId]?.achitat_client || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'achitat_client', e.target.value)
                                }
                                className="input-field"
                                placeholder="Achitat client"
                                id="achitat-client"
                            />
                            <Input
                                label="Restanță client"
                                value={extraInfo[selectTicketId]?.restant_client || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'restant_client', e.target.value)
                                }
                                className="input-field"
                                placeholder="Restanță client"
                                id="price-neto-input"
                                disabled={true}
                            />
                            <Input
                                label="Comision companie €"
                                value={extraInfo[selectTicketId]?.comission_companie || ""}
                                onChange={(e) => handleFieldChange("comission_companie", e.target.value)}
                                className={`input-field ${fieldErrors.comission_companie ? "invalid-field" : ""}`}
                                placeholder="Comision companie"
                                id="commission-input"
                                disabled={true}
                            />
                            <Input
                                label="Statut achitare"
                                value={extraInfo[selectTicketId]?.restant_client || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'restant_client', e.target.value)
                                }
                                className="input-field"
                                placeholder="Statut achitare"
                                id="commission-input"
                                disabled={true}
                            />
                            {isAdmin && (
                                <div className="toggle-container">
                                    <label className="toggle-label">Control Admin</label>
                                    <label className={`switch ${fieldErrors.control_admin ? "invalid-toggle" : ""}`}>
                                        <input
                                            type="checkbox"
                                            checked={extraInfo[selectTicketId]?.control_admin || false}
                                            onChange={(e) =>
                                                handleSelectChangeExtra(selectTicketId, 'control_admin', e.target.checked)
                                            }
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'Invoice' && selectTicketId && (
                        <div className="extra-info-content">
                            <Input
                                label="F/service"
                                value={extraInfo[selectTicketId]?.f_serviciu || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'f_serviciu', e.target.value)
                                }
                                className="input-field"
                                placeholder="F/service"
                                id="f_serviciu"
                            />
                            <Input
                                label="F/factura"
                                value={extraInfo[selectTicketId]?.f_nr_factura || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'f_nr_factura', e.target.value)
                                }
                                className="input-field"
                                placeholder="F/factura"
                                id="f_nr_factura"
                            />
                            <Input
                                label="F/numarul"
                                value={extraInfo[selectTicketId]?.f_numarul || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'f_numarul', e.target.value)
                                }
                                className="input-field"
                                placeholder="F/numarul"
                                id="f_numarul"
                            />
                            <Input
                                label="F/preț"
                                value={extraInfo[selectTicketId]?.f_pret || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'f_pret', e.target.value)
                                }
                                className="input-field"
                                placeholder="F/preț"
                                id="f_pret"
                            />
                            <Input
                                label="F/sumă"
                                value={extraInfo[selectTicketId]?.f_suma || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'f_suma', e.target.value)
                                }
                                className="input-field"
                                placeholder="F/sumă"
                                id="f_suma"
                            />
                            <Select
                                options={valutaOptions}
                                label="Valuta contului"
                                id="payment-select"
                                value={extraInfo[selectTicketId]?.valuta_contului || ""}
                                onChange={(value) =>
                                    handleSelectChangeExtra(selectTicketId, 'valuta_contului', value)
                                }
                            />
                            <Select
                                options={ibanOptions}
                                label="IBAN"
                                id="payment-select"
                                value={extraInfo[selectTicketId]?.iban || ""}
                                onChange={(value) =>
                                    handleSelectChangeExtra(selectTicketId, 'iban', value)
                                }
                            />
                            {/* <Select
                                options={paymentStatusOptions}
                                label="Adaugă document"
                                id="payment-select"
                                value={extraInfo[selectTicketId]?.adauga_document || ""}
                                onChange={(value) =>
                                    handleSelectChangeExtra(selectTicketId, 'adauga_document', value)
                                }
                            /> */}
                            {/* /<div>document list</div> */}
                        </div>
                    )}
                    {activeTab === 'Media' && selectTicketId && (
                        <div className="extra-info-content">
                            {messages
                                .filter((msg) => ['audio', 'video', 'image', 'file'].includes(msg.mtype) && msg.ticket_id === selectTicketId)
                                .map((msg, index) => (
                                    <div key={index} className="media-container">
                                        {/* Отображение времени отправки с учетом формата "dd-MM-yyyy HH:mm:ss" */}
                                        <div className="sent-time">
                                            {(() => {
                                                const parseCustomDate = (dateStr) => {
                                                    if (!dateStr) return "—";
                                                    const [datePart, timePart] = dateStr.split(" ");
                                                    const [day, month, year] = datePart.split("-").map(Number);
                                                    const [hours, minutes, seconds] = timePart.split(":").map(Number);
                                                    return new Date(year, month - 1, day, hours, minutes, seconds);
                                                };
                                                return parseCustomDate(msg.time_sent).toLocaleString("ru-RU", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                });
                                            })()}
                                        </div>

                                        {/* Отображение медиафайлов */}
                                        {msg.mtype === "image" ? (
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
                                        ) : msg.mtype === "video" ? (
                                            <video controls className="video-preview">
                                                <source src={msg.message} type="video/mp4" />
                                                {translations["Acest browser nu suporta video"][language]}
                                            </video>
                                        ) : msg.mtype === "audio" ? (
                                            <audio controls className="audio-preview">
                                                <source src={msg.message} type="audio/ogg" />
                                                {translations["Acest browser nu suporta audio"][language]}
                                            </audio>
                                        ) : msg.mtype === "file" ? (
                                            <a
                                                href={msg.message}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="file-link"
                                            >
                                                {translations["Deschide file"][language]}
                                            </a>
                                        ) : null}
                                    </div>
                                ))}
                        </div>
                    )}
                    {activeTab === 'Control calitate' && selectTicketId && (
                        <div className="extra-info-content">
                            <Select
                                options={motivulRefuzuluiOptions}
                                label="Motivul refuzului"
                                id="motivul_refuzului"
                                value={extraInfo[selectTicketId]?.motivul_refuzului || ""}
                                onChange={(value) => handleFieldChange("motivul_refuzului", value)}
                                hasError={fieldErrors.motivul_refuzului}
                            />
                            <Select
                                options={evaluareOdihnaOptions}
                                label="Evaluare odihnă"
                                id="evaluare_de_odihna"
                                value={extraInfo[selectTicketId]?.evaluare_de_odihna || ""}
                                onChange={(value) =>
                                    handleSelectChangeExtra(selectTicketId, 'evaluare_de_odihna', value)
                                }
                            />
                            <Input
                                label="Următoarea vacanță"
                                value={extraInfo[selectTicketId]?.urmatoarea_vacanta || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'urmatoarea_vacanta', e.target.value)
                                }
                                className="input-field"
                                placeholder="Următoarea vacanță"
                                id="urmatoarea_vacanta"
                            />
                            <Input
                                label="Manager"
                                value={extraInfo[selectTicketId]?.manager || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'manager', e.target.value)
                                }
                                className="input-field"
                                placeholder="Manager"
                                id="manager"
                            />
                            <Input
                                label="Vacanța"
                                value={extraInfo[selectTicketId]?.vacanta || ""}
                                onChange={(e) =>
                                    handleSelectChangeExtra(selectTicketId, 'vacanta', e.target.value)
                                }
                                className="input-field"
                                placeholder="Vacanța"
                                id="vacanta"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;