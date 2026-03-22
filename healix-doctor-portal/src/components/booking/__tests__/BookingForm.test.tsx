import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingForm from '../BookingForm';
import { bookAppointment } from '../../../lib/api';

vi.mock('../../../lib/api', () => ({
  bookAppointment: vi.fn(),
}));

const mockDoctor = {
  id: 1,
  name: 'Dr. John Doe',
  initials: 'JD',
  specialization: 'Cardiologist',
  hospital: 'General Hospital',
  fee: 2500,
  serviceFee: 300,
  available: true,
  otherHospitals: []
};

describe('BookingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    doctor: mockDoctor,
    slot: '09:00 AM',
    slotId: 101,
    date: '2023-12-01',
    hospital: 'General Hospital',
    onBack: vi.fn()
  };

  it('renders correctly with doctor info', () => {
    render(<BookingForm {...defaultProps} />);
    expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
    expect(screen.getByText(/09:00 AM/)).toBeInTheDocument();
    expect(screen.getByText('Patient Details')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<BookingForm {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /reserve & proceed/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('NIC number is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Phone is required')).toBeInTheDocument();
      expect(screen.getByText('Address is required')).toBeInTheDocument();
    });
  });

  it('toggles to Passport validation when Passport is selected', async () => {
    render(<BookingForm {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Passport' }));
    fireEvent.click(screen.getByRole('button', { name: /reserve & proceed/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Passport number is required')).toBeInTheDocument();
      expect(screen.queryByText('NIC number is required')).not.toBeInTheDocument();
    });
  });

  it('submits form successfully when all valid data is provided', async () => {
    (bookAppointment as any).mockResolvedValueOnce({
      booking_ref: 'HXP123456',
      total_fee: 2800,
      service_fee: 300,
      payhere: {
        merchant_id: '12345',
        order_id: 'HXP123456',
        amount: '300.00',
        currency: 'LKR',
        hash: 'testhash',
        notify_url: '',
        return_url: '',
        cancel_url: '',
        items: 'Booking'
      }
    });

    render(<BookingForm {...defaultProps} />);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('e.g. Kamal Perera'), { target: { value: 'John Smith' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 199012345678'), { target: { value: '199012345678' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('077 123 4567'), { target: { value: '0771234567' } });
    fireEvent.change(screen.getByPlaceholderText('No. 12, Galle Rd, Colombo 03'), { target: { value: 'No. 12, Galle Rd, Colombo 03' } });
    
    fireEvent.click(screen.getByRole('button', { name: /reserve & proceed/i }));
    
    await waitFor(() => {
      expect(bookAppointment).toHaveBeenCalledWith({
        doctor_id: mockDoctor.id,
        hospital: 'General Hospital',
        slot_id: 101,
        slot_time: '09:00 AM',
        date: '2023-12-01',
        notes: '',
        patient: {
          full_name: 'John Smith',
          id_type: 'nic',
          id_number: '199012345678',
          email: 'john@example.com',
          phone: '0771234567',
          address: 'No. 12, Galle Rd, Colombo 03',
        }
      });
      // Should show the booking reserved screen
      expect(screen.getByText('Booking Reserved')).toBeInTheDocument();
      expect(screen.getByText('HXP123456')).toBeInTheDocument();
    });
  });
});
