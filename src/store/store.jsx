import { configureStore } from "@reduxjs/toolkit";
import { storeApi } from "@/store/pages/chat/pages/storeApi";
import { authApi } from "./pages/auth/registration/registerApi";

import { settingApi } from './pages/setting/settingApi'


export const store = configureStore({
  reducer: {
    [storeApi .reducerPath]: storeApi .reducer,
    [authApi.reducerPath]: authApi.reducer,
    [settingApi.reducer]: settingApi.reducer

import { muslimApi } from "./pages/home/muslimApi";

export const store = configureStore({
  reducer: {
    [storeApi.reducerPath]: storeApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [muslimApi.reducerPath]: muslimApi.reducer,

  },

  middleware: (getDefaultMiddleware) =>

    getDefaultMiddleware().concat(storeApi .middleware)
    .concat(authApi.middleware).concat(settingApi.middleware)

    getDefaultMiddleware()
      .concat(storeApi.middleware)
      .concat(authApi.middleware)
      .concat(muslimApi.middleware)

});
