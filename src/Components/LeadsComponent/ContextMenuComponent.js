import React, { useEffect, useRef } from 'react';
import { translations } from "../utils/translations";

const ContextMenu = ({ contextMenu, onEditTicket, onClose }) => {
  const language = localStorage.getItem('language') || 'RO';
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleEditClick = () => {
    onEditTicket(contextMenu.ticket);
    onClose();
  };

  const handleOpenInNewTab = () => {
    if (contextMenu.ticket?.id) {
      const state = encodeURIComponent(JSON.stringify({ hideChatList: true }));
      const url = `/chat/${contextMenu.ticket.id}?state=${state}`;
      window.open(url, '_blank');
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: Math.min(contextMenu.mouseY, window.innerHeight - 100),
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
};

export default ContextMenu;