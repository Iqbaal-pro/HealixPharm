import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import StockManagementPage from '../page';

jest.mock('../../routes/inventoryRoutes', () => ({
  getInventory: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../../routes/batchRoutes', () => ({
  getBatches: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../../routes/analyticsRoutes', () => ({
  getReorderRecommendations: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../../routes/authRoutes', () => ({
  getTokenFromStorage: jest.fn(() => 'fake-token'),
}));

describe('Stock Management Page', () => {
  it('renders Stock Management page and modules correctly', async () => {
    render(<StockManagementPage />);
    
    expect(screen.getAllByText('Stock Management')[0]).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Batches')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Total stock')).toBeInTheDocument();
    });
  });
});
