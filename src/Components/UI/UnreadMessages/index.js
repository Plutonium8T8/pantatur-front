import React from 'react';
import { Icon } from '../index';
import { useSelector } from 'react-redux';
import './UnreadMessages.modules.css';

const UnreadMessages = () => {
    const { totalUnreadMessages } = useSelector(state => state.clients);
    return (
        <div className="icon-messages-container">
            {/*<div className="icon-messages-count">10</div>*/}
            <div className="icon-messages-count-red">{totalUnreadMessages > 0 ? totalUnreadMessages : ""}</div>
            {/*<Icon name="messages" />*/}
        </div>
    );
}

export default UnreadMessages;