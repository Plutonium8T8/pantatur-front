
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
//import { checkAuth } from './authSlice';

export const fetchProfileData = createAsyncThunk(
    'profile/fetchProfileData',
    async function (tg_user_id, { rejectWithValue, getState, dispatch }) {
        try {
            //const { user } = getState().auth;

            //await dispatch(checkAuth(user));

            const response = await fetch(`/api/profile/${tg_user_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
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

export const fetchFriendsData = createAsyncThunk(
    'profile/fetchFriendsData',
//
    async function(tg_user_id, { rejectWithValue, getState, dispatch }) {
        try {
            //const { user } = getState().auth;
            console.log("TRY FETCH CLIENTS");
            //await dispatch(checkAuth(user));

            const response = await fetch(`/api/profile/${tg_user_id}/GetFriendsData`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //Authorization: `Bearer ${user.accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unathorized!');
                } else
                    throw new Error('Server Error!');
            }

            console.log("response friends ", response);

            const data = await response.json();

            return data;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }

);

export const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        balance: 0,
        completedCount: 0,
        unCompletedCount: 0,
        friendsCount: 0,
        isLoading: false,
        error: null,
        friendsData: [],
        //firstName: "",
        //lastName: ""
    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfileData.fulfilled, (state, action) => {
                //console.log(action.payload);
                const { balance, completedCount, unCompletedCount, friendsCount } = action.payload;
                state.balance = balance;
                state.completedCount = completedCount;
                state.unCompletedCount = unCompletedCount;
                state.friendsCount = friendsCount;
                //console.log(state);
            })
            .addCase(fetchFriendsData.fulfilled, (state, action) => {
                console.log(action.payload);
                state.friendsData = action.payload;
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
export const { } = profileSlice.actions

export default profileSlice.reducer

function isError(action) {
    return action.type.endsWith('rejected') && action.type.startsWith('profile');
};

function isPending(action) {
    return action.type.endsWith('pending') && action.type.startsWith('profile');
};

function isFulfilled(action) {
    return action.type.endsWith('fulfilled') && action.type.startsWith('profile');
};



