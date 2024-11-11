import React, { useState, useEffect, useRef } from 'react';
import CryptoJS from 'crypto-js';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import '/Users/maksimbordan/Documents/PandaTurFront/pantatur-front/src/Components/ChatComponent/chat.css';
import { useUser } from '../../UserContext';

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
    const [selectedChatId, setSelectedChatId] = useState(1); // ID выбранного чата
    const [extraInfoInput, setExtraInfoInput] = useState("1");
    const [dropdownValue, setDropdownValue] = useState("Option1"); // значение по умолчанию для выпадающего списка
    const [chats, setChats] = useState([
        { id: 1, name: 'Nume clinet 1' }, 
        { id: 2, name: 'Nume clinet 2' }, 
        { id: 3, name: 'Nume clinet 3' }, 
        { id: 4, name: 'Nume clinet 4' }, 
        { id: 5, name: 'Nume clinet 5' }, 
        { id: 6, name: 'Nume clinet 6' }, 
        { id: 7, name: 'Nume clinet 7' }, 
        { id: 8, name: 'Nume clinet 8' }, 
        { id: 9, name: 'Nume clinet 9' }, 
        { id: 10, name: 'Nume clinet 10' }, 
        { id: 11, name: 'Nume clinet 11' }, 
        { id: 12, name: 'Nume clinet 12' }, 
        { id: 13, name: 'Nume clinet 13' }, 
        { id: 14, name: 'Nume clinet 14' }, 
        { id: 15, name: 'Nume clinet 15' }, 
        { id: 16, name: 'Nume clinet 16' }, 
        { id: 17, name: 'Nume clinet 17' }, 
        { id: 18, name: 'Nume clinet 18' }, 
        { id: 19, name: 'Nume clinet 19' }
    ]); // Пример списка чатов

    const messageContainerRef = useRef(null);

    const filteredMessages = messages.filter((msg) => msg.chat_id === selectedChatId);

    // Отправка сообщения
    const sendMessage = () => {
        if (managerMessage.trim()) {
            const encryptedMessage = encrypt(managerMessage);
            const newMessage = {
                chat_id: selectedChatId,
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

    // Прокрутка вниз при новом сообщении
    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [filteredMessages]);

    return (
        <div className="chat-container">
            <div className="users-container">
                <h3>Chat List</h3>
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className={`chat-item ${chat.id === selectedChatId ? 'active' : ''}`}
                        onClick={() => setSelectedChatId(chat.id)}
                    >
                        {chat.name}
                    </div>
                ))}
            </div>
            <div className="chat-area">
                <div className="chat-messages" ref={messageContainerRef}>
                    {filteredMessages.map((msg, index) => (
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
                    Info Value:
                    <input
                        type="text"
                        value={extraInfoInput}
                        onChange={(e) => setExtraInfoInput(e.target.value)}
                        className="input-field"
                    />
                </label>
                {Array.from({ length: 7 }).map((_, index) => (
                    <label key={index}>
                        Choose Option {index + 1}:
                        <select
                            value={dropdownValue}
                            onChange={(e) => setDropdownValue(e.target.value)}
                            className="custom-select"
                        >
                            <option value="Option1">Option 1</option>
                            <option value="Option2">Option 2</option>
                            <option value="Option3">Option 3</option>
                        </select>
                    </label>
                ))}
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
