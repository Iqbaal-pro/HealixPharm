import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import PrescriptionPage from '../page';

jest.mock('../../routes/prescriptionRoutes', () => ({
  getPendingPrescriptions: jest.fn(() => Promise.resolve([])),
  getAllPrescriptions: jest.fn(() => Promise.resolve([])),
  getIssuedToday: jest.fn(() => Promise.resolve([])),
  createPrescription: jest.fn(),
  issueMedicine: jest.fn(),
  getOrderDetail: jest.fn(),
  getPresignedUrl: jest.fn(),
  uploadPrescriptionImage: jest.fn(),
  checkImageClarity: jest.fn(),
}));

jest.mock('../../routes/reminderRoutes', () => ({
  getPendingReminders: jest.fn(() => Promise.resolve([])),
  sendOneTimeReminder: jest.fn(),
  markContinuous: jest.fn(),
  processReminders: jest.fn(),
}));

jest.mock('../../routes/orderRoutes', () => ({
  searchMedicines: jest.fn(),
}));

describe('Prescription Queue Page', () => {
  it('renders the Prescriptions page with default queue tab', async () => {
    render(<PrescriptionPage />);
    
    expect(screen.getByText('Prescriptions')).toBeInTheDocument();
    expect(screen.getByText('Ready to Dispense')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No orders ready to dispense')).toBeInTheDocument();
    });
  });
});
