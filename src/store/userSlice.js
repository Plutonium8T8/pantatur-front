import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkAuth } from './authSlice';

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async function (_, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch('/api/user', {
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

export const addUser = createAsyncThunk(
    'users/addUser',
    async function (newUser, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;
            //console.log(user.accessToken)
            await dispatch(checkAuth(user));
            //console.log(getState().auth);
            //console.log(getState().auth);
            console.log(newUser);
            const response = await fetch('/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({ ...newUser })
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

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async function (udatedUser, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;
            //console.log(user.accessToken)
            await dispatch(checkAuth(user));
            //console.log(getState().auth);
            //console.log(getState().auth);

            const response = await fetch('/api/user/update', {
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

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async function (id, { rejectWithValue, getState, dispatch }) {
        const { user } = getState().auth;
        await dispatch(checkAuth(user));
        //console.log('current id', id)

        const response = await fetch(`/api/user/${id}`, {
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

export const userSlice = createSlice({
    name: 'users',
    initialState: {
        list: [],
        isLoading: false,
        error: null
    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.fulfilled, (state, action) => {
                //console.log(action.payload);
                state.list = action.payload;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                const userList = state.list;
                userList.push(action.payload);
                userList.sort((a, b) => a.id - b.id);
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const editedUser = state.list.find(user => user.id === action.payload.id);
                if (editedUser) {
                    state.list = state.list.map(user => {
                        if (user.id === action.payload.id)
                            return action.payload;
                        else
                            return user;
                    });
                };
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.list = state.list.filter(user => user.id !== action.payload);
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
export const { } = userSlice.actions

export default userSlice.reducer

function isError(action) {
    return action.type.endsWith('rejected') && action.type.startsWith('users');
};

function isPending(action) {
    return action.type.endsWith('pending') && action.type.startsWith('users');
};

function isFulfilled(action) {
    return action.type.endsWith('fulfilled') && action.type.startsWith('users');
};

