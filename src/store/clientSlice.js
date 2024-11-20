import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkAuth } from './authSlice';

export const fetchClients = createAsyncThunk(
    'clients/fetchClients',
    async function (_, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch('/api/client', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            const data = await response.json();

            return data;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

//export const addClient = createAsyncThunk(
//    'users/addClient',
//    async function (newUser, { rejectWithValue, getState, dispatch }) {
//        try {
//            const { user } = getState().auth;
//            //console.log(user.accessToken)
//            await dispatch(checkAuth(user));
//            //console.log(getState().auth);
//            //console.log(getState().auth);
//            console.log(newUser);
//            const response = await fetch('/api/user/register', {
//                method: 'POST',
//                headers: {
//                    'Content-Type': 'application/json',
//                    Authorization: `Bearer ${user.accessToken}`,
//                },
//                body: JSON.stringify({ ...newUser })
//            });

//            if (!response.ok) {
//                throw new Error('Server Error!');
//            }

//            const data = await response.json();

//            return data;
//        } catch (error) {
//            console.log("ERROR", error);
//            return rejectWithValue(error.message);
//        }
//    }
//);

export const updateClient = createAsyncThunk(
    'clients/updateClient',
    async function (udatedUser, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;
            //console.log(user.accessToken)
            await dispatch(checkAuth(user));
            //console.log(getState().auth);
            //console.log(getState().auth);

            const response = await fetch('/api/client/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({ ...udatedUser })
            });

            if (!response.ok) {
                throw new Error('Server Error!');
            }

            const data = await response.json();

            return data;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const deleteClient = createAsyncThunk(
    'clients/deleteClient',
    async function (id, { rejectWithValue, getState, dispatch }) {
        const { user } = getState().auth;
        await dispatch(checkAuth(user));
        //console.log('current id', id)

        const response = await fetch(`/api/client/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${user.accessToken}`
            }
        });

        if (!response.ok) {
            return rejectWithValue('Не удалось удалить пользователя');
        }

        return id;
    }
);

export const getChats = createAsyncThunk(
    'clients/getChats',
    async function (id, { rejectWithValue, getState, dispatch }) {
        const { user } = getState().auth;
        await dispatch(checkAuth(user));
        //console.log('current id', id)

        const response = await (
            await fetch(
                `/api/client/${id}/chats`, {
                method: 'GET',
                headers: {
                    "ngrok-skip-browser-warning": "69420",
                    Authorization: `Bearer ${user?.accessToken}`,
                    'Content-Type': 'application/json',
                }
            })
        ).json();

        return response;

        if (!response.ok) {
            return rejectWithValue('Не удалось получить сообщения пользователя');
        }

        return id;
    }
);

export const clientSlice = createSlice({
    name: 'clients',
    initialState: {
        list: [],
        item: null,
        isLoading: false,
        error: null,
        chats: [],
        totalUnreadMessages: 0
    },
    reducers: {
        addedChatMessage(state, action) {
            state.chats.push(action.payload);
        },
        setTotalMessagesCount(state, action) {
            state.totalUnreadMessages = action.payload;
        },
        setClientUnreadCount(state, action) {
            let newList = [...state.list];
            const client = newList.find(c => c.id === action.payload.clientId);
            console.log(action.payload.clientId, client);
            if (client) { 
                client.unreadMessages = action.payload.unreadMessagesCount;
                state.list = newList;
            }
        },
        updateClientList(state, action) {
            console.log("client list: ", JSON.parse(action.payload));
            state.list = JSON.parse(action.payload);
        }
        //setClientMessagesCount(state, action) {
        //    const clientId = action.payload.clientId;
        //    const unread = action.payload.uread;
        //    //Нужно найти клиента и вписать ему новое значение непрочитанных
        //    //state.list
        //}
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClients.fulfilled, (state, action) => {
                //console.log(action.payload);
                state.list = action.payload;
            })
            //.addCase(addClient.fulfilled, (state, action) => {
            //    const userList = state.list;
            //    userList.push(action.payload);
            //    userList.sort((a, b) => a.id - b.id);
            //})
            .addCase(getChats.fulfilled, (state, action) => {
                let messages = [];
                action.payload.forEach(chat => {
                    chat.messages.forEach(message => {
                        messages.push(message);
                    });          
                })
                state.chats = messages;
            })
            .addCase(updateClient.fulfilled, (state, action) => {
                const editedClient = state.list.find(client => client.id === action.payload.id);
                if (editedClient) {
                    state.list = state.list.map(client => {
                        if (client.id === action.payload.id)
                            return action.payload;
                        else
                            return client;
                    });
                };
            })
            .addCase(deleteClient.fulfilled, (state, action) => {
                state.list = state.list.filter(client => client.id !== action.payload);
            })
            .addMatcher(isError, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addMatcher(isPending, (state) => {
                state.error = null;
                state.isLoading = true;
            })
            .addMatcher(isFulfilled, (state) => {
                state.isLoading = false;
            });
    }
})

// Action creators are generated for each case reducer function
export const {
    addedChatMessage,
    setTotalMessagesCount,
    updateClientList,
    setClientUnreadCount,
} = clientSlice.actions

export default clientSlice.reducer

function isError(action) {
    return action.type.endsWith('rejected') && action.type.startsWith('clients');
};

function isPending(action) {
    return action.type.endsWith('pending') && action.type.startsWith('clients');
};

function isFulfilled(action) {
    return action.type.endsWith('fulfilled') && action.type.startsWith('clients');
};

