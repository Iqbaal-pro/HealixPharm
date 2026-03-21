import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SettingsPage from '../page';

jest.mock('../../routes/authRoutes', () => ({
  getPharmacyFromStorage: jest.fn(() => ({ id: 1, pharmacy_name: 'HealixPharm' })),
  getUserFromStorage: jest.fn(() => ({ id: 1, username: 'admin' })),
  getTokenFromStorage: jest.fn(() => 'fake-token'),
}));

jest.mock('../../routes/settingsRoutes', () => ({
  updatePharmacy: jest.fn(),
}));

describe('Settings Page', () => {
  it('renders Settings page and switches tabs correctly', async () => {
    render(<SettingsPage />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Pharmacy Profile')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('HealixPharm')).toBeInTheDocument();
    });

    // Switch to Account tab
    const accountTabBtn = screen.getByRole('button', { name: /Account/i });
    fireEvent.click(accountTabBtn);

    expect(screen.getByText('Account Details')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument(); // username value
  });
});
