import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  greeting: '',
  materials: [],
  currentDate: new Date().toISOString().split('T')[0],

  dailyTasks: [],
  taskProgress: { personalityTest: false, simulation: false, materialView: 0 },

  simulationSessions: [],
  currentSession: null,

  setGreeting: (greeting) => set({ greeting }),
  setMaterials: (materials) => set({ materials }),
  setCurrentDate: (date) => set({ currentDate: date }),

  setDailyTasks: (tasks) => set({ dailyTasks: tasks }),
  updateTaskProgress: (taskType, completed) => {
    set((state) => {
      const newProgress = { ...state.taskProgress };
      if (taskType === 'PERSONALITY_TEST') {
        newProgress.personalityTest = completed;
      } else if (taskType === 'SIMULATION') {
        newProgress.simulation = completed;
      } else if (taskType === 'MATERIAL_VIEW') {
        newProgress.materialView = completed ? 3 : 0;
      }
      return { taskProgress: newProgress };
    });
  },

  setSimulationSessions: (sessions) => set({ simulationSessions: sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  addMessageToSession: (message) => {
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          messages: [...state.currentSession.messages, message],
        },
      };
    });
  },

  reset: () =>
    set({
      greeting: '',
      materials: [],
      currentDate: new Date().toISOString().split('T')[0],
      dailyTasks: [],
      taskProgress: { personalityTest: false, simulation: false, materialView: 0 },
      simulationSessions: [],
      currentSession: null,
    }),
}));
