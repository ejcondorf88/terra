import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../lib/auth-context';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const TestAuthFlow = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login('test@example.com', 'password123');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Logged In' : 'Logged Out'}
      </div>
      {user && (
        <div data-testid="user-details">
          <p>Name: {user.nombre}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.rol}</p>
        </div>
      )}
      <button data-testid="login-button" onClick={handleLogin}>
        Login
      </button>
      <button data-testid="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

describe('Authentication Integration Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockClear();
  });

  it('should complete full authentication flow successfully', async () => {
    const mockLoginResponse = {
      user: {
        id: 1,
        email: 'test@example.com',
        nombre: 'Test User',
        rol: 'productor',
      },
      access_token: 'mock-jwt-token-12345',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLoginResponse,
    });

    render(
      <AuthProvider>
        <TestAuthFlow />
      </AuthProvider>
    );

    // Initial state should be logged out
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(screen.queryByTestId('user-details')).not.toBeInTheDocument();

    // Click login button
    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    });

    // Check user details are displayed
    expect(screen.getByTestId('user-details')).toBeInTheDocument();
    expect(screen.getByText('Name: Test User')).toBeInTheDocument();
    expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Role: productor')).toBeInTheDocument();

    // Check token is stored in localStorage
    expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token-12345');
    expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockLoginResponse.user));

    // Click logout button
    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);

    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    });

    // Check user details are removed
    expect(screen.queryByTestId('user-details')).not.toBeInTheDocument();

    // Check localStorage is cleared
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('should handle login failure and maintain state', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestAuthFlow />
      </AuthProvider>
    );

    // Initial state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');

    // Attempt login
    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);

    // Wait for error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login failed:', 'Invalid credentials');
    });

    // State should remain logged out
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(screen.queryByTestId('user-details')).not.toBeInTheDocument();

    // localStorage should remain empty
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();

    consoleSpy.mockRestore();
  });

  it('should persist authentication across component re-renders', async () => {
    const mockLoginResponse = {
      user: {
        id: 1,
        email: 'persist@example.com',
        nombre: 'Persistent User',
        rol: 'inversor',
      },
      access_token: 'persistent-token',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLoginResponse,
    });

    const { rerender } = render(
      <AuthProvider>
        <TestAuthFlow />
      </AuthProvider>
    );

    // Login
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    });

    // Re-render component (simulating navigation)
    rerender(
      <AuthProvider>
        <TestAuthFlow />
      </AuthProvider>
    );

    // Authentication state should persist
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByText('Name: Persistent User')).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBe('persistent-token');
  });

  it('should restore authentication from localStorage on app restart', () => {
    // Simulate stored authentication data
    const storedUser = {
      id: 2,
      email: 'stored@example.com',
      nombre: 'Stored User',
      rol: 'admin',
    };
    const storedToken = 'stored-jwt-token';

    localStorage.setItem('auth_token', storedToken);
    localStorage.setItem('auth_user', JSON.stringify(storedUser));

    render(
      <AuthProvider>
        <TestAuthFlow />
      </AuthProvider>
    );

    // Should automatically restore authentication
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByText('Name: Stored User')).toBeInTheDocument();
    expect(screen.getByText('Email: stored@example.com')).toBeInTheDocument();
    expect(screen.getByText('Role: admin')).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network connection failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestAuthFlow />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login failed:', 'Network connection failed');
    });

    // State should remain unchanged
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(localStorage.getItem('auth_token')).toBeNull();

    consoleSpy.mockRestore();
  });

  it('should prevent multiple simultaneous login attempts', async () => {
    const mockLoginResponse = {
      user: {
        id: 1,
        email: 'test@example.com',
        nombre: 'Test User',
        rol: 'productor',
      },
      access_token: 'mock-jwt-token',
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockLoginResponse,
    });

    render(
      <AuthProvider>
        <TestAuthFlow />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId('login-button');

    // Click login multiple times rapidly
    fireEvent.click(loginButton);
    fireEvent.click(loginButton);
    fireEvent.click(loginButton);

    // Should only make one API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});