import React, { forwardRef } from 'react';

const ContextMenu = forwardRef(({ contextMenu, onEditTicket, onClose }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: contextMenu.mouseY,
        left: contextMenu.mouseX,
        backgroundColor: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
        zIndex: 1000,
        padding: '10px',
        borderRadius: '4px',
      }}
    >
      <button onClick={() => onEditTicket(contextMenu.ticket)}>Edit Ticket</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
});

export default ContextMenu;
