import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import ChannellingPage from '../page';

jest.mock('../../routes/channelingRoutes', () => ({
  getDoctors: jest.fn(() => Promise.resolve([])),
  getChannellingSettings: jest.fn(() => Promise.resolve({ channelling_service_charge: 150 })),
}));

describe('Channelling Page', () => {
  it('renders E-Channelling page correctly', async () => {
    render(<ChannellingPage />);
    
    expect(screen.getByText('E-Channelling')).toBeInTheDocument();
    expect(screen.getByText('Manage doctors and time slots for the patient booking portal.')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Total Doctors')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });
});
