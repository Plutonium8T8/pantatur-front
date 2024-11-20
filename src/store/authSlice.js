import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode';

export const login = createAsyncThunk(
    'auth/login',
    async function (client, { rejectWithValue, getState }) {
        try {
            //console.log('client', client);
            const { rememberMe } = getState().auth;

            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...client })
            });

            if (!response.ok) {
                throw new Error('Server Error!');
            }

            //console.log(await response.text());
            const data = await response.text();

            const tokenData = jwt_decode(data);
            //console.log(tokenData);

            const userResponse = { email: client.email, accessToken: data, id: parseInt(tokenData[ "http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata"]) };

            if (rememberMe === true) {
                localStorage.setItem("insurance_auth_data", JSON.stringify(userResponse));
            }
            sessionStorage.setItem("insurance_auth_data", JSON.stringify(userResponse));

            return userResponse;

        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async function (client, { rejectWithValue }) {
        try {
            const response = await fetch('/api/user/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...client })
            });

            if (!response.ok) {
                throw new Error('Server Error!');
            }

            //const data = await response.json();

            localStorage.removeItem("insurance_auth_data");
            sessionStorage.removeItem("insurance_auth_data");
            //console.log("Data", data);

            return true;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

//export const getToken = createAsyncThunk(
//    'auth/checkAuth',
//     async function (_, { getState }) {
//        const { accessToken } = getState().auth;
//        return accessToken;
//    }
//);

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async function (client, { rejectWithValue, getState }) {

        try {
            const accessToken = jwt_decode(client?.accessToken);

            const { rememberMe } = getState().auth;

            let userResponse = { ...client };
            //console.log(accessToken);
            //console.log(new Date((parseInt(accessToken.exp) - 60) * 1000));

            if (new Date() >= new Date((parseInt(accessToken.exp) - 60) * 1000)) {
                const response = await fetch('/api/user/refresh-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${client.accessToken}`,
                    },
                    //body: JSON.stringify({ ...client })
                });

                if (!response.ok) {
                    localStorage.removeItem("insurance_auth_data");
                    sessionStorage.removeItem("insurance_auth_data");
                    throw new Error('Не авторизован!');
                }

                const data = await response.text();

                //console.log("data", { email: client.email, accessToken: data });

                userResponse = { email: client.email, accessToken: data };
                if (rememberMe === true) {
                    localStorage.setItem("insurance_auth_data", JSON.stringify(userResponse));
                }
                sessionStorage.setItem("insurance_auth_data", JSON.stringify(userResponse));
            }

            return userResponse;

        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuth: false,
        isLoading: true,
        error: null,
        rememberMe: false
    },
    //actions: {
        
    //},
    reducers: {
        setIsLoadingFalse(state, action) {
            state.isLoading = false;
        },
        setRememberMe(state) {
            state.rememberMe = !state.rememberMe;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.user = { ...action.payload };
                state.isAuth = true;
                //console.log(current(state));
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.user = null;
                state.isAuth = false;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = { ...action.payload };
                state.isAuth = true;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.user = null;
                state.isAuth = false;
                state.isLoading = false;
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

export const { setIsLoadingFalse, setRememberMe } = authSlice.actions

export default authSlice.reducer

function isError(action) {
    return action.type.endsWith('rejected') && action.type.startsWith('auth');
};

function isPending(action) {
    return action.type.endsWith('pending') && action.type.startsWith('auth');
};

function isFulfilled(action) {
    return action.type.endsWith('fulfilled') && action.type.startsWith('auth');
};
