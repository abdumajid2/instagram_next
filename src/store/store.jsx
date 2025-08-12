import { configureStore } from "@reduxjs/toolkit";
import { storeApi  } from "@/store/pages/chat/pages/storeApi";


export const store = configureStore({
  reducer: {
    [storeApi .reducerPath]: storeApi .reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storeApi .middleware),
});
