import { configureStore } from "@reduxjs/toolkit";
import { chatApi } from "@/store/pages/chat/pages/storeApi";
import { authApi } from "./pages/auth/registration/registerApi";
import { ReelsApi } from "./pages/reels/ReelsApi";
import { settingApi } from './pages/setting/settingApi'
import { muslimApi } from "./pages/home/muslimApi";
import { notificationApi } from "./pages/notification/notification";

import { profileApi } from "./pages/profile/ProfileApi";

export const store = configureStore({
  reducer: {
    [chatApi.reducerPath]: chatApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [muslimApi.reducerPath]: muslimApi.reducer,

    [settingApi.reducerPath]: settingApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,


    [profileApi.reducerPath]: profileApi.reducer,
    [ReelsApi.reducerPath]: ReelsApi.reducer,
    [settingApi.reducerPath]: settingApi.reducer,
  },


  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(chatApi.middleware)
      .concat(authApi.middleware)
      .concat(muslimApi.middleware)
      .concat(profileApi.middleware)
      .concat(ReelsApi.middleware)
      .concat(settingApi.middleware)
      .concat(notificationApi.middleware)

});
