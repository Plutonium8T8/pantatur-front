import React, { createContext, useContext, useState } from 'react';

// Создаем контекст
const UnreadMessagesContext = createContext();

// Хук для использования контекста
export const useUnreadMessages = () => useContext(UnreadMessagesContext);

// Провайдер контекста
export const UnreadMessagesProvider = ({ children }) => {
    const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

    const updateUnreadMessages = (newCount) => {
        setTotalUnreadMessages(newCount);
    };

    return (
        <UnreadMessagesContext.Provider value={{ totalUnreadMessages, updateUnreadMessages }}>
            {children}
        </UnreadMessagesContext.Provider>
    );
};