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
import DatePicker from 'react-datepicker';

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
                        <div>Responsabil - select cu toti operatorii</div>
                        <label>
                            Sale (suma finala care achita clientul ?)
                            <input
                                type="text"
                                value={extraInfo[selectedTicketId]?.sale || ""}
                                onChange={(e) => handleSelectChange(selectedTicketId, 'sale', e.target.value)}
                                className="input-field"
                            />
                        </label>
                        <div className='selects-container'>
                            <Select
                                options={sourceOfLeadOptions}
                                label="Lead Source"
                                id="lead-source-select"
                                value={extraInfo[selectedTicketId]?.leadSource || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'leadSource', value)}
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
                                value={extraInfo[selectedTicketId]?.excursie || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'excursie', value)}
                            />
                            <div>data plecarii</div>
                            <div>data intoarcerii + ora</div>
                            <Select
                                options={purchaseProcessingOptions}
                                label="Purchase"
                                id="purchase-select"
                                value={extraInfo[selectedTicketId]?.purchase || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'purchase', value)}
                            />
                            <div>Nr de contract</div>
                            <div>Data contractului</div>
                            <div>Tour operator </div>
                            <div>Nr cererii de la operator - coincide cu nr de contract ? </div>
                            <div>Pret neto furnizor Euro - input - string (euro) ex. 460 euro</div>
                            <div>Comision companie - 100 euro (auto calculated)</div>
                            <Select
                                options={paymentStatusOptions}
                                label="Payment"
                                id="payment-select"
                                value={extraInfo[selectedTicketId]?.payment || ""}
                                onChange={(value) => handleSelectChange(selectedTicketId, 'payment', value)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatComponent;




















// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import CryptoJS from 'crypto-js';
// import AES from 'crypto-js/aes';
// import Utf8 from 'crypto-js/enc-utf8';
// import '/Users/maksimbordan/Documents/PandaTurFront/pantatur-front/src/Components/ChatComponent/chat.css';
// import { useUser } from '../../UserContext';

// const ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef';
// const RECONNECT_INTERVAL = 5000; // Интервал для переподключения в миллисекундах

// // Функции шифрования и дешифрования
// const encrypt = (text) => {
//     const iv = CryptoJS.lib.WordArray.random(16);
//     const encrypted = AES.encrypt(text, CryptoJS.enc.Hex.parse(ENCRYPTION_KEY), {
//         iv,
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.Pkcs7,
//     });
//     return `${iv.toString(CryptoJS.enc.Hex)}:${encrypted.ciphertext.toString(CryptoJS.enc.Hex)}`;
// };

// const decrypt = (text) => {
//     const [ivHex, encryptedText] = text.split(':');
//     const decrypted = AES.decrypt(
//         { ciphertext: CryptoJS.enc.Hex.parse(encryptedText) },
//         CryptoJS.enc.Hex.parse(ENCRYPTION_KEY),
//         {
//             iv: CryptoJS.enc.Hex.parse(ivHex),
//             mode: CryptoJS.mode.CBC,
//             padding: CryptoJS.pad.Pkcs7,
//         }
//     );
//     return decrypted.toString(Utf8);
// };

// const ChatComponent = () => {
//     const { userId } = useUser();
//     const [managerMessage, setManagerMessage] = useState('');
//     const [messages, setMessages] = useState([]);
//     const ws = useRef(null);
//     const messageContainerRef = useRef(null);
//     const reconnectTimer = useRef(null);

//     const connectWebSocket = useCallback(() => {
//         ws.current = new WebSocket('ws://34.65.204.80:8080');

//         ws.current.onopen = () => {
//             console.log('Connected to chat server');
//             clearTimeout(reconnectTimer.current);
//         };

//         ws.current.onmessage = (event) => {
//             try {
//                 const { client_id, sender_id, message, time_sent } = JSON.parse(event.data);
//                 if (message) {
//                     const decryptedMessage = decrypt(message);
//                     setMessages((prevMessages) => [
//                         ...prevMessages,
//                         { client_id, sender_id, text: decryptedMessage, time_sent }
//                     ]);
//                 }
//             } catch (error) {
//                 console.error('Failed to decrypt message:', error);
//             }
//         };

//         ws.current.onerror = (error) => console.error('Connection error:', error);

//         ws.current.onclose = () => {
//             console.log('Disconnected from chat server. Attempting to reconnect...');
//             reconnectWebSocket();
//         };
//     }, []);

//     const reconnectWebSocket = useCallback(() => {
//         if (!reconnectTimer.current) {
//             reconnectTimer.current = setTimeout(() => {
//                 console.log('Reconnecting to chat server...');
//                 connectWebSocket();
//             }, RECONNECT_INTERVAL);
//         }
//     }, [connectWebSocket]);

//     // Соединение с WebSocket при монтировании компонента
//     useEffect(() => {
//         connectWebSocket();
//         return () => {
//             if (ws.current) ws.current.close();
//             if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
//         };
//     }, [connectWebSocket, reconnectWebSocket]);

//     // Отправка сообщения
//     const sendMessage = () => {
//         if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//             if (managerMessage.trim()) {
//                 const encryptedMessage = encrypt(managerMessage);
//                 const messageData = {
//                     client_id: userId,
//                     sender_id: userId,
//                     message: encryptedMessage,
//                 };

//                 ws.current.send(JSON.stringify(messageData));
//                 console.log('Message sent:', messageData);
//                 setManagerMessage('');
//             } else {
//                 console.warn('Message cannot be empty');
//             }
//         } else {
//             console.error('WebSocket is not open');
//         }
//     };

//     // Прокрутка вниз при новом сообщении
//     useEffect(() => {
//         if (messageContainerRef.current) {
//             messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
//         }
//     }, [messages]);

//     // Получение сообщений при монтировании компонента
//     const fetchMessages = useCallback(async () => {
//         try {
//             const response = await fetch(`https://pandaturapi.com/messages/client/${userId}`);
//             if (!response.ok) throw new Error('Failed to fetch messages');

//             const data = await response.json();
//             console.log('Fetched messages:', data);

//             const decryptedMessages = (Array.isArray(data) ? data : []).map(({ client_id, sender_id, message, time_sent }) => ({
//                 client_id,
//                 sender_id,
//                 text: decrypt(message), // Дешифровка сообщения перед сохранением
//                 time_sent,
//             }));

//             setMessages(decryptedMessages);
//         } catch (error) {
//             console.error('Error fetching messages:', error);
//         }
//     }, [userId]);

//     useEffect(() => {
//         fetchMessages();
//     }, [fetchMessages]);

//     return (
//         <div className="chat-container">
//             <div className="users-container">Chat List</div>
//             <div className="chat-area">
//                 <div className="chat-messages" ref={messageContainerRef}>
//                     {messages.map((msg, index) => (
//                         <div
//                             key={index}
//                             className={`message ${msg.sender_id === userId ? 'sent' : 'received'}`}
//                         >
//                             <div className="text">{msg.text}</div>
//                             <div className="message-time">{msg.time_sent}</div>
//                         </div>
//                     ))}
//                 </div>
//                 <div className="manager-send-message-container">
//                     <textarea
//                         className="text-area-message"
//                         value={managerMessage}
//                         onChange={(e) => setManagerMessage(e.target.value)}
//                         placeholder="Type your message..."
//                     />
//                     <div className="btn-send-message">
//                         <button className="send-button" onClick={sendMessage}>Send</button>
//                         <button className="file-button">Attach</button>
//                     </div>
//                 </div>
//             </div>
//             <div className="extra-info">Additional Information</div>
//         </div>
//     );
// };

// export default ChatComponent;
