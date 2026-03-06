import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AuthForm from './AuthForm';

// Mock useAuth hook
const mockLogin = jest.fn();
const mockSignUp = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    signUp: mockSignUp,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Wrapper bọc MemoryRouter vì AuthForm dùng useNavigate
const renderAuthForm = () =>
  render(
    <MemoryRouter>
      <AuthForm />
    </MemoryRouter>
  );

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render', () => {
    it('should render Login form by default', () => {
      renderAuthForm();

      expect(screen.getByText('🔐 Login')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('should render Register form after clicking toggle', async () => {
      renderAuthForm();

      await userEvent.click(screen.getByRole('button', { name: 'Register' }));

      expect(screen.getByText(' Register')).toBeInTheDocument();
    });

    it('should not show error message initially', () => {
      renderAuthForm();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Login flow', () => {
    it('should call login with email and password on submit', async () => {
      mockLogin.mockResolvedValue(undefined);
      renderAuthForm();

      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Login' }));

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should navigate to "/" after successful login', async () => {
      mockLogin.mockResolvedValue(undefined);
      renderAuthForm();

      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    });

    it('should display error message when login fails', async () => {
      mockLogin.mockRejectedValue(new Error('Email hoặc mật khẩu không đúng.'));
      renderAuthForm();

      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'wrong-password');
      await userEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() =>
        expect(screen.getByText('Email hoặc mật khẩu không đúng.')).toBeInTheDocument()
      );
    });

    it('should show loading state while logging in', async () => {
      // Login takes a while
      mockLogin.mockImplementation(() => new Promise((res) => setTimeout(res, 500)));
      renderAuthForm();

      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      expect(screen.getByRole('button', { name: '...' })).toBeDisabled();
    });
  });

  describe('SignUp flow', () => {
    it('should call signUp with email and password on submit', async () => {
      mockSignUp.mockResolvedValue(undefined);
      renderAuthForm();

      // Switch to Register mode
      await userEvent.click(screen.getByRole('button', { name: 'Register' }));
      await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Register' }));

      expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'password123');
    });

    it('should navigate to "/" after successful sign up', async () => {
      mockSignUp.mockResolvedValue(undefined);
      renderAuthForm();

      await userEvent.click(screen.getByRole('button', { name: 'Register' }));
      await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    });

    it('should display error message when sign up fails', async () => {
      mockSignUp.mockRejectedValue(new Error('Email đã được sử dụng. Thử email khác hoặc đăng nhập.'));
      renderAuthForm();

      await userEvent.click(screen.getByRole('button', { name: 'Register' }));
      await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() =>
        expect(screen.getByText('Email đã được sử dụng. Thử email khác hoặc đăng nhập.')).toBeInTheDocument()
      );
    });
  });

  describe('Form toggle', () => {
    it('should clear error when toggling between Login and Register', async () => {
      mockLogin.mockRejectedValue(new Error('Authentication failed'));
      renderAuthForm();

      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'wrong');
      await userEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => expect(screen.getByText('Authentication failed')).toBeInTheDocument());

      // Toggle form → error should clear
      await userEvent.click(screen.getByRole('button', { name: 'Register' }));

      expect(screen.queryByText('Authentication failed')).not.toBeInTheDocument();
    });
  });
});