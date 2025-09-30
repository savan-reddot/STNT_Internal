import { configureStore } from "@reduxjs/toolkit";
import reducer from "./reducer";
import { apiClient } from "./services";

export const store = configureStore({
  reducer: {
    auth: reducer,
    [apiClient.reducerPath]: apiClient.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiClient.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;