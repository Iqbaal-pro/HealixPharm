import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../page';

jest.mock('../../routes/authRoutes', () => ({ getTokenFromStorage: jest.fn(() => 'mock-token') }));
jest.mock('../../routes/inventoryRoutes', () => ({ getInventory: jest.fn(() => Promise.resolve([])) }));
jest.mock('../../routes/orderRoutes', () => ({ getOrders: jest.fn(() => Promise.resolve([])) }));
jest.mock('../../routes/alertRoutes', () => ({ getAlerts: jest.fn(() => Promise.resolve([])) }));
jest.mock('../../routes/analyticsRoutes', () => ({ getReorderRecommendations: jest.fn(() => Promise.resolve([])) }));
jest.mock('../../routes/prescriptionRoutes', () => ({ getAllPrescriptions: jest.fn(() => Promise.resolve([])) }));

describe('Dashboard Page', () => {
  it('renders dashboard headers and stat cards', async () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Recent Prescriptions')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Total Prescriptions')).toBeInTheDocument();
      expect(screen.getByText('Available Stock')).toBeInTheDocument();
    });
  });
});
