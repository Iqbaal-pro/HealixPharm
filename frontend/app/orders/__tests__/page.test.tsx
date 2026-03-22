import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import OrdersPage from '../page';

jest.mock('../../routes/orderRoutes', () => ({
  getOrders: jest.fn(() => Promise.resolve([])),
  getOrderDetail: jest.fn(),
  searchMedicines: jest.fn(),
  approveOrder: jest.fn(),
  updateOrderStatus: jest.fn(),
  confirmPayment: jest.fn(),
  fulfillOrder: jest.fn(),
  cancelOrder: jest.fn(),
}));

describe('Orders Page', () => {
  it('renders Orders page and fetches orders', async () => {
    render(<OrdersPage />);
    
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp bot orders/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/No orders yet/i)).toBeInTheDocument(); // since list is empty
    });
  });
});
