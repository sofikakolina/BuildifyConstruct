import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store';

// Определяем тип для состояния
export interface IdCurrentProjectState {
  value: string;
}

// Функция для загрузки состояния из localStorage
const loadStateFromLocalStorage = (): IdCurrentProjectState => {
  try {
    const savedState = localStorage.getItem('idCurrentProject');
    if (savedState) {
      return { value: JSON.parse(savedState) };
    }
  } catch (error) {
    console.error('Ошибка при загрузке состояния из localStorage:', error);
  }
  return { value: '' }; // Возвращаем начальное состояние, если в localStorage ничего нет
};

// Инициализируем состояние, загружая его из localStorage
const initialState: IdCurrentProjectState = loadStateFromLocalStorage();

// Создаём slice
export const idCurrentProjectSlice = createSlice({
  name: 'idCurrentProject',
  initialState,
  reducers: {
    // Устанавливаем значение idCurrentProject
    setIdCurrentProject: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
      // Сохраняем новое значение в localStorage
      try {
        localStorage.setItem('idCurrentProject', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Ошибка при сохранении состояния в localStorage:', error);
      }
    },
    // Очищаем значение idCurrentProject
    cleanIdCurrentProject: (state) => {
      state.value = '';
      // Удаляем значение из localStorage
      try {
        localStorage.removeItem('idCurrentProject');
      } catch (error) {
        console.error('Ошибка при удалении состояния из localStorage:', error);
      }
    },
  },
});

// Экспортируем actions
export const { setIdCurrentProject, cleanIdCurrentProject } = idCurrentProjectSlice.actions;

// Селектор для получения значения idCurrentProject
export const selectIdCurrentProject = (state: RootState) => state.idCurrentProject.value;

// Экспортируем reducer
export default idCurrentProjectSlice.reducer;