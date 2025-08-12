import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";



export const settingApi  = createApi({
  reducerPath: "storeApi ",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003/", 
  }),
  endpoints: (builder) => ({
    
  }),
});

export const {  } = settingApi ;
