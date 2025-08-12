import { configureStore } from "@reduxjs/toolkit";
import { storeApi  } from "@/store/pages/chat/pages/storeApi";
import { authApi } from "./pages/auth/registration/registerApi";


export const store = configureStore({
  reducer: {
    [storeApi .reducerPath]: storeApi .reducer,
    [authApi.reducerPath]: authApi.reducer
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storeApi .middleware)
    .concat(authApi.middleware)
});

