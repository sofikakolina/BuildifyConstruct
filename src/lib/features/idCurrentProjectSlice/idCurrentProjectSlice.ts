import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/store'

// Define a type for the slice state
export interface IdCurrentProjectState {
  value: string
}

// Define the initial state using that type
const initialState: IdCurrentProjectState = {
  value: ''
}
// idCurrentProject
export const idCurrentProjectSlice = createSlice({
  name: 'idCurrentProject',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // setIdCurrentProject: state => {
    //     state.value += 1
    // },
    setIdCurrentProject: (state, action: PayloadAction<string>) => {
        state.value = action.payload
    },
    cleanIdCurrentProject: state => {
      state.value = ''
    }
  }
})

export const { setIdCurrentProject, cleanIdCurrentProject } = idCurrentProjectSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectIdCurrentProject = (state: RootState) => state.idCurrentProject.value

export default idCurrentProjectSlice.reducer