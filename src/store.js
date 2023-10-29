import { configureStore } from '@reduxjs/toolkit';
import orderbookReducer from './components/orderbookDataProcess';

export const store = configureStore({
  reducer: {
    orderbook: orderbookReducer,
  },
});