import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../stores/authStore';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: { headers: { common: {} } },
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should update user', () => {
    const { updateUser } = useAuthStore.getState();

    act(() => {
      updateUser({ nickname: 'Test User', role: 'VIP_HOST' });
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual({
      nickname: 'Test User',
      role: 'VIP_HOST',
    });
  });

  it('should clear error', () => {
    useAuthStore.setState({ error: 'Test error' });

    const { clearError } = useAuthStore.getState();
    act(() => {
      clearError();
    });

    const state = useAuthStore.getState();
    expect(state.error).toBeNull();
  });

  it('should logout and reset state', () => {
    useAuthStore.setState({
      user: { id: '1', nickname: 'Test' },
      accessToken: 'token123',
      refreshToken: 'refresh123',
      isAuthenticated: true,
    });

    const { logout } = useAuthStore.getState();
    act(() => {
      logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

describe('App Store', () => {
  beforeEach(() => {
    useAppStore.setState({
      greeting: '',
      materials: [],
      currentDate: new Date().toISOString().split('T')[0],
      dailyTasks: [],
      taskProgress: { personalityTest: false, simulation: false, materialView: 0 },
      simulationSessions: [],
      currentSession: null,
    });
  });

  it('should have initial state', () => {
    const state = useAppStore.getState();

    expect(state.greeting).toBe('');
    expect(state.materials).toEqual([]);
    expect(state.dailyTasks).toEqual([]);
    expect(state.taskProgress.personalityTest).toBe(false);
    expect(state.taskProgress.simulation).toBe(false);
    expect(state.taskProgress.materialView).toBe(0);
  });

  it('should set greeting', () => {
    const { setGreeting } = useAppStore.getState();

    act(() => {
      setGreeting('晚上好，张经理。期待您今日的精彩表现！');
    });

    const state = useAppStore.getState();
    expect(state.greeting).toBe('晚上好，张经理。期待您今日的精彩表现！');
  });

  it('should set materials', () => {
    const { setMaterials } = useAppStore.getState();
    const testMaterials = [
      { id: '1', title: 'Test Material', type: 'IMAGE' },
    ];

    act(() => {
      setMaterials(testMaterials);
    });

    const state = useAppStore.getState();
    expect(state.materials).toEqual(testMaterials);
  });

  it('should update task progress', () => {
    const { updateTaskProgress } = useAppStore.getState();

    act(() => {
      updateTaskProgress('PERSONALITY_TEST', true);
    });

    const state = useAppStore.getState();
    expect(state.taskProgress.personalityTest).toBe(true);
  });

  it('should add message to session', () => {
    const { setCurrentSession, addMessageToSession } = useAppStore.getState();

    act(() => {
      setCurrentSession({
        sessionId: '1',
        messages: [{ sender: 'ai', message: 'Hello' }],
      });
    });

    act(() => {
      addMessageToSession({ sender: 'user', message: 'Hi there' });
    });

    const state = useAppStore.getState();
    expect(state.currentSession.messages).toHaveLength(2);
    expect(state.currentSession.messages[1].sender).toBe('user');
  });

  it('should reset state', () => {
    const { setGreeting, setMaterials, reset } = useAppStore.getState();

    act(() => {
      setGreeting('Test');
      setMaterials([{ id: '1' }]);
      reset();
    });

    const state = useAppStore.getState();
    expect(state.greeting).toBe('');
    expect(state.materials).toEqual([]);
  });
});
