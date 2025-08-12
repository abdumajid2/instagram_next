import { configureStore } from "@reduxjs/toolkit";
import { storeApi } from "@/store/pages/chat/pages/storeApi";
import { authApi } from "./pages/auth/registration/registerApi";
import { ReelsApi } from "./pages/reels/ReelsApi";
import { settingApi } from './pages/setting/settingApi'
import { muslimApi } from "./pages/home/muslimApi";

import { profileApi } from "./pages/profile/ProfileApi";

export const store = configureStore({
  reducer: {
    [storeApi.reducerPath]: storeApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [muslimApi.reducerPath]: muslimApi.reducer,

    [profileApi.reducerPath]: profileApi.reducer,
    [ReelsApi.reducerPath]: ReelsApi.reducer,
    [settingApi.reducerPath]: settingApi.reducer,
  },


  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(storeApi.middleware)
      .concat(authApi.middleware)
      .concat(muslimApi.middleware)

      .concat(profileApi.middleware)

      .concat(ReelsApi.middleware)
      .concat(settingApi.middleware)

});
