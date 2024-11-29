import React, { useState, useEffect, useRef } from 'react';
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
import TechnicianSelect from '../../FormOptions/ResponsabilLead';
import DatePicker from 'react-datepicker';
import Input from '../InputComponent/InputComponent';
import Workflow from '../WorkFlowComponent/WorkflowComponent';
import "react-datepicker/dist/react-datepicker.css";
import { useSocket } from '../../SocketContext';

import './chat.css';

const ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef';

// Функции шифрования и дешифрования
const encrypt = (text) => {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = AES.encrypt(text, CryptoJS.enc.Hex.parse(ENCRYPTION_KEY), {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return `${iv.toString(CryptoJS.enc.Hex)}:${encrypted.ciphertext.toString(CryptoJS.enc.Hex)}`;
};

const decrypt = (text) => {
    const [ivHex, encryptedText] = text.split(':');
    const decrypted = AES.decrypt(
        { ciphertext: CryptoJS.enc.Hex.parse(encryptedText) },
        CryptoJS.enc.Hex.parse(ENCRYPTION_KEY),
        {
            iv: CryptoJS.enc.Hex.parse(ivHex),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    );
    return decrypted.toString(Utf8);
};

const ChatComponent = () => {
    const { userId } = useUser();
    const [managerMessage, setManagerMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null); // ID выбранного тикета
    const [extraInfo, setExtraInfo] = useState({}); // Состояние для дополнительной информации каждого тикета
    const [tickets, setTickets] = useState([]);
    const messageContainerRef = useRef(null);
    const { ticketId } = useParams(); // Получаем ticketId из URL
    const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const socket = useSocket(); // Получаем WebSocket из контекста
    const [errorMessage, setErrorMessage] = useState(''); // Состояние для ошибок
    const [ticketIds, setTicketIds] = useState([]); // Состояние для хранения ID тикетов

    const handleTicketClick = (ticketId) => {
        setSelectedTicketId(ticketId); // Устанавливаем выбранный тикет
        navigate(`/chat/${ticketId}`);
        fetchTicketsID();
        // Меняем путь в браузере
    };

    useEffect(() => {
        // Если ticketId передан через URL, устанавливаем его как selectedTicketId
        if (ticketId) {
            setSelectedTicketId(Number(ticketId));
        }
    }, [ticketId]);

    useEffect(() => {
        console.log("Selected Ticket ID:", selectedTicketId);
        if (selectedTicketId) {
            console.log("Extra info for selected ticket:", extraInfo[selectedTicketId] || "No extra info available");
        }
    }, [selectedTicketId]);

    useEffect(() => {
        if (selectedTicketId) {
            fetchTicketExtraInfo(selectedTicketId); // Загружаем дополнительную информацию при изменении тикета
        }
    }, [selectedTicketId]);

    const navigate = useNavigate(); // Хук для навигации

    // Получение тикетов через fetch
    const fetchTickets = async () => {

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const token = Cookies.get('jwt');
            const response = await fetch('https://pandaturapi.com/api/tickets', {
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
            setTickets(...data); // Устанавливаем данные тикетов
            console.log("+++ Загруженные тикеты:", data);
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    // Получение дополнительной информации для тикета
    const fetchTicketExtraInfo = async (selectedTicketId) => {
        try {
            const token = Cookies.get('jwt');
            const response = await fetch(`https://pandaturapi.com/ticket-info/${selectedTicketId}`, {
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

            // Обновляем состояние с дополнительной информацией о тикете
            setExtraInfo((prevState) => ({
                ...prevState,
                [selectedTicketId]: data, // Сохраняем информацию для текущего тикета
            }));

            // Обновляем состояние с выбранным technician_id
            setSelectedTechnicianId(data.technician_id); // Устанавливаем technician_id в состояние

        } catch (error) {
            console.error('Ошибка при получении дополнительной информации:', error);
        }
    };

    useEffect(() => {
        if (selectedTicketId) {
            fetchTicketExtraInfo(selectedTicketId);
        }
    }, [selectedTicketId]); // Перезапуск эффекта при изменении selectedTicketId

    // Загружаем тикеты при монтировании компонента
    useEffect(() => {
        fetchTickets();
    }, []);

    //  Прокрутка вниз при новом сообщении
    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const showNotification = (data) => {
        console.log('Notification:', data);
    };

    const handleTask = (data) => {
        console.log('Task:', data);
    };


    // Отправка сообщения
    const sendMessage = () => {
        if (!managerMessage.trim()) {
            return;
        }

        if (socket) {
            console.log('WebSocket state before sending message:', socket.readyState); // Логируем состояние WebSocket

            if (socket.readyState === WebSocket.OPEN) {
                setTimeout(() => {
                    const currentTime = new Date().toISOString();

                    const messageData = {
                        type: 'message',
                        data: {
                            sender_id: userId,
                            chatRoomIds: [selectedTicketId],
                            platform: 'web',
                            text: managerMessage,
                            time_sent: currentTime
                        }
                    };

                    try {
                        socket.send(JSON.stringify(messageData)); // Отправка сообщения
                        console.log('Message sent:', messageData); // Логируем отправленное сообщение

                        // setMessages((prevMessages) => [
                        //     ...prevMessages,
                        //     {
                        //         chatRoomId: selectedTicketId,
                        //         sender_id: userId,
                        //         text: managerMessage,
                        //         time_sent: currentTime
                        //     }
                        // ]);

                        setManagerMessage('');
                    } catch (error) {
                        console.error('Error sending message:', error); // Логируем ошибки отправки
                    }
                }, 100); // Задержка 100 мс перед отправкой
            } else {
                console.error('WebSocket не открыт, не удается отправить сообщение.');
            }
        } else {
            console.error('Socket is null.');
        }
    };


    useEffect(() => {
        if (socket) {
            socket.onopen = () => {
                console.log('WebSocket подключен');
            };

            socket.onerror = (error) => {
                console.error('WebSocket ошибка:', error); // Логируем ошибки WebSocket
            };

            socket.onclose = () => {
                console.log('WebSocket закрыт');
            };

            socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('Received message:', message); // Логируем все полученные сообщения

                    console.log('Selected Ticket ID:', selectedTicketId);

                    switch (message.type) {
                        case 'message':
                            if (message.data.chatRoomId === selectedTicketId) {
                                console.log('Adding message to state:', message.data); // Логируем сообщение перед добавлением в состояние
                                setMessages((prevMessages) => {
                                    const updatedMessages = [...prevMessages, message.data];
                                    console.log('Updated messages state:', updatedMessages); // Логируем обновленное состояние
                                    return updatedMessages;
                                });
                            } else {
                                console.log(`Message's chatRoomId (${message.data.chatRoomId}) does not match selectedTicketId (${selectedTicketId})`);
                            }
                            break;
                        case 'notification':
                            console.log('Notification received:', message.data);
                            showNotification(message.data); // Показываем уведомление
                            break;
                        case 'task':
                            console.log('Task received:', message.data);
                            handleTask(message.data); // Обрабатываем задачу
                            break;
                        default:
                            console.warn('Unknown message type:', message);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
        }

        return () => {
            if (socket) {
                socket.onmessage = null;
                socket.onerror = null;
                socket.onclose = null;
            }
        };
    }, [socket, selectedTicketId]);


    // Перезапуск при изменении `socket` или `selectedTicketId`   

    // Обработчик изменения значения в селекте для выбранного тикета
    const handleSelectChange = (ticketId, field, value) => {
        console.log(`Изменение значения селекта: ticketId=${ticketId}, field=${field}, value=${value}`);
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

    // Используйте useEffect для логирования изменений в extraInfo
    useEffect(() => {
        console.log("Текущее состояние extraInfo:", extraInfo);
    }, [extraInfo]);

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
            const response = await fetch(`https://pandaturapi.com/ticket-info/${selectedTicketId}`, {
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
            console.log('Данные успешно отправлены:', result);
        } catch (error) {
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

        const updatedTicket = tickets.find(ticket => ticket.id === selectedTicketId); // Найдем тикет

        if (!updatedTicket) {
            console.error("Тикет не найден");
            return; // Если тикет не найден, прекращаем выполнение
        }

        try {
            // Отправляем PATCH запрос на сервер
            const token = Cookies.get("jwt");
            const response = await fetch(`https://pandaturapi.com/api/tickets/${updatedTicket.id}`, {
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

            // Обновляем локальное состояние
            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket.id === updatedTicket.id ? { ...ticket, workflow: newWorkflow } : ticket
                )
            );

            console.log("Workflow обновлен:", data);
        } catch (error) {
            console.error("Ошибка при обновлении workflow:", error);
        }
    };

    const updatedTicket = tickets.find(ticket => ticket.id === selectedTicketId);

    const fetchTicketsID = async () => {
        try {
            setIsLoading(true); // Показываем индикатор загрузки
            const token = Cookies.get('jwt');
            const response = await fetch('https://pandaturapi.com/api/tickets', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                console.warn('Ошибка 401: Неавторизован. Перенаправляем на логин.');
                setErrorMessage('Ошибка авторизации. Попробуйте снова.');
                return;
            }

            if (!response.ok) {
                throw new Error('Ошибка при получении данных тикетов');
            }

            const data = await response.json();
            const tickets = data[0]; // Доступ к первому элементу
            const TicketIds = tickets.map((ticket) => ticket.id);

            setTicketIds(TicketIds);
            setTickets(tickets);

            // Отправляем сообщение в WebSocket после успешного получения ID
            if (socket && socket.readyState === WebSocket.OPEN) {
                const message = {
                    type: 'connect',
                    data: {
                        chatRoomIds: TicketIds, // Используем полученные ID
                    },
                };
                socket.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setErrorMessage('Ошибка при загрузке тикетов');
        } finally {
            setIsLoading(false); // Скрываем индикатор загрузки
        }
    };

    useEffect(() => {
        // fetchTicketsID();
      }, []);  // Empty dependency array ensures it only runs once on mount
      
    return (
        <div className="chat-container">
            <div className="users-container">
                <h3>Chat List</h3>
                <div className='chat-item-container'>
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className={`chat-item ${ticket.id === selectedTicketId ? 'active' : ''}`}
                        onClick={() => handleTicketClick(ticket.id)} // Навигация и установка состояния
                    >
                        <div className='foto-description'>
                            <div><img className='foto-user' src="/user fon.png" alt="example" /> </div>
                            <div className='tickets-descriptions'>
                                <div>{ticket.contact || "no contact"}</div>
                                {/* <div>{ticket.transport || "no transport"}</div> */}
                                {/* <div>{ticket.country || "no country"}</div> */}
                                <div>{ticket.id ? `Lead: #${ticket.id}` : "no id"}</div>
                                <div>{ticket.workflow || "no workflow"}</div>
                            </div>
                        </div>
                        <div className='container-time-tasks-chat'>
                            <div></div>
                            <div>local time</div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
            <div className="chat-area">
                <div className="chat-messages" ref={messageContainerRef}>
                    {messages
                        .filter((msg) => msg.chatRoomId === selectedTicketId) // Сообщения только для выбранного чата
                        .map((msg, index) => {
                            // Логируем каждое сообщение перед рендером
                            console.log('Rendering message:', msg);

                            // Проверка на необходимые поля
                            if (!msg.chatRoomId || !msg.sender_id || !msg.text || !msg.time_sent) {
                                console.warn('Invalid message data:', msg); // Логируем некорректные данные
                                return null;
                            }

                            // Отображаем только сообщения для текущего чата
                            if (msg.chatRoomId !== selectedTicketId) return null;

                            return (
                                <div
                                    key={msg.id || `${msg.chatRoomId}-${index}`} // Уникальный ключ для каждого сообщения
                                    className={`message ${msg.sender_id === userId ? 'sent' : 'received'}`}
                                >
                                    <div className="text">{msg.text}</div>
                                    <div className="message-time">
                                        {new Date(msg.time_sent).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })}
                </div>

                <div className="manager-send-message-container">
                    <textarea
                        className="text-area-message"
                        value={managerMessage}
                        onChange={(e) => setManagerMessage(e.target.value)}
                        placeholder="Type your message..."
                    />
                    <div className="btn-send-message">
                        <button className="send-button" onClick={sendMessage}>Send</button>
                        <button className="file-button">Attach</button>
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