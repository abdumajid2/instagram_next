import { storeApi } from "@/store/pages/chat/pages/storeApi";
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./pages/auth/registration/registerApi";
import { exploreApi } from "./pages/explore/exploreApi"; 
import { muslimApi } from "./pages/home/muslimApi";
import { profileApi } from "./pages/profile/ProfileApi";
import { ReelsApi } from "./pages/reels/ReelsApi";
import { settingApi } from './pages/setting/settingApi';

export const store = configureStore({
  reducer: {
    [storeApi.reducerPath]: storeApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [muslimApi.reducerPath]: muslimApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [ReelsApi.reducerPath]: ReelsApi.reducer,
    [settingApi.reducerPath]: settingApi.reducer,
    [exploreApi.reducerPath]: exploreApi.reducer,  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(storeApi.middleware)
      .concat(authApi.middleware)
      .concat(muslimApi.middleware)
      .concat(profileApi.middleware)
      .concat(ReelsApi.middleware)
      .concat(settingApi.middleware)
      .concat(exploreApi.middleware), 
});
