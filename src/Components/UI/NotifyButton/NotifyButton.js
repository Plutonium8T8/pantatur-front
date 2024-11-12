import React from 'react';

const NotifyButton = () => {

    const user_id = 1;

    return (
        <a href="https://t.me/insurance_ru_bot?start=notify-${user_id}" target="_blank">
            Подключить уведомления
        </a>
    );
};

export default NotifyButton;