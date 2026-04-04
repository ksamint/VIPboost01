import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { useAuthStore } from '../stores/authStore';

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: null,
      clearError: vi.fn(),
    });
  });

  it('should render login form', () => {
    renderLoginPage();

    expect(screen.getByPlaceholderText('请输入用户名')).toBeTruthy();
    expect(screen.getByPlaceholderText('请输入密码')).toBeTruthy();
    expect(screen.getByRole('button', { name: '登录' })).toBeTruthy();
  });

  it('should show title', () => {
    renderLoginPage();

    expect(screen.getByText('VIP Host AI')).toBeTruthy();
    expect(screen.getByText('赋能一线公关团队')).toBeTruthy();
  });

  it('should update input fields', () => {
    renderLoginPage();

    const usernameInput = screen.getByPlaceholderText('请输入用户名');
    const passwordInput = screen.getByPlaceholderText('请输入密码');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('should toggle password visibility', () => {
    renderLoginPage();

    const toggleButton = screen.getByRole('button', { name: '' });
    const passwordInput = screen.getByPlaceholderText('请输入密码');

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe('text');
  });

  it('should show error message when error exists', () => {
    useAuthStore.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: 'Invalid credentials',
      clearError: vi.fn(),
    });

    renderLoginPage();

    expect(screen.getByText('Invalid credentials')).toBeTruthy();
  });

  it('should show loading state', () => {
    useAuthStore.mockReturnValue({
      login: vi.fn(),
      isLoading: true,
      error: null,
      clearError: vi.fn(),
    });

    renderLoginPage();

    expect(screen.getByText('登录中...')).toBeTruthy();
  });

  it('should have privacy policy link', () => {
    renderLoginPage();

    expect(screen.getByText('《隐私政策》')).toBeTruthy();
    expect(screen.getByText('《服务条款》')).toBeTruthy();
  });
});
