import React, { forwardRef } from 'react';
import { translations } from "../utils/translations";

const ContextMenu = forwardRef(({ contextMenu, onEditTicket, onClose }, ref) => {
  const language = localStorage.getItem('language') || 'RO';

  const handleEditClick = () => {
    onEditTicket(contextMenu.ticket);
    onClose();
  };

  const handleOpenInNewTab = () => {
    if (contextMenu.ticket?.id) {
      const url = `/chat/${contextMenu.ticket.id}`;
      const state = encodeURIComponent(JSON.stringify({ hideChatList: true }));
      window.open(`${url}?state=${state}`, '_blank');
    }
    onClose();
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', // используем fixed, чтобы меню не сдвигалось при скролле
        top: Math.min(contextMenu.mouseY, window.innerHeight - 100), // ограничиваем выход за границы
        left: Math.min(contextMenu.mouseX, window.innerWidth - 150),
        backgroundColor: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
        zIndex: 1000,
        padding: '10px',
        borderRadius: '4px',
      }}
    >
      <button onClick={handleEditClick}>{translations['Editează'][language]}</button>
      <button onClick={handleOpenInNewTab}>{translations['Deschide în noua filă'][language]}</button>
      <button onClick={onClose}>{translations['Închide'][language]}</button>
    </div>
  );
});

export default ContextMenu;