import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { act } from 'react-dom/test-utils';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const TestComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? `User: ${user.nombre} (${user.rol})` : 'No user'}
      </div>
      <button
        data-testid="login-btn"
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset fetch mock
    mockFetch.mockClear();
  });

  it('should provide authentication context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      user: {
        id: 1,
        email: 'test@example.com',
        nombre: 'Test User',
        rol: 'productor',
      },
      access_token: 'mock-jwt-token',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId('login-btn');

    act(() => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('User: Test User (productor)');
    });

    // Check if token was stored in localStorage
    expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
  });

  it('should handle login failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    // Mock console.error to avoid test output pollution
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId('login-btn');

    act(() => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Login failed:', 'Invalid credentials');

    consoleSpy.mockRestore();
  });

  it('should handle logout', async () => {
    // First login
    const mockResponse = {
      user: {
        id: 1,
        email: 'test@example.com',
        nombre: 'Test User',
        rol: 'productor',
      },
      access_token: 'mock-jwt-token',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId('login-btn');

    act(() => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Now logout
    const logoutButton = screen.getByTestId('logout-btn');

    act(() => {
      fireEvent.click(logoutButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
    });

    // Check if token was removed from localStorage
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should restore authentication from localStorage on mount', () => {
    const storedUser = {
      id: 1,
      email: 'stored@example.com',
      nombre: 'Stored User',
      rol: 'inversor',
    };

    localStorage.setItem('auth_token', 'stored-token');
    localStorage.setItem('auth_user', JSON.stringify(storedUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('User: Stored User (inversor)');
  });

  it('should handle network errors during login', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId('login-btn');

    act(() => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Login failed:', 'Network error');

    consoleSpy.mockRestore();
  });
});