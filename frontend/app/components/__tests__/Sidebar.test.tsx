import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Sidebar from '../Sidebar';

// Mock Next.js usePathname
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
}));

describe('Sidebar Component', () => {
  it('renders all navigation items', () => {
    render(<Sidebar collapsed={false} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Stock Management')).toBeInTheDocument();
    expect(screen.getByText('Prescription Queue')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Live Support')).toBeInTheDocument();
  });

  it('shows full branding and user info when not collapsed', () => {
    render(<Sidebar collapsed={false} />);
    
    expect(screen.getByText(/Healix/)).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('hides text elements when collapsed', () => {
    render(<Sidebar collapsed={true} />);
    
    // The "H" logo and user avatar "A" will still be visible
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    
    // Text labels should not be visible when collapsed
    expect(screen.queryByText('Healix')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
  });
});
