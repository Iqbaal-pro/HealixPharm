import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import SlotsPage from '../page';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../../../routes/channelingRoutes', () => ({
  getSlots: jest.fn(() => Promise.resolve([])),
  addSlot: jest.fn(),
  deleteSlot: jest.fn(),
  getDoctors: jest.fn(() => Promise.resolve([{ id: 1, name: 'Dr. Jane Smith', specialization: 'Neurologist', hospital: 'Lanka Hospital', otherHospitals: [] }])),
  addOtherHospital: jest.fn(),
  deleteOtherHospital: jest.fn(),
}));

describe('Doctor Slots Page', () => {
  it('renders correctly and fetches data', async () => {
    render(<SlotsPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument(); // Initial state

    await waitFor(() => {
      expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Neurologist · Lanka Hospital')).toBeInTheDocument();
      expect(screen.getByText('Total Slots')).toBeInTheDocument();
    });
  });
});
