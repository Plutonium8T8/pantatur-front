//import { Middleware } from 'redux'
//import { signalSlice } from './signalSlice';

//const signalMiddleware: Middleware = store => next => action => {
//    if (!signalSlice.startConnecting.match(action)) {
//        return next(action);
//    }


//    console.log("access token", action?.payload?.accessToken)
//    //const connection = hubConnection("http://127.0.0.1/hubs", { useDefaultPath: false })
//    //const proxy = connection.createHubProxy("notifications")

//    //proxy.on("action", function (data) {
//    //    //dispatch(setStatus(data))
//    //    console.log("action", data);
//    //});

//    next(action);
//}

//export default signalMiddleware;
