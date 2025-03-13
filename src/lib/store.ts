import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import idCurrentProjectReducer from '@/lib/features/idCurrentProjectSlice/idCurrentProjectSlice'

export const store = configureStore({
  reducer: {
    idCurrentProject: idCurrentProjectReducer
  }
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
