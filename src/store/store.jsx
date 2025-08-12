import { configureStore } from "@reduxjs/toolkit";
import { storeApi } from "@/store/pages/chat/pages/storeApi";
import { authApi } from "./pages/auth/registration/registerApi";

import { settingApi } from './pages/setting/settingApi'

import { muslimApi } from "./pages/home/muslimApi";
import { notificationApi } from "./pages/notification/notification";




export const store = configureStore({
  reducer: {
    [storeApi.reducerPath]: storeApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [muslimApi.reducerPath]: muslimApi.reducer,
    [settingApi.reducerPath]: settingApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,

  },

  middleware: (getDefaultMiddleware) =>

    

    getDefaultMiddleware()
      .concat(storeApi.middleware)
      .concat(authApi.middleware)
      .concat(muslimApi.middleware)
      .concat(settingApi.middleware)
      .concat(notificationApi.middleware)

});
