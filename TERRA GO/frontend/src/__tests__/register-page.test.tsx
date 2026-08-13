import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../app/auth/register/page';
import { AuthProvider } from '../lib/auth-context';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('RegisterPage', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should render registration form', () => {
    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo de usuario/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
    expect(screen.getByText(/¿ya tienes cuenta\?/i)).toBeInTheDocument();
  });

  it('should handle successful registration', async () => {
    const mockResponse = {
      user: {
        id: 1,
        email: 'newuser@example.com',
        nombre: 'New User',
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
        <RegisterPage />
      </AuthProvider>
    );

    const nombreInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const rolSelect = screen.getByLabelText(/tipo de usuario/i);
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    fireEvent.change(nombreInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(rolSelect, { target: { value: 'productor' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          rol: 'productor',
        }),
      });
    });
  });

  it('should show error message on registration failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'User already exists' }),
    });

    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    const nombreInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const rolSelect = screen.getByLabelText(/tipo de usuario/i);
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    fireEvent.change(nombreInput, { target: { value: 'Existing User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(rolSelect, { target: { value: 'productor' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('should validate email format', async () => {
    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    const nombreInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const rolSelect = screen.getByLabelText(/tipo de usuario/i);
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    fireEvent.change(nombreInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(rolSelect, { target: { value: 'productor' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});