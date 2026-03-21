import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import MOHAlertsPage from '../page';

jest.mock('../../routes/mohRoutes', () => ({
  getActiveAlerts: jest.fn(() => Promise.resolve([])),
  createMOHAlert: jest.fn(),
}));

describe('MOH Alerts Page', () => {
  it('renders MOH Alerts page correctly', async () => {
    render(<MOHAlertsPage />);
    
    expect(screen.getByText('MOH Alerts')).toBeInTheDocument();
    expect(screen.getByText('Broadcast disease alerts to all active patients via WhatsApp.')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Total Alerts')).toBeInTheDocument();
    });
  });
});
