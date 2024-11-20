import { signalMiddleware, HubConnectionBuilder, withCallbacks, HttpTransportType, LogLevel } from 'redux-signalr';
import { configureStore } from '@reduxjs/toolkit';
//import store from './index.js';
//import { signal } from '../helpers/withSignalR';
import authSlice from './authSlice';
import userSlice from './userSlice';
import ticketSlice from './ticketSlice';
import clientSlice, { addedChatMessage, setTotalMessagesCount, updateClientList, setClientUnreadCount } from './clientSlice';
import { fetchTicketsWithFilter } from './ticketSlice';

//import signalSlice from './signalSlice';
import dictionarySlice from './dictionarySlice';
import profileSlice from './profileSlice';
//import { signalActions } from './signalSlice';
//import signalMiddleware from './signalMiddleware';

export const connection = new HubConnectionBuilder()
    .configureLogging(LogLevel.Debug)
    .withUrl(`hubs/notifications`, {
    //.withUrl(`${process.env.REACT_APP_PUBLIC_HUB_URL}/hubs/notifications`, {
        //skipNegotiation: true,
        transport: HttpTransportType.LongPolling,
        //transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => {
            const { accessToken } = store.getState().auth.user;
            //console.log("=======", accessToken);
            return accessToken;
            //return "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTUxMiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBzeXN0ZW0ucnUiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiMSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6ItCQ0LTQvNC40L3QuNGB0YLRgNCw0YLQvtGAIiwiZXhwIjoxNzE0NDAyOTI5fQ.qrojEVxSPatkc7hlvOlUaD3QSG9xX12JEYl3VpPlrdXR3lykmc3nu-dAAEZnAweawPauR--kOcgptrj6Q6PHQw"; 
        }
    })
    .withAutomaticReconnect()
    .build();

export const callbacks = withCallbacks()
    .add("ClientChatMessage", (msg) => (dispatch) => {
        dispatch(addedChatMessage(JSON.parse(msg)));
        //console.log(msg);

    })
    .add("setTotalMessagesCount", (num) => (dispatch) => {
        console.log("setTotalMessagesCount");
        dispatch(setTotalMessagesCount(num));
    })
    .add("UpdateClientUnreadCount", (msg) => (dispatch) => {
        console.log("setClientUnreadCount");
        dispatch(setClientUnreadCount(JSON.parse(msg)));
    })
    .add("UpdateClientList", (clients) => (dispatch) => {
        dispatch(updateClientList(clients));
    })
    .add('ReceiveMessage', (msg) => (dispatch) => {
        //dispatch(setText(msg));
        console.log(msg);
    })
    .add("UpdateTicketList", (msg) => (dispatch) => {
        console.log("UpdateTicketList");
        dispatch(fetchTicketsWithFilter({
            show: false,
            search: null,
            filterValue: {
                userIds: [],
                statuses: [],
                startDate: null,
                endDate: null,
                requestTypeIds: []
            }
        }));
    })
    //.add('ReceiveRandomNumber', (num) => (dispatch, getState, invoke) => {
    //    //const { example } = getState();
    //    console.log('ReceiveRandomNumber');
    //    //dispatch(setRandomNumber(num));
    //    invoke('SendMessage', "Hi")
    //})

export const signal = signalMiddleware({
    callbacks,
    connection,
    shouldConnectionStartImmediately: false
});

export const store = configureStore({
    reducer: {
        auth: authSlice,
        users: userSlice,
        tickets: ticketSlice,
        clients: clientSlice,
        dictionaries: dictionarySlice,
        profile: profileSlice,
        //signal: signalSlice
    },
    
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat([signal])
    //    //return getDefaultMiddleware().concat([signal, signalMiddleware])
    },
});


