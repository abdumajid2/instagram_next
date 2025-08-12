import { configureStore } from "@reduxjs/toolkit";
import { storeApi } from "@/store/pages/chat/pages/storeApi";
import { authApi } from "./pages/auth/registration/registerApi";
<<<<<<< HEAD
import { ReelsApi } from "./pages/reels/ReelsApi";

export const store = configureStore({
  reducer: {
    [storeApi .reducerPath]: storeApi .reducer,
    [authApi.reducerPath]: authApi.reducer,
    [ReelsApi.reducerPath]: ReelsApi.reducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storeApi .middleware)
    .concat(authApi.middleware).concat(ReelsApi.middleware)
});
=======

import { settingApi } from './pages/setting/settingApi'

import { muslimApi } from "./pages/home/muslimApi";




export const store = configureStore({
  reducer: {
    [storeApi.reducerPath]: storeApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [muslimApi.reducerPath]: muslimApi.reducer,
    [settingApi.reducerPath]: settingApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>

    

    getDefaultMiddleware()
      .concat(storeApi.middleware)
      .concat(authApi.middleware)
      .concat(muslimApi.middleware)
      .concat(settingApi.middleware)

});
>>>>>>> 2ddd73064b2e268dbd6ca1fc6b8dc4e2e2f20a77
