import React, { useState, useEffect, useRef, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import '/Users/maksimbordan/Documents/PandaTurFront/pantatur-front/src/Components/ChatComponent/chat.css';

const ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef';
const RECONNECT_INTERVAL = 5000; // Interval for reconnection in milliseconds

// Encryption and decryption functions
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
    const [senderId, setSenderId] = useState('');
    const [clientID, setClientID] = useState('');
    const [managerMessage, setManagerMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const ws = useRef(null);
    const messageContainerRef = useRef(null);
    const reconnectTimer = useRef(null);

    const connectWebSocket = useCallback(() => {
        ws.current = new WebSocket('ws://34.65.204.80:8080');

        ws.current.onopen = () => {
            console.log('Connected to chat server');
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current); // Clear reconnection timer
                reconnectTimer.current = null;
            }
        };

        ws.current.onmessage = (event) => {
            try {
                const { client_id, sender_id, message, time_sent } = JSON.parse(event.data);
                if (message) {
                    const decryptedMessage = decrypt(message);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { client_id, sender_id, text: decryptedMessage, time_sent }
                    ]);
                }
            } catch (error) {
                console.error('Failed to decrypt message:', error);
            }
        };

        ws.current.onerror = (error) => console.error('Connection error:', error);

        ws.current.onclose = () => {
            console.log('Disconnected from chat server. Attempting to reconnect...');
            reconnectWebSocket();
        };
    }, []);

    const reconnectWebSocket = useCallback(() => {
        if (!reconnectTimer.current) {
            reconnectTimer.current = setTimeout(() => {
                console.log('Reconnecting to chat server...');
                connectWebSocket();
            }, RECONNECT_INTERVAL);
        }
    }, [connectWebSocket]);

    // Connect to WebSocket on component mount
    useEffect(() => {
        connectWebSocket();
        return () => {
            if (ws.current) ws.current.close();
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        };
    }, [connectWebSocket, reconnectWebSocket]);

    // Send message function
    const sendMessage = () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            if (managerMessage.trim()) {
                const encryptedMessage = encrypt(managerMessage);
                const messageData = {
                    client_id: clientID,
                    sender_id: senderId,
                    message: encryptedMessage,
                };

                ws.current.send(JSON.stringify(messageData));
                console.log('Message sent:', messageData); // Логируем отправку сообщения
                setManagerMessage('');
            } else {
                console.warn('Message cannot be empty');
            }
        } else if (ws.current.readyState === WebSocket.CONNECTING) {
            console.warn('WebSocket is still connecting, please wait.');
        } else {
            console.error('WebSocket is not open');
        }
    };
    useEffect(() => {
        ws.current = new WebSocket('ws://34.65.204.80:8080');

        ws.current.onopen = () => {
            console.log('WebSocket connection opened');
        };

        ws.current.onmessage = (event) => {
            console.log('Message received from server:', event.data);
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            ws.current.close();
        };
    }, []);



    // Scroll to the bottom when new messages arrive
    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Fetch and decrypt messages on component mount
    const fetchMessages = useCallback(async () => {
        try {
            const response = await fetch('https://pandaturapi.com/messages/client/896301867');
            if (!response.ok) throw new Error('Failed to fetch messages');

            const data = await response.json();

            // Выводим сообщения в консоль
            console.log('Fetched messages:', data);

            // Извлекаем нужные поля из данных и сохраняем их в messages
            const decryptedMessages = (Array.isArray(data) ? data : []).map(({ client_id, sender_id, message, time_sent }) => ({
                client_id,
                sender_id,
                text: message, // сохраняем текст сообщения
                time_sent,
            }));

            setMessages(decryptedMessages); // Устанавливаем расшифрованные сообщения в состояние
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, []);





    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const client_id = 8963101867; // Ваш client_id 896301867

    return (
        <div className="chat-container">
            <div className="users-container">Chat List</div>
            <div className="chat-area">
                <div className="chat-messages" ref={messageContainerRef}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.sender_id === client_id ? 'sent' : 'received'}`}
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
            <div className="extra-info">Additional Information</div>
        </div>
    );

};

export default ChatComponent;