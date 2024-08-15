import { createContext, useContext } from 'react';
import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://.bookingbug.com/api/v5/',
  headers: {
    'App-Id': '',
    'App-Key': ''
  }
});

// Create a context with the Axios instance
const FetchContext = createContext(axiosInstance);

// Export the context and a custom hook for consuming the context
const useAxios = () => useContext(FetchContext);

export { FetchContext, useAxios };
