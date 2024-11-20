
//import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const sendMessage = (txt: string): Action => (dispatch, getState, invoke) => {
    invoke('Send', txt)
};

//export const signalSlice = createSlice({
//  name: "signal",
//  initialState: { 
//    status: {},
//  },
//  reducers: {
//    //setStatus(state, action ) {
//    //  state.status = action.payload
//    //}
//  }
//});

//export const { } = signalSlice.actions;
//export default signalSlice.reducer;


