import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import AddDoctorPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../../routes/channelingRoutes', () => ({
  addDoctor: jest.fn(),
  addOtherHospital: jest.fn(),
}));

describe('Add Doctor Page', () => {
  it('renders correctly', async () => {
    render(<AddDoctorPage />);
    
    expect(screen.getAllByText('Add Doctor')[0]).toBeInTheDocument();
    expect(screen.getByText('This doctor will appear in the patient booking portal.')).toBeInTheDocument();
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Main Hospital')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Dr. Ayesha Perera')).toBeInTheDocument();
    });
  });
});
