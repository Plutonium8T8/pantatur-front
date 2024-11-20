import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { checkAuth } from './authSlice';

export const fetchTickets = createAsyncThunk(
    'ticket/fetchTickets',
    async function (_, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch('/api/ticket', {
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

export const fetchTicketsByClilentId = createAsyncThunk(
    'ticket/fetchTicketsByClilentId',
    async function (id, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch(`/api/client/${id}/tickets`, {
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

export const fetchTicketsWithFilter = createAsyncThunk(
    'ticket/fetchTicketsWithFilter',
    async function (filter, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;
            console.log('fetch filter', filter);
            await dispatch(checkAuth(user));

            const response = await fetch('/api/ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(filter)
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

export const fetchTgUserTicketsWithFilter = createAsyncThunk(
    'ticket/fetchTgUserTicketsWithFilter',
    async function ({ tg_user_id, filter }, { rejectWithValue, getState, dispatch }) {
        try {
            //const { user } = getState().auth;
            //console.log('fetch filter', filter);
            //await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/${tg_user_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    //Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(filter)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            const data = await response.json();
            

            console.log("TG user tickets: ", tg_user_id, data);
            return data;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTgClientTicket = createAsyncThunk(
    'ticket/fetchTgClientTicket',
    async function (id, { rejectWithValue, getState, dispatch }) {
        try {

            const response = await fetch(`/api/ticket/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': ""
                    //Authorization: `Bearer ${user.accessToken}`,
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


export const fetchTicket = createAsyncThunk(
    'ticket/fetchTicket',
    async function (id, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/${id}`, {
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

export const saveTicketValue = createAsyncThunk(
    'ticket/saveTicketValue',
    async function ({ id, value }, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(value)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            const data = await response.json();

            return { id, value };//data;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const saveTicketSelectedOfferValue = createAsyncThunk(
    'ticket/saveTicketSelectedOfferValue',
    async function ({ id, value }, { rejectWithValue, getState, dispatch }) {
        try {
            //const { user } = getState().auth;

            //await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/${id}/selectInsuranceOffer`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: value ? JSON.stringify({ ...value }) : null
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }
            if (response.status === 204)
                return null;
            else
                return await response.json();

            //return data;//data;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const changeTicketStage = createAsyncThunk(
    'ticket/changeTicketStage',
    async function ({ ticketId, stage } , { rejectWithValue, getState, dispatch }) {
        //{id}/changeStatus/{statusId}
        try {

            const response = await fetch(`/api/ticket/${ticketId}/changeStatus/${stage}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //Authorization: `Bearer ${user.accessToken}`,
                },
                //body: JSON.stringify(note)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            //const data = await response.json();

            return stage;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const saveNote = createAsyncThunk(
    'ticket/saveNote',
    async function (note, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/${note.ticketId}/note`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(note)
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

export const saveTicketCommercialOffer = createAsyncThunk(
    'ticket/saveTicketCommercialOffer',
    async function (offer, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;
            //console.log("Offer to DB: ", offer);
            await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/offer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(offer)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            const data = await response.json();
            //console.log("data from server: ", data);
            return {
                type: offer.type,
                data: data
            };
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const declineOffer = createAsyncThunk(
    'ticket/declineOffer',
    async function (data, { rejectWithValue, getState, dispatch }) {
        console.log("data ", data);
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/${data.ticketId}/decline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({ ...data })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            //const data = await response.json();

            return null;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const saveClientInsuranceData = createAsyncThunk(
    'ticket/saveClientInsuranceData',
    async function (data, { rejectWithValue, getState, dispatch }) {
        console.log("Client insurance data ", data.ticketId, data);

        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));
            //console.log("SAVE DATA: ", data);
            const response = await fetch(`api/ticket/${data.ticketId}/saveClientInsuranceData`, {
            //const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}/api/ticket/${data.ticketId}/saveClientInsuranceData`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.accessToken}`,
                },
                body: JSON.stringify({ ...data })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }
            //console.log("SAVE INSURANCE DATA: ", await response.json());
            return await response.json();

            //return null;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const getTicketsForDistribution = createAsyncThunk(
    'ticket/getTicketsForDistribution',
    async function (_, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/getTicketsForDistribution`, {
                method: 'GET',
                headers: {
                    //'Content-Type': 'application/json',
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
)


//compleateWithPayTicket
export const compleateWithPayTicket = createAsyncThunk(
    'ticket/compleateWithPayTicket',
    async function (ticketId, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/${ticketId}/Pay_Compleate`, {
                method: 'GET',
                headers: {
                    //'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            //const data = await response.json();

            //return data;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
)

//deleteTicket
export const deleteTicket = createAsyncThunk(
    'ticket/deleteTicket',
    async function (ticketId, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/${ticketId}`, {
                method: 'DELETE',
                headers: {
                    //'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            //const data = await response.json();

            return ticketId;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
)


//savePaymentAndDileveryOptions
export const savePaymentAndDileveryOptions = createAsyncThunk(
    'ticket/savePaymentAndDileveryOptions',
    async function (data, { rejectWithValue, getState, dispatch }) {
        console.log("data ",data);

        try {
            //const { user } = getState().auth;

            //await dispatch(checkAuth(user));

            const response = await fetch(`/api/ticket/${data.ticketId}/selectDileveryType`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    //Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({ ...data })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            //console.log(await response.json());
            //const _data = await response.json();

            //return _data;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const saveTicketResponsibele = createAsyncThunk(
    'ticket/saveTicketResponsibele',
    async function (data, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;
            await dispatch(checkAuth(user));
            console.log("DATA",data);
            const response = await fetch(`/api/ticket/saveTicketDistribution`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            //const data = await response.json();
            //console.log("TG user tickets: ", tg_user_id, data);
            return data;

        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const saveTicketsResponsibele = createAsyncThunk(
    'ticket/saveTicketsResponsibele',
    async function (data, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;
            await dispatch(checkAuth(user));
            console.log("DATA", data);
            const response = await fetch(`/api/ticket/saveTicketsDistribution`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            //const data = await response.json();
            //console.log("TG user tickets: ", tg_user_id, data);
            return data;

        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const ticketSlice = createSlice({
    name: 'tickets',
    initialState: {
        list: [],
        item: null,
        isLoading: false,
        error: null
    },
    reducers: {
        addNewTicketNote(state, action) {
            //console.log([{ ...action.payload }, ...state.item.notes]);

            state.item.notes = [{ ...action.payload }, ...state.item.notes];
            //console.log(current(state));
        },
        cancelAddTicketNote(state, action) {
            state.item.notes = state.item.notes.filter(x => x.id !== null);
            //console.log(current(state));
        },
        updateFileData(state, action) {
            //console.log("_____ UPDATE ______");
            let newFilesState = [...state.item.files];
            //console.log("newFilesState ", action.payload.id, newFilesState.find(x => x.id === action.payload.id))
            //let currentFile = newFilesState.find(x => x.id === action.payload.id);
            //if (currentFile) {
            //    console.log("currentFile ", currentFile)
            //    currentFile = { ...action.payload }
            //} else {
                //console.log("new file push ", action.payload)

                newFilesState.push({
                    ...action.payload
                });
            //}

            //console.log("state files: ", newFilesState);

            state.item.files = newFilesState;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTickets.fulfilled, (state, action) => {
                state.list = action.payload;
            })
            .addCase(getTicketsForDistribution.fulfilled, (state, action) => {
                state.list = action.payload;
            })
            .addCase(fetchTicketsByClilentId.fulfilled, (state, action) => {
                state.list = action.payload;
            })
            .addCase(fetchTicketsWithFilter.fulfilled, (state, action) => {
                state.list = action.payload;
            })
            .addCase(deleteTicket.fulfilled, (state, action) => {
                state.list = state.list.filter(x => x.id != action.payload)
            })
            .addCase(fetchTgUserTicketsWithFilter.fulfilled, (state, action) => {
                //Отсортируем по дате по убыванию
                var byDate = action.payload.slice(0);
                byDate.sort(function (a, b) {
                    if (a.ticketStage === 100 || b.ticketStage === 100) {
                        return Date.parse(a.insuranceDateEnd) - Date.parse(b.insuranceDateEnd);
                    } else {
                        return Date.parse(b.dateCreated) - Date.parse(a.dateCreated);
                    }
                });
                //console.log("byDate", byDate);
                state.list = byDate;
            })
            .addCase(fetchTgClientTicket.fulfilled, (state, action) => {
                //console.log('TICKET DATA:',action.payload);
                state.item = action.payload;
            })
            .addCase(fetchTicket.fulfilled, (state, action) => {
                //console.log('TICKET DATA:',action.payload);
                state.item = action.payload;
            })
            .addCase(saveTicketValue.fulfilled, (state, action) => {
                //console.log('payload', action.payload);
                let updatedItem = { ...state.item };
                const index = updatedItem.ticketDatas.findIndex(x => x.id === action.payload.id);
                try {
                    //console.log('index',index);
                    //console.log('value', updatedItem.ticketDatas[index]);
                    updatedItem.ticketDatas[index].data = action.payload.value;
                } catch (e) {
                    console.log(e);
                }
                //console.log(updatedItem.ticketDatas.findIndex(x => x.id === [action.payload.id]), updatedItem.ticketDatas[index].data );
                state.item = updatedItem;
            })
            .addCase(saveTicketCommercialOffer.fulfilled, (state, action) => {
                //console.log("!!!!!", action.payload);
                if (action.payload.type === 0)
                    state.item.kaskoCommercialOffers.splice(0, 0, action.payload.data);
                else if (action.payload.type === 1)
                    state.item.osagoCommercialOffers.splice(0, 0, action.payload.data);
                else if (action.payload.type === 2)
                    state.item.iflCommercialOffers.splice(0, 0, action.payload.data);
                else if (action.payload.type === 3)
                    state.item.ipotekaCommercialOffers.splice(0, 0, action.payload.data);
            })
            .addCase(saveTicketSelectedOfferValue.fulfilled, (state, action) => {
                state.item.selectedOffer = action.payload;
            })
            .addCase(savePaymentAndDileveryOptions.fulfilled, (state, action) => {
                //state.item = { ...state.item, ...action.payload };
            })
            .addCase(saveClientInsuranceData.fulfilled, (state, action) => {
                //Сохранили данные полиса на сервере теперь надо обновить данные в состоянии
                state.item = {
                    ...state.item,
                    ...action.payload
                };
                //state.item.insuranceCompanyId = action.payload.insuranceCompanyId;
                //state.item.insuranceNumber = action.payload.insuranceNumber;
                //state.item.insuranceDateStart = action.payload.insuranceDateStart;
                //state.item.insuranceDateEnd = action.payload.insuranceDateEnd;
                //state.item.insuranceSumm = action.payload.insuranceSumm;
                //state.item.insuranceFileName = action.payload.insuranceFileName;
            })
            .addCase(changeTicketStage.fulfilled, (state, action) => {
                state.item.ticketStage = action.payload;
            })
            .addCase(declineOffer.fulfilled, (state, action) => {
                //Сделать изменения в выбранном тикете для дальнейшей работы
                state.item.selectedOffer = null;
            })
            .addCase(saveTicketResponsibele.fulfilled, (state, action) => {
                //Сохраним изменение ответственного чтоб изменилось
                //console.log(action.payload);
                state.item.responsibleId = action.payload.userId;

            })
            .addCase(saveTicketsResponsibele.fulfilled, (state, action) => {
                //Сохраним изменение ответственного чтоб изменилось
                //console.log(action.payload);
                //state.item.responsibleId = action.payload.userId;

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
export const { addNewTicketNote, cancelAddTicketNote, updateFileData } = ticketSlice.actions

export default ticketSlice.reducer

function isError(action) {
    return action.type.endsWith('rejected') && action.type.startsWith('tickets');
};

function isPending(action) {
    return action.type.endsWith('pending') && action.type.startsWith('tickets');
};

function isFulfilled(action) {
    return action.type.endsWith('fulfilled') && action.type.startsWith('tickets');
};


