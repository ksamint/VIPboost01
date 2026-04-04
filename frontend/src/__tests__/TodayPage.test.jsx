import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TodayPage from '../pages/TodayPage';
import * as api from '../services/api';
import { useAuthStore } from '../stores/authStore';

vi.mock('../services/api');
vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const renderTodayPage = () => {
  return render(
    <BrowserRouter>
      <TodayPage />
    </BrowserRouter>
  );
};

describe('TodayPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.mockReturnValue({
      user: { nickname: 'Test User', id: '1' },
    });

    api.default = {
      get: vi.fn(),
    };
  });

  it('should render greeting when loaded', async () => {
    api.default.get.mockResolvedValueOnce({
      data: {
        greeting: '晚上好，张经理。期待您今日的精彩表现！',
        materials: [],
        date: '2024-01-15',
      },
    });

    renderTodayPage();

    await waitFor(() => {
      expect(screen.getByText(/晚上好/)).toBeTruthy();
    });
  });

  it('should show loading state initially', () => {
    api.default.get.mockImplementation(() => new Promise(() => {}));

    renderTodayPage();

    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('should render calendar view button', async () => {
    api.default.get.mockResolvedValueOnce({
      data: { greeting: 'Hello', materials: [], date: '2024-01-15' },
    });

    renderTodayPage();

    await waitFor(() => {
      expect(screen.getByText('日历视图')).toBeTruthy();
    });
  });

  it('should show materials section title', async () => {
    api.default.get.mockResolvedValueOnce({
      data: { greeting: 'Hello', materials: [], date: '2024-01-15' },
    });

    renderTodayPage();

    await waitFor(() => {
      expect(screen.getByText('今日素材')).toBeTruthy();
    });
  });

  it('should display empty state when no materials', async () => {
    api.default.get.mockResolvedValueOnce({
      data: { greeting: 'Hello', materials: [], date: '2024-01-15' },
    });

    renderTodayPage();

    await waitFor(() => {
      expect(screen.getByText('今日暂无新素材')).toBeTruthy();
    });
  });

  it('should display materials when available', async () => {
    const mockMaterials = [
      {
        id: '1',
        title: '周末活动海报',
        type: 'IMAGE',
        content: '精彩周末活动等你来',
        thumbnailUrl: null,
        mediaUrl: null,
      },
      {
        id: '2',
        title: 'VIP专属福利',
        type: 'TEXT',
        content: '尊享VIP专属福利',
        thumbnailUrl: null,
        mediaUrl: null,
      },
    ];

    api.default.get.mockResolvedValueOnce({
      data: { greeting: 'Hello', materials: mockMaterials, date: '2024-01-15' },
    });

    renderTodayPage();

    await waitFor(() => {
      expect(screen.getByText('周末活动海报')).toBeTruthy();
      expect(screen.getByText('VIP专属福利')).toBeTruthy();
    });
  });

  it('should show copy and share buttons', async () => {
    const mockMaterials = [
      {
        id: '1',
        title: 'Test Material',
        type: 'TEXT',
        content: 'Test content',
        thumbnailUrl: null,
        mediaUrl: null,
      },
    ];

    api.default.get.mockResolvedValueOnce({
      data: { greeting: 'Hello', materials: mockMaterials, date: '2024-01-15' },
    });

    renderTodayPage();

    await waitFor(() => {
      expect(screen.getByText('复制')).toBeTruthy();
      expect(screen.getByText('转发')).toBeTruthy();
    });
  });
});
