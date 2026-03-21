import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SignupPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../routes/authRoutes', () => ({
  signup: jest.fn(),
}));

describe('Signup Page', () => {
  it('renders step 1 of signup form properly', () => {
    render(<SignupPage />);
    
    expect(screen.getByText(/Register your/i)).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. kasun_pharm')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@pharmacy.lk')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });
});
