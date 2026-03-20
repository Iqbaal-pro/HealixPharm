import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PatientsPage from '../page';

jest.mock('../../routes/patientRoutes', () => ({
  getPatients: jest.fn(() => Promise.resolve([])),
  createPatient: jest.fn(),
  updateConsent: jest.fn(),
}));

describe('Patients Page', () => {
  it('renders Patients page and allows adding new patient', async () => {
    render(<PatientsPage />);
    
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Manage patients and SMS reminder consent')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('+ New Patient')).toBeInTheDocument();
    });

    const newPatientBtn = screen.getByText('+ New Patient');
    fireEvent.click(newPatientBtn);

    expect(screen.getByText('Save Patient')).toBeInTheDocument();
  });
});
