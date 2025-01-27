// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSocket } from '../../SocketContext';
// import { useUser } from '../../UserContext';
// import { useSnackbar } from 'notistack';
// import { truncateText } from '../../stringUtils';
// import { priorityOptions } from '../../FormOptions/PriorityOption';
// import { workflowOptions } from '../../FormOptions/WorkFlowOption';
// import SpinnerOverlay from './SpinnerOverlayComponent';
// import WorkflowColumn from './WorkflowColumnComponent';
// import ContextMenu from './ContextMenuComponent';
// import TicketModal from './TicketModal/TicketModalComponent';
// import Cookies from 'js-cookie';
// import '../../App.css';
// import '../SnackBarComponent/SnackBarComponent.css'
// import { FaEnvelope, FaTrash } from 'react-icons/fa';
// import { translations } from "../utils/translations";

// export const updateTicket = async (updateData) => {
//   try {
//     const token = Cookies.get('jwt');

//     if (!token) {
//       throw new Error('Token is missing. Authorization required.');
//     }

//     const response = await fetch(`https://pandatur-api.com/tickets/${updateData.id}`, {
//       method: 'PATCH',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//       body: JSON.stringify(updateData),
//     });

//     if (!response.ok) {
//       const errorDetails = await response.json();
//       throw new Error(
//         `Error updating ticket: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorDetails)}`
//       );
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error updating ticket:', error.message || error);
//     throw error;
//   }
// };

// const Leads = (selectClientId) => {
//   const [tickets, setTickets] = useState([]);
//   const [statistics, setStatistics] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentTicket, setCurrentTicket] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [contextMenu, setContextMenu] = useState(null);
//   const contextMenuRef = useRef(null);
//   const socket = useSocket();
//   const { userId } = useUser();
//   const { enqueueSnackbar, closeSnackbar } = useSnackbar();

//   const navigate = useNavigate();

//   const language = localStorage.getItem('language') || 'RO';

//   const fetchTickets = async () => {
//     setIsLoading(true);
//     try {
//       const token = Cookies.get('jwt');
  
//       // Fetch tickets
//       const ticketsResponse = await fetch('https://pandatur-api.com/tickets', {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//       });
  
//       if (!ticketsResponse.ok) throw new Error('Failed to fetch tickets.');
//       const ticketsData = await ticketsResponse.json();
//       setTickets(ticketsData);
  
//       // Fetch statistics
//       const statsResponse = await fetch('https://pandatur-api.com/tickets/statistics', {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//       });
  
//       if (!statsResponse.ok) throw new Error('Failed to fetch statistics.');
//       const statsData = await statsResponse.json();

//       console.log('StatsData: ', statsData);
  
//       if (Array.isArray(statsData)) {
//         setStatistics(statsData); // Ensure statsData is an array
//       } else {
//         setStatistics([]); // Default to empty array if statsData is not an array
//       }
//     } catch (error) {
//       console.error('Error fetching tickets or statistics:', error);
//       setStatistics([]); // Handle errors gracefully
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTickets();
//   }, []);

//   const updateTicketWorkflow = async (clientId, newWorkflow) => {
//     // Update state locally for immediate UI feedback
//     setTickets((prevTickets) =>
//       prevTickets.map((ticket) =>
//         ticket.client_id === clientId ? { ...ticket, workflow: newWorkflow } : ticket
//       )
//     );

//     // Update the server
//     await updateTicket({ id: clientId, workflow: newWorkflow }).catch((error) =>
//       console.error('Error updating ticket workflow:', error)
//     );

//     fetchTickets();
//   };

//   const openCreateTicketModal = () => {
//     setCurrentTicket({
//       contact: '',
//       transport: '',
//       country: '',
//       priority: priorityOptions[0],
//       workflow: workflowOptions[0],
//       service_reference: '',
//       technician_id: 0,
//     });
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setCurrentTicket(null);
//     setIsModalOpen(false);
//   };

//   const handleContextMenu = (event, ticket) => {
//     event.preventDefault();
//     setContextMenu({
//       mouseX: event.clientX - 2,
//       mouseY: event.clientY - 4,
//       ticket,
//     });
//   };

//   const handleCloseContextMenu = () => setContextMenu(null);

//   useEffect(() => {
//     if (socket) {
//       const receiveMessage = (event) => {
//         try {
//           const message = JSON.parse(event.data);
//           console.log('Parsed WebSocket message notifications:', message);

//           switch (message.type) {
//             case 'message':
//               // Найти тикет по client_id
//               const ticket = tickets.find(t => t.client_id === message.data.client_id);

//               // Если тикет найден и technician_id совпадает с userId
//               if (ticket && ticket.technician_id === userId) {
//                 const messageText = truncateText(message.data.text, 40); // Ограничение длины текста
//                 enqueueSnackbar(
//                   '',
//                   {
//                     variant: 'info',
//                     action: (snackbarId) => (
//                       <>
//                         <div className='snack-bar-notification'>
//                           <div className='snack-object'
//                             onClick={() => {
//                               navigate(`/chat/${message.data.client_id}`);
//                               closeSnackbar(snackbarId); // Закрываем уведомление при переходе
//                             }}>
//                             <div className='snack-icon'>
//                               <FaEnvelope />
//                             </div>

//                             <div className='snack-message'>
//                               {message.data.client_id}: {messageText}
//                             </div>
//                           </div>
//                           <div className='snack-close'>
//                             <button onClick={() => closeSnackbar(snackbarId)}>
//                               <FaTrash />
//                             </button>
//                           </div>
//                         </div>
//                       </>
//                     ),
//                   }
//                 );
//               }
//               break;

//             // Остальные кейсы остаются без изменений
//             case 'notification':
//               const notificationText = truncateText(
//                 message.data.description || 'Уведомление с пустым текстом!',
//                 100
//               );
//               enqueueSnackbar(notificationText, { variant: 'info' });
//               break;

//             case 'task':
//               enqueueSnackbar(`Task nou: ${message.data.title}`, { variant: 'warning' });
//               break;

//             case 'ticket':
//               if (message.data && message.data.client_id) {
//                 const socketMessageClient = JSON.stringify({
//                   type: 'connect',
//                   data: { client_id: [message.data.client_id] },
//                 });

//                 socket.send(socketMessageClient);
//                 console.log(`Подключён к комнате клиента с ID: ${message.data.client_id}`);
//                 fetchTickets();
//               } else {
//                 console.warn('Неверное сообщение о тикете:', message);
//               }
//               break;

//             default:
//               console.warn('Неизвестный тип сообщения:', message.type);
//           }
//         } catch (error) {
//           console.error('Ошибка при разборе сообщения WebSocket:', error);
//         }
//       };

//       // Устанавливаем обработчики WebSocket
//       socket.onopen = () => console.log('WebSocket подключен');
//       socket.onerror = (error) => console.error('WebSocket ошибка:', error);
//       socket.onclose = () => console.log('WebSocket закрыт');
//       socket.addEventListener('message', receiveMessage);

//       // Очистка обработчиков при размонтировании
//       return () => {
//         socket.removeEventListener('message', receiveMessage);
//         socket.onopen = null;
//         socket.onerror = null;
//         socket.onclose = null;
//       };
//     }
//   }, [socket, tickets, enqueueSnackbar, userId, navigate]);

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-header">
//         <div className="header">
//           <button onClick={openCreateTicketModal} className="button-add-ticket">
//             {translations['Adaugă lead'][language]}
//           </button>
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder={translations['Caută leaduri'][language]}
//             className="search-input"
//           />
//         </div>
//       </div>

//       {/* Statistics Section */}
//       {/* <div className="statistics-section">
//         <h2>Statistici</h2>
//         <div className="statistics-grid">
//           {statistics &&
//             Object.entries(statistics).map(([key, value]) => (
//               <div key={key} className="stat-item">
//                 <span className="stat-value">{value}</span>
//               </div>
//             ))}
//         </div>
//       </div> */}

//       <div className="container-tickets">
//         {workflowOptions.map((workflow) => (
//           <WorkflowColumn
//             key={workflow}
//             workflow={workflow}
//             tickets={tickets}
//             searchTerm={searchTerm}
//             onUpdateWorkflow={updateTicketWorkflow}
//             onEditTicket={setCurrentTicket}
//             onContextMenu={handleContextMenu}
//           />
//         ))}
//       </div>
//       {isLoading && <SpinnerOverlay />}
//       {contextMenu && (
//         <ContextMenu
//           contextMenu={contextMenu}
//           onClose={handleCloseContextMenu}
//           onEditTicket={setCurrentTicket}
//           ref={contextMenuRef}
//         />
//       )}
//       {currentTicket && (
//         <TicketModal
//           ticket={currentTicket}
//           isOpen={true}
//           onClose={closeModal}
//           onSave={fetchTickets} // Reload tickets after saving
//         />
//       )}
//     </div>
//   );
// };

// export default Leads;


import React, { useState, useRef } from 'react';
import { useAppContext } from '../../AppContext'; // Подключение AppContext
import { priorityOptions } from '../../FormOptions/PriorityOption';
import { workflowOptions } from '../../FormOptions/WorkFlowOption';
import SpinnerOverlay from './SpinnerOverlayComponent';
import WorkflowColumn from './WorkflowColumnComponent';
import ContextMenu from './ContextMenuComponent';
import TicketModal from './TicketModal/TicketModalComponent';
import '../../App.css';
import '../SnackBarComponent/SnackBarComponent.css';

const Leads = () => {
  const { tickets, isLoading, setTickets, updateTicket } = useAppContext(); // Данные из AppContext
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  // Функция обновления тикета (с локальным обновлением и запросом к серверу)
  const updateTicketWorkflow = async (clientId, newWorkflow) => {
    try {
      // Локальное обновление состояния для мгновенной обратной связи
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.client_id === clientId ? { ...ticket, workflow: newWorkflow } : ticket
        )
      );

      // Отправка обновлений на сервер
      await updateTicket({ id: clientId, workflow: newWorkflow });
    } catch (error) {
      console.error('Ошибка при обновлении тикета:', error);
    }
  };

  const openCreateTicketModal = () => {
    setCurrentTicket({
      contact: '',
      transport: '',
      country: '',
      priority: priorityOptions[0],
      workflow: workflowOptions[0],
      service_reference: '',
      technician_id: 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentTicket(null);
    setIsModalOpen(false);
  };

  const handleContextMenu = (event, ticket) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      ticket,
    });
  };

  const handleCloseContextMenu = () => setContextMenu(null);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header">
          <button onClick={openCreateTicketModal} className="button-add-ticket">
            Add Ticket
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets..."
            className="search-input"
          />
        </div>
      </div>
      <div className="container-tickets">
        {workflowOptions.map((workflow) => (
          <WorkflowColumn
            key={workflow}
            workflow={workflow}
            tickets={tickets}
            searchTerm={searchTerm}
            onUpdateWorkflow={updateTicketWorkflow}
            onEditTicket={setCurrentTicket}
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>
      {isLoading && <SpinnerOverlay />}
      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          onClose={handleCloseContextMenu}
          onEditTicket={setCurrentTicket}
          ref={contextMenuRef}
        />
      )}
      {currentTicket && (
        <TicketModal
          ticket={currentTicket}
          onClose={closeModal}
          onSave={() => { }} // Тикеты обновляются автоматически через контекст
        />
      )}
    </div>
  );
};

export default Leads;