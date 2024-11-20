//dictionariesSlice


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkAuth } from './authSlice';

export const fetchDictionaries = createAsyncThunk(
    'dictionary/fetchallDictionaries',
    async function (_, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch('/api/dictionary', {
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

export const fetchInsurancesDictionary = createAsyncThunk(
    'dictionary/fetchInsurancesDictionary',
    async function (_, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch('/api/dictionary/insurances', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
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

export const fetchRequestTypesDictionary = createAsyncThunk(
    'dictionary/fetchRequestTypesDictionary',
    async function (_, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch('/api/dictionary/requestTypes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
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

export const addEditRegion = createAsyncThunk(
    'dictionary/addEditRegion',
    async function (region, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;
            await dispatch(checkAuth(user));

            console.log(region);
            const response = await fetch('/api/dictionary/addEditRegions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({ ...region })
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

export const deleteRegion = createAsyncThunk(
    'dictionary/deleteRegion',
    async function (id, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;
            await dispatch(checkAuth(user));

            console.log(id);
            const response = await fetch(`/api/dictionary/deleteRegion/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Server Error!');
            }

            //const data = await response.json();

            return id;
        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const getVehicleTypes = createAsyncThunk(
    'dictionary/getVehicleTypes',
    async function (_, { rejectWithValue, getState, dispatch }) {
        try {

            const response = await fetch(`/api/dictionary/vehicle`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //Authorization: `Bearer ${user.accessToken}`,
                },
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

export const getVehicleMakers = createAsyncThunk(
    'dictionary/getVehicleMakers',
    async function (id, { rejectWithValue, getState, dispatch }) {
        console.log("DATA MAKERS ", id);
        try {

            const response = await fetch(`/api/dictionary/vehicle/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //Authorization: `Bearer ${user.accessToken}`,
                },
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

export const getVehicleModels = createAsyncThunk(
    'dictionary/getVehicleModels',
    async function (data, { rejectWithValue, getState, dispatch }) {
        try {

            const response = await fetch(`/api/dictionary/vehicle/${data.type}/${data.maker}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //Authorization: `Bearer ${user.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Server Error!');
            }

            return await response.json();

        } catch (error) {
            console.log("ERROR", error);
            return rejectWithValue(error.message);
        }
    }
);

export const getVehicleTypeById = createAsyncThunk(
    'dictionary/getVehicleTypeById',
    async function (id, { rejectWithValue, getState, dispatch }) {
        try {

            const response = await fetch(`/api/dictionary/vehicle/type/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //Authorization: `Bearer ${user.accessToken}`,
                },
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

export const getVehicleMakerById = createAsyncThunk(
    'dictionary/getVehicleMakerById',
    async function (id, { rejectWithValue, getState, dispatch }) {
        try {

            const response = await fetch(`/api/dictionary/vehicle/make/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //Authorization: `Bearer ${user.accessToken}`,
                },
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

export const getVehicleModelById = createAsyncThunk(
    'dictionary/getVehicleModelById',
    async function (id, { rejectWithValue, getState, dispatch }) {
        try {

            const response = await fetch(`/api/dictionary/vehicle/model/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //Authorization: `Bearer ${user.accessToken}`,
                },
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

export const fetchRegions = createAsyncThunk(
    'dictionary/fetchRegions',
    async function (_, { rejectWithValue, getState, dispatch }) {
        try {
            const { user } = getState().auth;

            await dispatch(checkAuth(user));

            const response = await fetch('/api/dictionary/regions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
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

export const fetchInsutanceConditionsDictionary = createAsyncThunk(
    'dictionary/fetchInsutanceConditionsDictionary',
    async function (_, { rejectWithValue, getState, dispatch }) {
        try {
            //const { user } = getState().auth;

            //await dispatch(checkAuth(user));

            const response = await fetch('/api/dictionary/insuranceConditions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
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

export const dictionarySlice = createSlice({
    name: 'dictionary',
    initialState: {
        users: [],
        banks: [],
        regions: [],
        insurances: [],
        requestTypes: [],
        insutanceConditions: [],
        vehicleTypes: [],
        vehicleMakers: [],
        vehicleModels: [],
        isLoading: false,
        error: null,

    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(getVehicleMakers.fulfilled, (state, action) => {
                state.vehicleMakers = action.payload;
            })
            .addCase(getVehicleTypes.fulfilled, (state, action) => {
                state.vehicleTypes = action.payload;//.sort((a, b) => b.label - a.label);
            })
            .addCase(getVehicleModels.fulfilled, (state, action) => {
                state.vehicleModels = action.payload;
            })
            .addCase(getVehicleTypeById.fulfilled, (state, action) => {

            })
            .addCase(fetchDictionaries.fulfilled, (state, action) => {
                state.banks = action.payload.banks;
                state.insurances = action.payload.insurances;
                state.requestTypes = action.payload.requestTypes;
                state.regions = action.payload.regions;
            })
            .addCase(fetchInsurancesDictionary.fulfilled, (state, action) => {
                state.insurances = action.payload;
            })
            .addCase(fetchRequestTypesDictionary.fulfilled, (state, action) => {
                state.requestTypes = action.payload;
            })
            .addCase(fetchRegions.fulfilled, (state, action) => {
                state.regions = action.payload;
            })
            .addCase(addEditRegion.fulfilled, (state, action) => {
                //TODO Добавить логику после изменения региона
                const editedRegion = state.regions.find(region => region.id === action.payload.id);
                if (editedRegion) {
                    state.regions = state.regions.map(region => {
                        if (region.id === action.payload.id)
                            return action.payload;
                        else
                            return region;
                    });
                } else {
                    const regionList = [...state.regions];
                    regionList.push(action.payload);
                    regionList.sort((a, b) => a.id - b.id);
                    state.regions = regionList;
                };
            })
            .addCase(deleteRegion.fulfilled, (state, action) => {
                state.regions = state.regions.filter(x => x.id !== action.payload);
            })
            .addCase(fetchInsutanceConditionsDictionary.fulfilled, (state, action) => {
                state.insutanceConditions = action.payload;
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
export const { } = dictionarySlice.actions

export default dictionarySlice.reducer

function isError(action) {
    return action.type.endsWith('rejected') && action.type.startsWith('dictionary');
};

function isPending(action) {
    return action.type.endsWith('pending') && action.type.startsWith('dictionary');
};

function isFulfilled(action) {
    return action.type.endsWith('fulfilled') && action.type.startsWith('dictionary');
};


