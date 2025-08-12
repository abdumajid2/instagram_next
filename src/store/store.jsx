import { configureStore } from "@reduxjs/toolkit";
import { storeApi } from "@/store/pages/chat/pages/storeApi";
import { authApi } from "./pages/auth/registration/registerApi";
import { muslimApi } from "./pages/home/muslimApi";
import { ReelsApi } from "./pages/reels/ReelsApi";

export const store = configureStore({
  reducer: {
    [storeApi.reducerPath]: storeApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [muslimApi.reducerPath]: muslimApi.reducer,
    [ReelsApi.reducerPath]: ReelsApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(storeApi.middleware)
      .concat(authApi.middleware)
      .concat(muslimApi.middleware)
      .concat(ReelsApi.middleware)
});
