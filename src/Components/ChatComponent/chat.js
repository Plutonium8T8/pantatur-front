import React, { useState, useEffect, useRef } from 'react';
import CryptoJS from 'crypto-js';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { useUser } from '../../UserContext';
import Cookies from 'js-cookie';
import '/Users/maksimbordan/Documents/PandaTurFront/pantatur-front/src/Components/ChatComponent/chat.css';

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
    const [extraInfoInput, setExtraInfoInput] = useState("1");
    const [dropdownValue, setDropdownValue] = useState("Option1"); // значение по умолчанию для выпадающего списка
    const [tickets, setTickets] = useState([]);
    const messageContainerRef = useRef(null);

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

    return (
        <div className="chat-container">
            <div className="users-container">
                <h3>Ticket List</h3>
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className={`chat-item ${ticket.id === selectedTicketId ? 'active' : ''}`}
                        onClick={() => setSelectedTicketId(ticket.id)} // Выбираем тикет
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
                <label>
                    Responsabil
                    <input
                        type="text"
                        value={extraInfoInput}
                        onChange={(e) => setExtraInfoInput(e.target.value)}
                        className="input-field"
                    />
                </label>
                <label>
                    Responsabil
                    <input
                        type="text"
                        value={extraInfoInput}
                        onChange={(e) => setExtraInfoInput(e.target.value)}
                        className="input-field"
                    />
                </label>
                <label>
                    Responsabil
                    <input
                        type="text"
                        value={extraInfoInput}
                        onChange={(e) => setExtraInfoInput(e.target.value)}
                        className="input-field"
                    />
                </label>
                <label>
                    Responsabil
                    <input
                        type="text"
                        value={extraInfoInput}
                        onChange={(e) => setExtraInfoInput(e.target.value)}
                        className="input-field"
                    />
                </label>
                <label>
                    Responsabil
                    <input
                        type="text"
                        value={extraInfoInput}
                        onChange={(e) => setExtraInfoInput(e.target.value)}
                        className="input-field"
                    />
                </label>
                <label>
                    Responsabil
                    <input
                        type="text"
                        value={extraInfoInput}
                        onChange={(e) => setExtraInfoInput(e.target.value)}
                        className="input-field"
                    />
                </label>
                <label>
                    Responsabil
                    <input
                        type="text"
                        value={extraInfoInput}
                        onChange={(e) => setExtraInfoInput(e.target.value)}
                        className="input-field"
                    />
                </label>
                
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
