import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import SupportPage from '../page';

jest.mock('../../routes/supportRoutes', () => ({
  getSupportQueue: jest.fn(() => Promise.resolve([])),
  acceptTicket: jest.fn(),
  sendAgentMessage: jest.fn(),
  closeTicket: jest.fn(),
  getTicketMessages: jest.fn(),
}));

// Mock scroll functions safely
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('Support Page', () => {
  it('renders Support page correctly', async () => {
    render(<SupportPage />);
    
    expect(screen.getByText('Live Support')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp patient support queue')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Waiting Queue')).toBeInTheDocument();
      expect(screen.getByText(/No patients waiting/i)).toBeInTheDocument(); // since queue is empty
    });
  });
});
