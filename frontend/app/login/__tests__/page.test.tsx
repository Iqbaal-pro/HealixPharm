import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../routes/authRoutes', () => ({
  login: jest.fn(),
  saveAuthToStorage: jest.fn(),
}));

describe('Login Page', () => {
  it('renders login form properly', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('username or you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('shows error when fields are empty on submit', () => {
    render(<LoginPage />);
    
    const submitBtn = screen.getByRole('button', { name: /Sign in/i });
    fireEvent.submit(submitBtn);
    
    expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
  });
});
