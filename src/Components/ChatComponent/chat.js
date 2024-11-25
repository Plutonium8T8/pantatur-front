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
import { responsabilLead } from '../../FormOptions/ResponsabilLead';
import DatePicker from 'react-datepicker';
import Input from '../InputComponent/InputComponent';

import "react-datepicker/dist/react-datepicker.css";

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
    const navigate = useNavigate();
    const { ticketId } = useParams(); // Получаем ticketId из URL

    const handleTicketClick = (ticketId) => {
        setSelectedTicketId(ticketId); // Устанавливаем выбранный тикет
        navigate(`/chat/${ticketId}`); // Меняем путь в браузере
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

    // Загружаем тикеты при монтировании компонента
    useEffect(() => {
        fetchTickets();
    }, []);

    // Прокрутка вниз при новом сообщении
    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Отправка сообщения
    const sendMessage = () => {
        if (managerMessage.trim()) {
            const encryptedMessage = encrypt(managerMessage);
            const newMessage = {
                chat_id: selectedTicketId,  // Используем selectedTicketId вместо selectedChatId
                client_id: userId,
                sender_id: userId,
                text: decrypt(encryptedMessage),
                time_sent: new Date().toLocaleTimeString(),
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setManagerMessage('');
        } else {
            console.warn('Message cannot be empty');
        }
    };

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

    // Используйте useEffect для логирования изменений в extraInfo
    useEffect(() => {
        console.log("Текущее состояние extraInfo:", extraInfo);
    }, [extraInfo]);
    // отправка данных в бэк
    const sendExtraInfo = async () => {
        if (!selectedTicketId) {
            console.warn('Нет выбранного тикета для отправки данных.');
            return;
        }

        const token = Cookies.get('jwt'); // Получение токена из cookie
        const ticketExtraInfo = extraInfo[selectedTicketId]; // Получаем информацию для выбранного тикета

        if (!ticketExtraInfo) {
            console.warn('Нет дополнительной информации для выбранного тикета.');
            return;
        }

        try {
            const response = await fetch(`https://pandaturapi.com/ticket-info/${selectedTicketId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ticketId: selectedTicketId,
                    ...ticketExtraInfo, // Отправляем дополнительную информацию
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при отправке данных');
            }

            const result = await response.json();
            console.log('Данные успешно отправлены:', result);
        } catch (error) {
            console.error('Ошибка при отправке дополнительной информации:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="users-container">
                <h3>Ticket List</h3>
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className={`chat-item ${ticket.id === selectedTicketId ? 'active' : ''}`}
                        onClick={() => handleTicketClick(ticket.id)} // Навигация и установка состояния
                    >
                        <div>{ticket.contact || "no contact"}</div>
                        <div>{ticket.transport || "no transport"}</div>
                        <div>{ticket.country || "no country"}</div>
                        <div>{ticket.id || "no ID"}</div>
                    </div>
                ))}
            </div>
            <div className="chat-area">
                <div className="chat-messages" ref={messageContainerRef}>
                    {messages.filter((msg) => msg.chat_id === selectedTicketId).map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.sender_id === userId ? 'sent' : 'received'}`}
                        >
                            <div className="text">{msg.text}</div>
                            <div className="message-time">{msg.time_sent}</div>
                        </div>
                    ))}
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
                            <Select
                                options={responsabilLead}
                                label="Responsabil lead"
                                id="ResponsabilLead"
                                value={extraInfo[selectedTicketId]?.responsabilLead || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'responsabilLead', value)}
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
                                        dateFormat="dd.MM.yyyy HH:mm"
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15} // Интервалы времени, например, каждые 15 минут
                                        timeCaption="Ora"  // Заголовок для секции времени
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
                                        dateFormat="dd.MM.yyyy HH:mm"
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15} // Интервалы времени, например, каждые 15 минут
                                        timeCaption="Ora"
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
                                    dateFormat="dd.MM.yyyy HH:mm"
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15} // Интервалы времени, например, каждые 15 минут
                                    timeCaption="Ora"
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
                            <label>Comision companie - 100 euro (auto calculated)</label>
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
                                Отправить дополнительную информацию
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatComponent;